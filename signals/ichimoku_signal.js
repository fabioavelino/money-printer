const TulindHelper = require("../helpers/tulind_helper");

const IchimokuSignal = ([
  conversionPeriod = 9,
  basePeriod = 26,
  periodReturn = 52,
  shifting = 26,
]) => {
  const computeValue = (highs, lows) => {
    const currentIchimoku = TulindHelper.getIchimoku(highs, lows, [
      conversionPeriod,
      basePeriod,
      periodReturn,
      shifting,
    ]);
    return currentIchimoku;
  };

  const isBuySignal = ({ lowValues, highValues }) => {
    const currentIchimoku = computeValue(highValues, lowValues);
    const previousIchimoku = computeValue(
      highValues.slice(0, highValues.length - 1),
      lowValues.slice(0, lowValues.length - 1)
    );
    return (
      currentIchimoku.senou < currentIchimoku.senkou &&
      currentIchimoku.senkou < currentIchimoku.kijun &&
      currentIchimoku.kijun > currentIchimoku.tenkan
    );
  };

  const isSellSignal = ({ lowValues, highValues }) => {
    const currentIchimoku = computeValue(highValues, lowValues);
    const previousIchimoku = computeValue(
      highValues.slice(0, highValues.length - 1),
      lowValues.slice(0, lowValues.length - 1)
    );
    return (
      currentIchimoku.kijun < currentIchimoku.tenkan &&
      previousIchimoku.kijun > previousIchimoku.tenkan
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = IchimokuSignal;
