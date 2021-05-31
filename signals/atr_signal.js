const TulindHelper = require("../helpers/tulind_helper");

const AtrSignal = (depth, { highPercentage = 5 / 100 }) => {
  const computeValue = async (highs, lows, closes) => {
    const atr = await TulindHelper.getATR([highs, lows, closes], depth);
    return atr;
  };

  const isAbove = async ({ lowValues, highValues, closeValues }) => {
    const atr = await computeValue(highValues, lowValues, closeValues);
    const atrPercentage = atr / closeValues[closeValues.length - 1];
    return atrPercentage > highPercentage;
  };

  return { isAbove };
};

module.exports = AtrSignal;
