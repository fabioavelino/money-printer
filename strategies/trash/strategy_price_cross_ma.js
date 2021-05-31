const PriceCrossMaSignal = require("../../signals/ma_cross_signal");
const InstantLossSignal = require("../../signals/instant_loss_signal");
const RiskManagementSignal = require("../../signals/risk_management_signal");

const StrategyPriceCrossMa = (isBacktest, short, long, maType) => {
  const RECOMMENDED_INTERVAL = "1d";
  const priceCrossMaSignal = PriceCrossMaSignal(short, long, maType); //12 16 17
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 14, //5 14
    atr_multiplier_loss: 6, // 2 ou 6 ou 8
    atr_multiplier_profit: 3, //14 17
  });

  const isBuyingTime = async ({
    closeValues,
    lowValues,
    highValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const pcmPassed = await priceCrossMaSignal.isBuySignal({
      closeValues,
      lowValues,
      highValues,
      currentCloseValue,
      currentCloseTime,
    });
    return pcmPassed;
  };

  const isSellingTime = async ({
    closeValues,
    lowValues,
    highValues,
    lastBuyTransaction,
    currentCloseValue,
  }) => {
    const isStopLossPassed = await riskManagementSignal.isStopLoss({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });

    const pcmPassed = await priceCrossMaSignal.isSellSignal({
      closeValues,
      lowValues,
      highValues,
    });
    return isStopLossPassed || pcmPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = StrategyPriceCrossMa;
