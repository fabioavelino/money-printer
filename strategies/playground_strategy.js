const { getHMAKahlman, getReturns, getTSI } = require("../helpers/my_helper");
const TulindHelper = require("../helpers/tulind_helper");
const RiskManagementSignal = require("../signals/risk_management_signal");

const PlaygroundStrategy = (isBacktesting, long, short, signal) => {
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 14, //5 14
    atr_multiplier_loss: 6, // 2 ou 6 ou 8
    atr_multiplier_profit: 3, //14 17
  });

  const isBuyingTime = async ({
    closeValues,
    lowValues,
    highValues,
    currentCloseTime,
    currentCloseValue,
  }) => {
    try {
      const { tsi, tsi_signal } = await getTSI(
        closeValues,
        short,
        long,
        signal
      );
      return tsi.crossover(tsi_signal);
    } catch (error) {
      //console.log(error);
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
    const { tsi, tsi_signal } = await getTSI(closeValues, short, long, signal);

    return isStopLossPassed || tsi.crossunder(tsi_signal);
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL: "1d" };
};

module.exports = PlaygroundStrategy;
