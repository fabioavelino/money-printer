const TulindHelper = require("../helpers/tulind_helper");

const AdxDiSignal = (adx_depth, di_depth) => {
  const computeValue = async (high, low, close) => {
    const adx = await TulindHelper.getADX(
      high,
      low,
      close,
      adx_depth,
      adx_depth
    ); //bearish: 4 17 / bullish: 41 50 51 52
    const { plus_di, minus_di } = await TulindHelper.getDI(
      high,
      low,
      close,
      di_depth
    );
    return { adx, plus_di, minus_di };
  };

  const isBuySignal = async ({
    closeValues,
    lowValues,
    highValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const { adx, plus_di, minus_di } = await computeValue(
      highValues,
      lowValues,
      closeValues
    );
    const currentIndex = minus_di.length - 1;
    return (
      (plus_di[plus_di.length - 1] > plus_di[plus_di.length - 2] &&
        plus_di[plus_di.length - 2] > plus_di[plus_di.length - 3]) ||
      (minus_di[minus_di.length - 1] < minus_di[minus_di.length - 2] &&
        minus_di[minus_di.length - 1] - plus_di[plus_di.length - 1] < 5 &&
        adx[adx.length - 1] < 10)
    );
  };

  const isSellSignal = async ({
    closeValues,
    lowValues,
    highValues,
    currentCloseValue,
  }) => {
    const { adx, plus_di, minus_di } = await computeValue(
      highValues,
      lowValues,
      closeValues
    );
    const currentIndex = plus_di.length - 1;
    return (
      plus_di[plus_di.length - 1] < plus_di[plus_di.length - 2] ||
      minus_di[minus_di.length - 1] > minus_di[minus_di.length - 2]
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = AdxDiSignal;
