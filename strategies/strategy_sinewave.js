const MaxLossSignal = require("../signals/max_loss_signal");
const EhlersSinewaveSignal = require("../signals/ehlers_sinewave_signal");
const InstantLossSignal = require("../signals/instant_loss_signal");
const RiskManagementSignal = require("../signals/risk_management_signal");

const SimpleStrategy = (isBacktest, hpLength, ssfLength) => {
  const RECOMMENDED_INTERVAL = "1d";
  const sinewaveSignal = EhlersSinewaveSignal(hpLength, ssfLength); //40, 150, 170, 280, 290
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 10,
    atr_multiplier_loss: 6,
  });

  const isBuyingTime = async ({ closeValues /* currentCloseValue */ }) => {
    const sinewavePassed = await sinewaveSignal.isBuySignal({ closeValues });
    return sinewavePassed;
  };

  const isSellingTime = async ({
    lowValues,
    highValues,
    closeValues,
    currentCloseValue,
    lastBuyTransaction,
  }) => {
    const riskManagementPassed = await riskManagementSignal.isStopLoss({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });
    const sinewavePassed = await sinewaveSignal.isSellSignal({ closeValues });
    return riskManagementPassed || sinewavePassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
