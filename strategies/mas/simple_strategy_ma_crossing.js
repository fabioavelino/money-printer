const MaxLossSignal = require("../../signals/max_loss_signal");
const MaCrossSignal = require("../../signals/ma_cross_signal");
const InstantLossSignal = require("../../signals/instant_loss_signal");
const RiskManagementSignal = require("../../signals/risk_management_signal");

const SimpleStrategy = () => {
  const RECOMMENDED_INTERVAL = "4h";
  const maSignal = MaCrossSignal(50, 200, "EMA"); //3, 38
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 14, //5 - 9 - 10 - 14
    atr_multiplier_loss: 5, //BTC:4 ETH:5
    atr_multiplier_profit: 3, //8
  });

  const isBuyingTime = async ({
    closeValues,
    currentCloseTime,
    heikenAshi /* currentCloseValue */,
  }) => {
    const maPassed = await maSignal.isBuySignal({
      currentCloseTime,
      closeValues,
    });
    return maPassed /* && isCurrentHAPositive */;
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
      currentCloseTime,
    });
    const isStopLossPassed = await riskManagementSignal.isStopLoss({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });
    /* const isTakeProfitPassed = await riskManagementSignal.isTakeProfit({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    }); */
    return isStopLossPassed || maPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
