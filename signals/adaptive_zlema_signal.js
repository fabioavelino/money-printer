const TulindHelper = require("../helpers/tulind_helper");
const EhlersHelper = require("../helpers/ehlers_helper");

const AdaptiveZlemaSignal = (
  gainLimit = 8,
  threshold = 0.05,
  short = 10,
  long = 100
) => {
  const computeValue = async (closeValues, depth) => {
    const zlema = await EhlersHelper.getAdaptiveZLEMA(closeValues, [
      gainLimit,
      depth,
    ]); //bearish: 4 17 / bullish: 41 50 51 52
    //const sig = TulindHelper.getEhlersEvenBetterSineWave(closeValues, [40, 10]);

    return zlema;
  };

  const isBuySignal = async ({
    closeValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const { ec: emaShort } = await computeValue(closeValues, short);
    const { ec: emaLong } = await computeValue(closeValues, long);
    //return false
    return (
      emaShort[emaShort.length - 1] > emaLong[emaLong.length - 1] &&
      emaShort[emaShort.length - 2] < emaLong[emaLong.length - 2]
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const { ec: emaShort } = await computeValue(closeValues, short);
    const { ec: emaLong } = await computeValue(closeValues, long);
    //return false
    return (
      emaShort[emaShort.length - 1] < emaLong[emaLong.length - 1] &&
      emaShort[emaShort.length - 2] > emaLong[emaLong.length - 2]
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = AdaptiveZlemaSignal;
