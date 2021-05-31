const MaxLossSignal = require("../../signals/max_loss_signal");
const EhlersSinewaveSignal = require("../../signals/ehlers_sinewave_signal");
const InstantLossSignal = require("../../signals/instant_loss_signal");
const LinregSignal = require("../../signals/lin_reg/linreg_4h_b_signal");
const RiskManagementSignal = require("../../signals/risk_management_signal");

const SimpleStrategy = (isBacktest, lin_reg_length) => {
  const RECOMMENDED_INTERVAL = "1d";
  const testSignal = LinregSignal(lin_reg_length); // 170, 280, 290
  const maxLossSignal = MaxLossSignal({ maxLossPercentage: -5 / 100 }); //-2 ou -3 ou -5 ou -7
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 14, //5 - 9 - 10 - 14
    atr_multiplier_loss: 8, //BTC:4 ETH:5
    atr_multiplier_profit: 6, //8
  });

  const isBuyingTime = async ({ closeValues, currentCloseValue }) => {
    try {
      const testPassed = await testSignal.isBuySignal({
        closeValues,
        currentCloseValue,
      });
      return testPassed;
    } catch (error) {}
  };

  const isSellingTime = async ({
    closeValues,
    currentCloseValue,
    currentCloseTime,
    lastBuyTransaction,
    lowValues,
    highValues,
  }) => {
    const maxLossPassed = maxLossSignal.isSellSignal(
      currentCloseValue,
      lastBuyTransaction.price
    );
    const stopLossPassed = await riskManagementSignal.isStopLoss({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });
    const testPassed = await testSignal.isSellSignal({
      closeValues,
      currentCloseValue,
    });
    return stopLossPassed || testPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
