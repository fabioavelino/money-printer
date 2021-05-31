const TulindHelper = require("../helpers/tulind_helper");
const EhlersHelper = require("../helpers/ehlers_helper");

const AdaptiveZlemaSignal = (gainLimit = 8, threshold = 0.05) => {
  const computeValue = async (closeValues) => {
    const zlema = await EhlersHelper.getAdaptiveZLEMA(closeValues, [
      gainLimit,
      20,
    ]); //bearish: 4 17 / bullish: 41 50 51 52
    //const sig = TulindHelper.getEhlersEvenBetterSineWave(closeValues, [40, 10]);

    return zlema;
  };

  const isBuySignal = async ({
    closeValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const { ema, ec, leastError } = await computeValue(closeValues);
    if (closeValues[closeValues.length - 1] === 39250.0) {
      console.log(ec.slice(ec.length - 10));
      console.log(ema.slice(ema.length - 10));
      console.log((leastError * 100) / closeValues[closeValues.length - 1]);
    }
    //return false;
    return (
      ec[ec.length - 1] > ema[ema.length - 1] &&
      ec[ec.length - 2] < ema[ema.length - 2] &&
      (leastError * 100) / closeValues[closeValues.length - 1] > threshold
      /*zlema[currentIndex - 2] > zlema[currentIndex - 3] */
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const { ema, ec, leastError } = await computeValue(closeValues);
    if (closeValues[closeValues.length - 1] === 39250.0) {
      console.log(ec.slice(ec.length - 10));
      console.log(ema.slice(ema.length - 10));
      console.log((leastError * 100) / closeValues[closeValues.length - 1]);
    }
    //return false;
    return (
      ec[ec.length - 1] < ema[ema.length - 1] &&
      ec[ec.length - 2] > ema[ema.length - 2] &&
      (leastError * 100) / closeValues[closeValues.length - 1] > threshold
      /*zlema[currentIndex - 2] > zlema[currentIndex - 3] */
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = AdaptiveZlemaSignal;
