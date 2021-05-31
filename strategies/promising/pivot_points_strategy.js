const { getReturns, getPivotPoints } = require("../../helpers/my_helper");
const RiskManagementSignal = require("../../signals/risk_management_signal");
const math = require("mathjs");

const PlaygroundStrategy = (
  isBacktest,
  LEFT_COUNT,
  RIGHT_COUNT,
  atr_multiplier_loss
) => {
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 14, //5 14
    atr_multiplier_loss, // 2 ou 6 ou 8
    atr_multiplier_profit: 1, //14 17
  });
  /* const LEFT_COUNT = 10;
  const RIGHT_COUNT = 10; */

  const isBuyingTime = async ({
    closeValues,
    lowValues,
    highValues,
    currentCloseTime,
    currentCloseValue,
  }) => {
    const { ppH, ppL } = await getPivotPoints(
      highValues,
      lowValues,
      LEFT_COUNT,
      RIGHT_COUNT
    );
    /* if (currentCloseTime.includes("2020-02-26")) {
      console.log("BUYING");
      console.log(
        ppL[ppL.length - 1] === lowValues[lowValues.length - 1 - RIGHT_COUNT]
      );
      console.log(ppL[ppL.length - 1] < currentCloseValue);
    } */
    return (
      ppL[ppL.length - 1] === lowValues[lowValues.length - 1 - RIGHT_COUNT] &&
      ppL[ppL.length - 1] < currentCloseValue
    );
  };

  const isSellingTime = async ({
    currentCloseValue,
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
    const { ppH, ppL } = await getPivotPoints(
      highValues,
      lowValues,
      LEFT_COUNT,
      RIGHT_COUNT
    );
    return (
      isStopLossPassed ||
      (ppH[ppH.length - 1] ===
        highValues[highValues.length - 1 - RIGHT_COUNT] &&
        ppH[ppH.length - 1] > currentCloseValue)
    );
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL: "1d" };
};

module.exports = PlaygroundStrategy;
