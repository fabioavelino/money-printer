require("./helpers/array_prototype");
const DataHelper = require("./helpers/data_helper");
const FakePortfolio = require("./portfolio/fake_portfolio");
const generateDataFromBinance = require("./services/binance/data_handlers/generateData");
const generateDataFromPolygon = require("./services/polygon/data_handlers/generateData");
const generateDataFromTiingo = require("./services/tiingo/data_handlers/generateData");
const generateDataFromAlphavantage = require("./services/alphavantage/data_handlers/generateData");
const strategy_trend_based_ma = require("./strategies/strategy_trend_based_ma");
const strategy_zlema = require("./strategies/adaptive_zlema");
const strategy_sinewave = require("./strategies/strategy_sinewave");
const hodl_strategy = require("./strategies/hodl");
const simple_strategy_ma_trend = require("./strategies/simple_strategy_ma_trend");
const strategies = require("./strategies");
//const InstantLossSignal = require("./signals/instant_loss_signal");
const dayjs = require("dayjs");
const configs = require("./backtest/market_data_configs");
const { getSharpeRatio } = require("./helpers/portfolio_helper");
const { getHurst } = require("./helpers/my_helper");

const CHOSEN_CONFIG = configs.btc.lastyear;
const STRATEGY_TO_TEST = strategies.playground;

const SYMBOL_TO_TEST = CHOSEN_CONFIG.SYMBOL_TO_TEST;
const TIMESTAMP_TARGET = CHOSEN_CONFIG.TIMESTAMP_TARGET;
const TIMESTAMP_TARGET_TEST = CHOSEN_CONFIG.TIMESTAMP_TARGET_TEST;
const TIMESTAMP_END_TARGET = CHOSEN_CONFIG.TIMESTAMP_END_TARGET;

const simulateMarket = async (props1, props2) => {
  const portfolio = new FakePortfolio();
  //const maxLossSignal = MaxLossSignal({ maxLossPercentage: -7.7 / 100 }); //-4.8, -6.3 -6.5 -6.7 -7.7 -8.2
  const CRYPTO_CURRENCY = SYMBOL_TO_TEST.slice(0, 3);
  const strategy = STRATEGY_TO_TEST(true, {
    props1,
    props2,
  });
  //console.log("Before trading:", portfolio.fiat_portfolio);

  let data = [];
  switch (CHOSEN_CONFIG.SERVICE) {
    case "binance":
      data = await generateDataFromBinance(
        SYMBOL_TO_TEST,
        strategy.RECOMMENDED_INTERVAL,
        TIMESTAMP_TARGET,
        TIMESTAMP_END_TARGET
      );
      break;
    case "polygon":
      data = await generateDataFromPolygon(
        SYMBOL_TO_TEST,
        strategy.RECOMMENDED_INTERVAL,
        TIMESTAMP_TARGET,
        TIMESTAMP_END_TARGET
      );
      break;
    case "alphavantage":
      data = await generateDataFromAlphavantage(
        SYMBOL_TO_TEST,
        strategy.RECOMMENDED_INTERVAL
      );
      break;
    case "tiingo":
      data = await generateDataFromTiingo(
        SYMBOL_TO_TEST,
        TIMESTAMP_TARGET,
        "1d"
      );
      break;
    default:
      throw "NOT VALID SOURCE DATA";
  }
  const START =
    strategy.RECOMMENDED_INTERVAL === "1w" ? 5 : "1d" ? 370 : "1m" ? 1000 : 400; //29 ?
  let index = START;
  let nbOfTradingDays = 0;
  let returns = [];
  for (index; index < data.length; index++) {
    // Current data[index] values
    const current = data[index];
    const currentVolume = Number.parseFloat(current.volume);
    const currentCloseValue = Number.parseFloat(current.closeValue);
    const closeTime = current.closeTime;
    const closeValues = DataHelper.getCloseValues(data, index - START, index);
    const lowValues = DataHelper.getLowValues(data, index - START, index);
    const highValues = DataHelper.getHighValues(data, index - START, index);
    const hl2Values = DataHelper.getHL2Values(data, index - START, index);
    const ch2Values = DataHelper.getCH2Values(data, index - START, index);
    const heikenAshi = DataHelper.getHeikenAshi(data, index - START, index);
    const lastBuyTransaction =
      portfolio.buyTransactions[portfolio.buyTransactions.length - 1];
    const lastSellTransaction =
      portfolio.sellTransactions[portfolio.sellTransactions.length - 1];
    // Relevant analytical data
    let relevantAnalyticalData = {
      currentCloseValue,
      currentCloseTime: closeTime,
      currentVolume,
      closeValues,
      lowValues,
      highValues,
      heikenAshi,
      lastBuyTransaction,
      lastSellTransaction,
      hl2Values,
      ch2Values,
    };
    const timestampForComparison = TIMESTAMP_TARGET_TEST;
    if (timestampForComparison < dayjs(closeTime).valueOf()) {
      nbOfTradingDays++;
      let marketPortfolio = portfolio.market_portfolio;
      if (marketPortfolio === 0) {
        if (await strategy.isBuyingTime(relevantAnalyticalData)) {
          portfolio.buy(currentCloseValue, closeTime, relevantAnalyticalData);
        }
      } else {
        /* const isMaxLossSellSignal = maxLossSignal.isSellSignal(
          currentCloseValue,
          lastBuyTransaction.price
        ); */
        returns.push({
          date: closeTime,
          r:
            closeValues[closeValues.length - 1] /
              closeValues[closeValues.length - 2] -
            1,
        });
        const isSellingTime = await strategy.isSellingTime(
          relevantAnalyticalData
        );
        if (isSellingTime) {
          if (typeof isSellingTime === "number") {
            relevantAnalyticalData.currentCloseValue = isSellingTime;
            portfolio.sell(isSellingTime, closeTime, relevantAnalyticalData);
          } else {
            portfolio.sell(
              currentCloseValue,
              closeTime,
              relevantAnalyticalData
            );
          }
        }
      }
    }
  }
  if (portfolio.fiat_portfolio === 0) {
    const current = data[data.length - 1];
    const currentCloseValue = Number.parseFloat(current.closeValue);
    const closeTime = current.closeTime;
    portfolio.sell(currentCloseValue, closeTime);
  }
  /* console.log(portfolio.printLoss(10));
  console.log("Wins: ", portfolio.wins); */
  portfolio.printAll("1d", returns);
  return [portfolio, returns];
};

simulateMarket(40, 0.6);

const testRanges = async () => {
  const props1 = [10, 100];
  const props2 = [0.1, 1];
  const all = [];
  for (let i = props1[0]; i <= props1[1]; i += 1) {
    for (let j = props2[0]; j <= props2[1]; j += 0.1) {
      const [portfolio, returns] = await simulateMarket(i, j);
      all.push({
        i,
        j,
        sharpe: getSharpeRatio(returns, "1d"),
        profit: portfolio.getProfits(),
      });
    }
  }
  const sortedByProfit = all.sort((a, b) => a.profit - b.profit);
  console.log(sortedByProfit.slice(sortedByProfit.length - 10));
  const sortedBySharpe = all.sort((a, b) => a.sharpe - b.sharpe);
  console.log(sortedBySharpe.slice(sortedBySharpe.length - 10));
  //maxPortfolio.printAll("1d", returns);
};
//testRanges();
