const { getCosineIFM } = require("../../helpers/ehlers_helper");
const BearOrBullSignal = require("../../signals/bear_or_bull_signal");
const MaTrendSignal = require("../../signals/ma_trend_signal");
const RenkoSignal = require("../../signals/renko_signal");
const RiskManagementSignal = require("../../signals/risk_management_signal");

const SimpleStrategy = () => {
  //WOrking well in up trending market !!!
  const RECOMMENDED_INTERVAL = "1d";
  const renkoSignal = RenkoSignal({
    atr: 30, //->2<- ->5<- ->11<- ->15<- ->17<- ->18<-
    //pricePercentage: 3 / 100,
  }); //atr:4h=>12 - 14, atr:1d=>7, 11, 12, 14, 20 sizePrice: 400
  const riskManagementSignal = RiskManagementSignal({
    atr_length: 14, //5 14
    atr_multiplier_loss: 8, // 2 ou 6 ou 8
    //atr_multiplier_profit: 17, //14 17
  });

  const isBuyingTime = async ({ closeValues, lowValues, highValues }) => {
    const renkoPassed = renkoSignal.isBuySignal({
      lowValues,
      highValues,
      closeValues,
    });
    return renkoPassed;
  };

  const isSellingTime = async ({
    closeValues,
    lowValues,
    highValues,
    currentCloseValue,
    lastBuyTransaction,
  }) => {
    const isStopLossPassed = await riskManagementSignal.isStopLoss({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });
    const isTakeProfitPassed = await riskManagementSignal.isTakeProfit({
      currentCloseValue,
      lastBuyTransaction,
      lowValues,
      highValues,
      closeValues,
    });
    const renkoPassed = renkoSignal.isSellSignal({
      lowValues,
      highValues,
      closeValues,
    });
    return isStopLossPassed || renkoPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
