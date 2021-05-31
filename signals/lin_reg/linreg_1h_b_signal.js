const TulindHelper = require("../../helpers/tulind_helper");
const EhlersHelper = require("../../helpers/ehlers_helper");

const LinregSignal = () => {
  const isShortDownTrend = async (closeValues) => {
    const { linreg } = await TulindHelper.getLinReg(closeValues, 40);
    return linreg[linreg.length - 1] < linreg[linreg.length - 2];
  };

  const isLongDownTrend = async (closeValues) => {
    const { linreg } = await TulindHelper.getLinReg(closeValues, 300);
    return linreg[linreg.length - 1] < linreg[linreg.length - 2];
  };

  const computeValue = async (closeValues) => {
    const { linreg, stddev } = await TulindHelper.getLinReg(closeValues, 40);
    return { linreg, stddev };
  };

  const isBuySignal = async ({
    closeValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const { linreg, stddev } = await computeValue(closeValues);
    const dev = stddev[stddev.length - 1];
    let lowerBand = linreg[linreg.length - 1] - dev * 2;
    const isLongDownTrendResult = await isLongDownTrend(closeValues);
    if (isLongDownTrendResult) {
      lowerBand = linreg[linreg.length - 1] - dev * 7;
    }
    return (
      (currentCloseValue < lowerBand * 1.02 &&
        linreg[linreg.length - 1] < linreg[linreg.length - 2]) ||
      (currentCloseValue < lowerBand * 1.03 &&
        linreg[linreg.length - 1] > linreg[linreg.length - 2])
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const { linreg, stddev } = await computeValue(closeValues);
    const dev = stddev[stddev.length - 1];
    let lowerBand = linreg[linreg.length - 1] - dev * 3;
    const isLongDownTrendResult = await isLongDownTrend(closeValues);
    if (isLongDownTrendResult) {
      lowerBand = linreg[linreg.length - 1] - dev * 7;
      let upperBand = linreg[linreg.length - 1] + dev * 2;
      if (currentCloseValue > upperBand) {
        return true;
      }
    }

    return currentCloseValue < lowerBand;
  };

  return { isBuySignal, isSellSignal, isLongDownTrend, isShortDownTrend };
};

module.exports = LinregSignal;
