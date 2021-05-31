require("./helpers/array_prototype");
const binance = require("./services/binance");
const hma_returns_strategy = require("./strategies/hma_kahlman_strategy");
const dayjs = require("dayjs");

const isMoneyTime = (currentCloseTime) => {
  const now = dayjs();
  const currentCloseTimeParsed = dayjs(currentCloseTime);
  const diffInSecond = currentCloseTimeParsed.diff(now, "second");
  return diffInSecond <= 90 && diffInSecond >= -60;
};

const portfolio_allocation = {
  ETHBUSD: {
    cryptoCurrency: "ETH",
    fiatCurrency: "BUSD",
    strategy: hma_returns_strategy(false, 15, 0.1),
    percentage_allocation: 50 / 100,
  },
  BTCBUSD: {
    cryptoCurrency: "BTC",
    fiatCurrency: "BUSD",
    strategy: hma_returns_strategy(false, 17, 1),
    percentage_allocation: 50 / 100,
  },
};
const getPortfolioTotalAmont = async (balances, portfolio_allocation) => {
  let total = balances.BUSD;
  for (
    let pa_index = 0;
    pa_index < Object.keys(portfolio_allocation).length;
    pa_index++
  ) {
    const symbol = Object.keys(portfolio_allocation)[pa_index];
    const value = await binance.getCurrentPrice(symbol);
    const asset_hold = balances[portfolio_allocation[symbol].cryptoCurrency];
    total += value * asset_hold;
  }
  return total;
};

const getCorrectValueBasedOnAllocation = (
  total,
  fiat_total,
  percentage_allocation
) => {
  const round = (value) => Math.floor(value * 100) / 100;
  const value_to_allocate = total * percentage_allocation;
  if (value_to_allocate >= fiat_total) {
    return round(fiat_total);
  }
  return round(value_to_allocate);
};

const monitorMarket = async (cryptoCurrency, fiatCurrency, strategy) => {
  const balances = await binance.getBalances();
  const symbol = `${cryptoCurrency}${fiatCurrency}`;
  const klinesAllInfos = await binance.getKlines(
    symbol,
    strategy.RECOMMENDED_INTERVAL,
    100,
    undefined,
    undefined
  );
  const currentCloseTime = klinesAllInfos.last.closeTime;
  const moneyTime = isMoneyTime(currentCloseTime);
  if (!moneyTime) {
    return;
  }
  const closeValues = klinesAllInfos.map((kline) => +kline.closeValue);
  const lowValues = klinesAllInfos.map((kline) => +kline.lowValue);
  const highValues = klinesAllInfos.map((kline) => +kline.highValue);
  let relevantAnalyticalData = {
    currentCloseValue: closeValues.last,
    currentCloseTime,
    closeValues,
    lowValues,
    highValues,
  };
  const { lastBuy, lastSell } = await binance.getPastOrders(symbol);
  const current_balance_value =
    balances[cryptoCurrency] * (await binance.getCurrentPrice(symbol));
  if (current_balance_value > 100) {
    relevantAnalyticalData.lastBuyTransaction = lastBuy;
    if (await strategy.isSellingTime(relevantAnalyticalData)) {
      console.log("");
      console.log("==============");
      console.log("SELLING TIME: ");
      console.log("==============");
      console.log("");
      await binance.cancelOpenOrders(symbol);
      await binance.createNewMarketOrder(symbol, "SELL", {
        quantity: balances[cryptoCurrency],
      });
    }
  } else if (current_balance_value < 10) {
    relevantAnalyticalData.lastSellTransaction = lastSell;
    if (await strategy.isBuyingTime(relevantAnalyticalData)) {
      console.log("");
      console.log("==============");
      console.log("BUYING TIME: ");
      console.log("==============");
      console.log("");
      await binance.cancelOpenOrders(symbol);
      const total = await getPortfolioTotalAmont(
        balances,
        portfolio_allocation
      );
      const amountToInvest = getCorrectValueBasedOnAllocation(
        total,
        balances[fiatCurrency],
        portfolio_allocation[symbol].percentage_allocation
      );
      console.log("TO INVEST:", amountToInvest);
      await binance.createNewMarketOrder(symbol, "BUY", {
        quoteOrderQty: amountToInvest,
      });
    }
  }
};

/* setInterval(async () => {
  try {
    await monitorMarket("BTC", "BUSD", selected_strategy());
  } catch (error) {
    console.log("");
    console.log("========================");
    console.log("ERROR :");
    console.log(dayjs().format());
    console.log(error);
    console.log("========================");
    console.log("");
  }
}, 10000); */

const makeMoney = async () => {
  for (const symbol in portfolio_allocation) {
    const to_allocate = portfolio_allocation[symbol];
    await monitorMarket(
      to_allocate.cryptoCurrency,
      to_allocate.fiatCurrency,
      to_allocate.strategy
    );
  }
};

setInterval(makeMoney, 15 * 1000);
