const MaxLossSignal = require("../../signals/max_loss_signal");
const EhlersSinewaveSignal = require("../../signals/ehlers_sinewave_signal");
const InstantLossSignal = require("../../signals/instant_loss_signal");
const EhlersTestSignal = require("../../signals/supersmoother_trend_signal");
const RiskManagementSignal = require("../../signals/risk_management_signal");

const SimpleStrategy = () => {
  const RECOMMENDED_INTERVAL = "1d";
  const testSignal = EhlersTestSignal(15); //40, 150, 170, 280, 290
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 10,
    atr_multiplier_loss: 1,
  });

  const isBuyingTime = async ({
    closeValues,
    heikenAshi /* currentCloseValue */,
  }) => {
    const testPassed = await testSignal.isBuySignal({
      closeValues: heikenAshi.map((ha) => ha.closeValue),
    });
    return testPassed;
  };

  const isSellingTime = async ({
    lowValues,
    highValues,
    closeValues,
    currentCloseValue,
    lastBuyTransaction,
    heikenAshi,
  }) => {
    const riskManagementPassed = await riskManagementSignal.isStopLoss({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });
    const testPassed =
      heikenAshi[heikenAshi.length - 1].openValue >
      heikenAshi[heikenAshi.length - 1].closeValue;
    /* const testPassed = await testSignal.isSellSignal({
      closeValues: heikenAshi.map((ha) => ha.closeValue),
    }); */
    return riskManagementPassed || testPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
