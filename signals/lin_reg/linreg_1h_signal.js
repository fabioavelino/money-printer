const TulindHelper = require("../../helpers/tulind_helper");
const EhlersHelper = require("../../helpers/ehlers_helper");

const LinregSignal = () => {
  const computeValue = async (closeValues) => {
    const { linreg, stddev } = await TulindHelper.getLinReg(closeValues, 100);
    return { linreg, stddev };
  };

  const isBuySignal = async ({
    closeValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const { linreg, stddev } = await computeValue(closeValues);
    const dev = stddev[stddev.length - 1];
    let lowerBand = linreg[linreg.length - 1] - dev * 3;
    //console.log(upperBand, lowerBand);
    //console.log(linreg);
    return (
      currentCloseValue < lowerBand * 1.3 &&
      linreg[linreg.length - 1] > linreg[linreg.length - 2] &&
      linreg[linreg.length - 2] >
        linreg[
          linreg.length - 3
        ] /* &&
      linreg[linreg.length - 3] > linreg[linreg.length - 4] &&
      linreg[linreg.length - 4] > linreg[linreg.length - 5] */
    );
    if (
      linreg[linreg.length - 1] > linreg[linreg.length - 2] &&
      linreg[linreg.length - 2] >
        linreg[
          linreg.length - 3
        ] /* &&
      linreg[linreg.length - 3] > linreg[linreg.length - 4] */
    ) {
      lowerBand = linreg[linreg.length - 1] - dev;
    }

    return currentCloseValue < lowerBand * 1.005;
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const { linreg, stddev } = await computeValue(closeValues);
    const dev = stddev[stddev.length - 1];
    let upperBand = linreg[linreg.length - 1] + dev * 3;
    let lowerBand = linreg[linreg.length - 1] - dev * 2.5;
    let lowerBandUrgent = linreg[linreg.length - 1] - dev;
    //console.log(upperBand, lowerBand);
    //console.log(linreg);
    return (
      (currentCloseValue < lowerBand &&
        linreg[linreg.length - 1] < linreg[linreg.length - 2]) ||
      (linreg[linreg.length - 1] < linreg[linreg.length - 2] &&
        linreg[linreg.length - 2] < linreg[linreg.length - 3] &&
        linreg[linreg.length - 3] < linreg[linreg.length - 4] &&
        linreg[linreg.length - 4] < linreg[linreg.length - 5] &&
        linreg[linreg.length - 5] < linreg[linreg.length - 6] &&
        linreg[linreg.length - 6] < linreg[linreg.length - 7] &&
        linreg[linreg.length - 7] < linreg[linreg.length - 8])
    );
    if (
      linreg[linreg.length - 1] > linreg[linreg.length - 2] &&
      linreg[linreg.length - 2] >
        linreg[
          linreg.length - 3
        ] /* &&
      linreg[linreg.length - 3] > linreg[linreg.length - 4] */
    ) {
      upperBand = linreg[linreg.length - 1] + halfstddev;
    }
    return currentCloseValue > linreg[linreg.length - 1];
  };

  return { isBuySignal, isSellSignal };
};

module.exports = LinregSignal;
