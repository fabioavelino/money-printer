const ArimaSignal = require("../../signals/arima/arima_signal");
const RiskManagementSignal = require("../../signals/risk_management_signal");

const SimpleStrategy = () => {
  const RECOMMENDED_INTERVAL = "1d";
  const testSignal = ArimaSignal(); //40, 150, 170, 280, 290
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 10, //5 - 6 - 10
    atr_multiplier_loss: 6, //2 4 6 8 10 12
    atr_multiplier_profit: 8, //8 10 12
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
    });
    const testPassed = await testSignal.isSellSignal({
      closeValues,
      currentCloseValue,
    });
    return stopLossPassed || /* takeProfitPassed || */ testPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
