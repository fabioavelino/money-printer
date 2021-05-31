/**
 * Trash, nothing promising from it (needs more investigations)
 */
const MaxLossSignal = require("../signals/max_loss_signal");
const ZlemaSignal = require("../signals/adaptive_zlema_signal");
const InstantLossSignal = require("../signals/instant_loss_signal");
const RiskManagementSignal = require("../signals/risk_management_signal");

const SimpleStrategy = (isBacktest, gainLimit, threshold, short, long) => {
  const RECOMMENDED_INTERVAL = "1d";
  const zlemaSignal = ZlemaSignal(gainLimit, threshold, short, long); //3, 38
  //const maxLossSignal = MaxLossSignal({ maxLossPercentage: -3 / 100 });
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 14,
    atr_multiplier_loss: 6,
  });

  const isBuyingTime = async ({ closeValues /* currentCloseValue */ }) => {
    const zlemaPassed = await zlemaSignal.isBuySignal({ closeValues });
    return zlemaPassed;
    if (zlemaPassed) {
      /* if (await rsiSignal.isAboveOf({ closeValues, limit: 70 })) {
        return false;
      } */
      return true;
    }
  };

  const isSellingTime = async ({
    closeValues,
    currentCloseValue,
    lastBuyTransaction,
    lowValues,
    highValues,
  }) => {
    const riskManagementPassed = await riskManagementSignal.isStopLoss({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });
    const zlemaPassed = await zlemaSignal.isSellSignal({ closeValues });
    return riskManagementPassed || zlemaPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
