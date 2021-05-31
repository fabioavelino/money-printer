const MaxLossSignal = require("../../signals/max_loss_signal");
const EhlersSinewaveSignal = require("../../signals/ehlers_sinewave_signal");
const InstantLossSignal = require("../../signals/instant_loss_signal");
const LinregSignal = require("../../signals/lin_reg/linreg_1h_b_signal");
const RiskManagementSignal = require("../../signals/risk_management_signal");

const SimpleStrategy = () => {
  const RECOMMENDED_INTERVAL = "1h";
  const testSignal = LinregSignal(); //40, 150, 170, 280, 290
  //const maxLossSignal = MaxLossSignal({ maxLossPercentage: -6 / 100 }); //-2 ou -3 ou -5 ou -7
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 10, //5 - 6 - 10
    atr_multiplier_loss: 2, //2 4 6 8 10 12
    atr_multiplier_profit: 12, //8 10 12
  });

  const isBuyingTime = async ({ closeValues, currentCloseValue }) => {
    const testPassed = await testSignal.isBuySignal({
      closeValues,
      currentCloseValue,
    });
    return testPassed;
  };

  const isSellingTime = async ({
    closeValues,
    currentCloseValue,
    lastBuyTransaction,
    lowValues,
    highValues,
  }) => {
    const atr_multiplier_profit = (await testSignal.isLongDownTrend(
      closeValues
    ))
      ? 8
      : 12;
    /* const maxLossPassed = maxLossSignal.isSellSignal(
      currentCloseValue,
      lastBuyTransaction.price
    ); */
    const stopLossPassed = await riskManagementSignal.isStopLoss({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });
    const takeProfitPassed = await riskManagementSignal.isTakeProfit({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
      override_atr_multiplier: atr_multiplier_profit,
    });
    const testPassed = await testSignal.isSellSignal({
      closeValues,
      currentCloseValue,
    });
    return stopLossPassed || takeProfitPassed || testPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
