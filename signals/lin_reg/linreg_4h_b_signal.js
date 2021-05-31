const TulindHelper = require("../../helpers/tulind_helper");
const EhlersHelper = require("../../helpers/ehlers_helper");

const LinregSignal = (depth = 170) => {
  const computeValue = async (closeValues) => {
    const val = await TulindHelper.getLinearRegression(closeValues, depth); //160 170 200 => 4h
    return val;
  };

  const isBuySignal = async ({
    closeValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const val = await computeValue(closeValues);
    const current = val[val.length - 1];
    const previous = val[val.length - 2];
    const lowerLine = current.end_y;
    return current.end_y > current.begin_y && previous.end_y < previous.begin_y;
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const val = await computeValue(closeValues);
    const current = val[val.length - 1];
    const previous = val[val.length - 2];
    const lowerLine = current.end_y - current.stddev * 3;
    return current.end_y < current.begin_y && previous.end_y > previous.begin_y;
  };

  return { isBuySignal, isSellSignal };
};

module.exports = LinregSignal;
