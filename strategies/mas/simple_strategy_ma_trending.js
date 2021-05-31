const MaTrendSignal = require("../../signals/ma_trend_signal");
const RiskManagementSignal = require("../../signals/risk_management_signal");

const SimpleStrategy = () => {
  const RECOMMENDED_INTERVAL = "4h";
  const maSignal = MaTrendSignal(40, "MA"); //3, 38
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 14, //5 - 9 - 10 - 14
    atr_multiplier_loss: 6, //BTC:4 ETH:5
    atr_multiplier_profit: 3, //8
  });

  const isBuyingTime = async ({ closeValues, lowValues, highValues }) => {
    const maPassed = await maSignal.isBuySignal({
      closeValues,
      count: 2,
    });
    return maPassed;
  };

  const isSellingTime = async ({
    closeValues,
    currentCloseValue,
    lastBuyTransaction,
    currentCloseTime,
    lowValues,
    highValues,
    heikenAshi,
  }) => {
    const maPassed = await maSignal.isSellSignal({
      closeValues,
      count: 2,
    });
    const isStopLossPassed = await riskManagementSignal.isStopLoss({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });
    return isStopLossPassed || maPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
