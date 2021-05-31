/**
 * Trash because test are very bad
 */
const {
  getReturns,
  getMovingPrices,
  getLowPass,
  getNormalizedIndex,
  getAllNormalizedIndex,
} = require("../../helpers/my_helper");
const RiskManagementSignal = require("../../signals/risk_management_signal");
const math = require("mathjs");
const { getEMA } = require("../../helpers/tulind_helper");

const PlaygroundStrategy = (lookback = 100, lowLimit, highLimit) => {
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 14, //5 14
    atr_multiplier_loss: 8, // 2 ou 6 ou 8
    atr_multiplier_profit: 6, //14 17
  });

  const isBuyingTime = async ({
    closeValues,
    lowValues,
    highValues,
    currentCloseTime,
    currentCloseValue,
  }) => {
    //const ni = getNormalizedIndex(closeValues, 10);
    const ni = getAllNormalizedIndex(closeValues, 2, lookback);
    /* if (currentCloseTime === "2020-03-10T00:59:59+01:00") {
      console.log(ni.slice(ni.length - 40));
    } */
    return (
      ni[ni.length - 2] <=
        lowLimit /* 
      ni[ni.length - 3] < ni[ni.length - 2] && */ &&
      ni[ni.length - 2] < ni[ni.length - 1]
    );
  };

  const isSellingTime = async ({
    currentCloseValue,
    currentCloseTime,
    lastBuyTransaction,
    lowValues,
    highValues,
    closeValues,
  }) => {
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
    const ni = getAllNormalizedIndex(closeValues, 2, lookback);

    return (
      isStopLossPassed ||
      /* isTakeProfitPassed || */ ni[ni.length - 1] >= highLimit
    );
    return isStopLossPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL: "1d" };
};

module.exports = PlaygroundStrategy;
