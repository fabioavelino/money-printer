const { getHMAKahlman } = require("../helpers/my_helper");
const RiskManagementSignal = require("../signals/risk_management_signal");

const PlaygroundStrategy = (
  isBacktesting,
  props1 = 17,
  props2 = 1,
  atr_multiplier_loss
) => {
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 14, //5 14
    atr_multiplier_loss: 6, // 2 ou 6 ou 8
    atr_multiplier_profit: 3, //14 17
  });

  const isBuyingTime = async ({
    closeValues,
    /* lowValues,
    highValues,
    currentCloseTime,
    currentCloseValue, */
  }) => {
    try {
      const { isBuy } = await getHMAKahlman(closeValues, props1, props2);
      return isBuy;
    } catch (error) {
      return false;
    }
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

    const { isSell } = await getHMAKahlman(closeValues, props1, props2);
    return isStopLossPassed || isSell;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL: "1d" };
};

module.exports = PlaygroundStrategy;
