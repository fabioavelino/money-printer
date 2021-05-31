const TulindHelper = require("../helpers/tulind_helper");
const EhlersHelper = require("../helpers/ehlers_helper");

const LaguerreRSISignal = (alpha) => {
  const computeValue = (closeValues) => {
    const rsi = EhlersHelper.getLaguerreRSI(closeValues, alpha);
    return rsi;
  };

  const isBuySignal = async ({
    closeValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const rsi = computeValue(closeValues);
    return rsi[rsi.length - 1] < 30;
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const rsi = computeValue(closeValues);
    return rsi[rsi.length - 1] > 80;
  };

  return { isBuySignal, isSellSignal };
};

module.exports = LaguerreRSISignal;
