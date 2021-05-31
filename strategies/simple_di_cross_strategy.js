const { getHMAKahlman, getReturns } = require("../helpers/my_helper");
const TulindHelper = require("../helpers/tulind_helper");
const RiskManagementSignal = require("../signals/risk_management_signal");

const PlaygroundStrategy = (isBacktesting, di_length) => {
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
      const { plus_di, minus_di } = await TulindHelper.getDI(
        highValues,
        lowValues,
        closeValues,
        di_length
      );
      return plus_di.crossover(minus_di);
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
    const { plus_di, minus_di } = await TulindHelper.getDI(
      highValues,
      lowValues,
      closeValues,
      di_length
    );

    return isStopLossPassed || plus_di.crossunder(minus_di);
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL: "1d" };
};

module.exports = PlaygroundStrategy;
