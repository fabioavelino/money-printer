const { getReturns } = require("../../helpers/my_helper");
const RiskManagementSignal = require("../../signals/risk_management_signal");
const math = require("mathjs");

const PlaygroundStrategy = () => {
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 14, //5 14
    atr_multiplier_loss: 1, // 2 ou 6 ou 8
    atr_multiplier_profit: 1, //14 17
  });

  const isBuyingTime = async ({
    closeValues,
    currentCloseTime /* currentCloseValue */,
  }) => {
    const returns = getReturns(closeValues.slice(closeValues.length - 2000));
    const absReturns = math.abs(returns);
    const std = math.std(absReturns);
    const mean = math.mean(absReturns);
    /* const lengthOutside = absReturns.filter(
      (ar) => ar > mean + std * 1.5 || ar < mean + std * -1.5
    ).length;
    console.log((lengthOutside / absReturns.length) * 100);
    return false; */
    if (
      absReturns[absReturns.length - 1] > mean + std * 2.5 &&
      returns[returns.length - 1] < 0
    ) {
      return true;
    }
    /* if (
      absReturns[absReturns.length - 3] > mean + std * 2 &&
      returns[returns.length - 3] < 0 &&
      returns[returns.length - 2] > 0 &&
      returns[returns.length - 1] > 0
    ) {
      return true;
      return returns[returns.length - 1] > 0 && returns[returns.length - 2] > 0;
    } */
    return false;
  };

  const isSellingTime = async ({
    currentCloseValue,
    lastBuyTransaction,
    lowValues,
    highValues,
    closeValues,
  }) => {
    return true;
    const isStopLossPassed = await riskManagementSignal.isStopLoss({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });
    const isTakeProfitPassed = await riskManagementSignal.isTakeProfit({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });
    const returns = getReturns(closeValues);
    const absReturns = math.abs(returns);
    const std = math.std(absReturns);
    const mean = math.mean(absReturns);
    if (
      absReturns[absReturns.length - 1] > mean + std * 1 &&
      returns[returns.length - 1] > 0
    ) {
      return true;
    }
    return isStopLossPassed || isTakeProfitPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL: "1h" };
};

module.exports = PlaygroundStrategy;
