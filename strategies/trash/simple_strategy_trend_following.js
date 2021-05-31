/**
 * Trash because only a indicator to see if mean is going up / going down
 */
const IchimokuSignal = require("../../signals/ichimoku_signal");
const SuperSmootherTrendSignal = require("../../signals/supersmoother_trend_signal");
const MacdSignal = require("../../signals/macd_signal");
const RSISignal = require("../../signals/rsi_signal");
const BollBandSignal = require("../../signals/boll_band_signal");
const InstantLossSignal = require("../../signals/instant_loss_signal");
const MaxLossSignal = require("../../signals/max_loss_signal");

const SimpleStrategy = () => {
  const RECOMMENDED_INTERVAL = "4h";
  const ssTrendSignal = SuperSmootherTrendSignal(undefined); //20, 32
  const maxLossSignal = MaxLossSignal({ maxLossPercentage: -9 / 100 });
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
    const ssPassed = ssTrendSignal.isBuySignal({
      closeValues,
      count: 2,
    });
    return ssPassed;
  };

  const isSellingTime = async ({
    closeValues,
    lowValues,
    highValues,
    currentCloseValue,
    lastBuyTransaction,
  }) => {
    const maxLossPassed = maxLossSignal.isSellSignal(
      currentCloseValue,
      lastBuyTransaction.price
    );
    const ssPassed = ssTrendSignal.isSellSignal({
      closeValues,
      count: 2,
    });
    return /* maxLossPassed ||  */ ssPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
