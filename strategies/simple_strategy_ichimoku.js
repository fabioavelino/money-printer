const IchimokuSignal = require("../signals/ichimoku_signal");
const MinGainSignal = require("../signals/min_gain_signal");
const MacdSignal = require("../signals/macd_signal");
const RSISignal = require("../signals/rsi_signal");
const BollBandSignal = require("../signals/boll_band_signal");
const InstantLossSignal = require("../signals/instant_loss_signal");

const SimpleStrategy = () => {
  const RECOMMENDED_INTERVAL = "1d";
  const ichimokuSignal = IchimokuSignal([9, 26, 52, 26]); //[13, 26, 9]
  /* const instantLossSignal = InstantLossSignal({
    instantLossPercentage: -2.5 / 100, //3.6 3.7 4.2 4.5 4.6
  }); */
  /*const bollBandSignal = BollBandSignal({
    highDiff: 5 / 100,
    lowDiff: 20 / 100,
  }); */
  /* const rsiSignal = RSISignal({ highLimit: 75, lowLimit: 25 });
  const minGainSignal = MinGainSignal({
    minGainPercentage: 0.5 / 100,
  }); */

  const isBuyingTime = async ({ closeValues, lowValues, highValues }) => {
    const ichimokuPassed = ichimokuSignal.isBuySignal({
      lowValues,
      highValues,
    });
    return ichimokuPassed;
  };

  const isSellingTime = async ({
    closeValues,
    lowValues,
    highValues,
    currentCloseValue,
    lastBuyTransaction,
  }) => {
    const ichimokuPassed = ichimokuSignal.isSellSignal({
      lowValues,
      highValues,
    });
    return ichimokuPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
