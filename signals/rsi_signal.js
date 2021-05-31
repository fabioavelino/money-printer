const TulindHelper = require("../helpers/tulind_helper");

const RSISignal = (
  depth = 14,
  { highLimit = 80, lowLimit = 20, lookback = 10 }
) => {
  const computeValue = async (closeValues) => {
    const rsis = await TulindHelper.getRSIs(closeValues, depth);
    return rsis.slice(rsis.length - lookback);
  };

  const isBuySignal = async ({ closeValues }) => {
    const rsis = await computeValue(closeValues);
    let havePassed = false;
    rsis.forEach((rsi) => {
      if (rsi <= lowLimit) {
        havePassed = true;
      }
    });
    return havePassed;
  };

  const isAboveOf = async ({ closeValues, limit }) => {
    const { currentRsi } = await computeValue(closeValues);
    return currentRsi > limit;
  };

  const isSellSignal = async ({ closeValues }) => {
    const rsis = await computeValue(closeValues);
    let havePassed = false;
    rsis.forEach((rsi) => {
      if (rsi >= highLimit) {
        havePassed = true;
      }
    });
    return havePassed;
  };

  return { isBuySignal, isSellSignal, isAboveOf };
};

module.exports = RSISignal;
