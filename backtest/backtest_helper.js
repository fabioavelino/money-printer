const { getRelevantAnalyticalData } = require("../helpers/data_helper");
const FakePortfolio = require("../portfolio/fake_portfolio");
const fs = require("fs");
const path = require("path");

const handleTick = async ({
  tick,
  tickIndex,
  allTicks,
  lookback_length,
  portfolio,
  strategy,
}) => {
  const relevantAnalyticalData = getRelevantAnalyticalData(
    allTicks,
    portfolio,
    tickIndex,
    lookback_length
  );
  if (portfolio.market_portfolio < 1) {
    // We have only fiat
    if (await strategy.isBuyingTime(relevantAnalyticalData)) {
      portfolio.buy(+tick.closeValue, tick.closeTime, relevantAnalyticalData);
    }
  } else {
    // We have market assets
    portfolio.addReturns(
      tick.closeTime,
      relevantAnalyticalData.closeValues.last /
        relevantAnalyticalData.closeValues.fromEnd(1) -
        1
    );
    if (await strategy.isSellingTime(relevantAnalyticalData)) {
      portfolio.sell(+tick.closeValue, tick.closeTime, relevantAnalyticalData);
    }
  }
};

const handleSet = async ({
  parameters,
  strategy_to_test,
  currentSet,
  lookback_length,
  compareProfitsHandler,
}) => {
  const strategy = strategy_to_test(true, ...parameters);
  const portfolio = new FakePortfolio(strategy.RECOMMENDED_INTERVAL || "1d");
  for (let tickIndex = 0; tickIndex < currentSet.length; tickIndex++) {
    await handleTick({
      tick: currentSet[tickIndex],
      tickIndex,
      allTicks: currentSet,
      lookback_length,
      portfolio,
      strategy,
    });
  }
  portfolio.closeLastTradeIfNeeded(
    +currentSet.last.closeValue,
    currentSet.last.closeTime
  );
  compareProfitsHandler.addProfits(
    parameters,
    portfolio.getSharpeRatio(),
    portfolio.getProfits(),
    portfolio.getMoreInfos()
  );
};

const createGridOptimisationCombinaisons = (parameters = []) => {
  const aggregateWithNextParameter = (
    parametersReceived = [],
    remainingParameters
  ) => {
    let parametersToReturn = [];
    const currentParameters = remainingParameters[0];
    if (remainingParameters.length === 1) {
      currentParameters.forEach((cp) => {
        parametersToReturn.push([...parametersReceived, cp]);
      });
      return parametersToReturn;
    }
    currentParameters.forEach((cp) => {
      parametersToReturn.push(
        ...aggregateWithNextParameter(
          [...parametersReceived, cp],
          remainingParameters.slice(1)
        )
      );
    });
    return parametersToReturn;
  };
  return aggregateWithNextParameter([], parameters);
};

const log = (str) => {
  const getFileName = () => path.resolve(__dirname, `../backtest.log`);
  let contentFile = "";
  try {
    contentFile = fs.readFileSync(getFileName(), { encoding: "utf8" });
  } catch (error) {}
  let newStr = "";
  if (Array.isArray(str)) {
    str.forEach((entry) => (newStr += "\n" + JSON.stringify(entry)));
  } else {
    newStr = typeof str === "object" ? JSON.stringify(str) : str;
  }
  contentFile += "\n" + newStr;
  fs.writeFileSync(getFileName(), contentFile, { encoding: "utf8" });
  console.log(str);
};

module.exports = {
  handleTick,
  handleSet,
  createGridOptimisationCombinaisons,
  log,
};
