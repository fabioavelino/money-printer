const TulindHelper = require("../../helpers/tulind_helper");
const EhlersHelper = require("../../helpers/ehlers_helper");

const LinregSignal = () => {
  const computeValue = async (closeValues) => {
    const { linreg, stddev } = await TulindHelper.getLinReg(closeValues, 200); //20 ou 200 => 4h
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
      /* currentCloseValue < lowerBand * 1.4 && */
      linreg[linreg.length - 1] > linreg[linreg.length - 2] &&
      linreg[linreg.length - 2] > linreg[linreg.length - 3] &&
      linreg[linreg.length - 3] > linreg[linreg.length - 4]
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const { linreg, stddev } = await computeValue(closeValues);
    const dev = stddev[stddev.length - 1];
    let upperBand = linreg[linreg.length - 1] + dev * 3;
    let lowerBand = linreg[linreg.length - 1] - dev * 2;
    let lowerBandUrgent = linreg[linreg.length - 1] - dev;
    //console.log(upperBand, lowerBand);
    //console.log(linreg);
    return (
      currentCloseValue <
        lowerBand /*  &&
        linreg[linreg.length - 1] < linreg[linreg.length - 2] */ ||
      (linreg[linreg.length - 1] < linreg[linreg.length - 2] &&
        linreg[linreg.length - 2] < linreg[linreg.length - 3] &&
        linreg[linreg.length - 3] < linreg[linreg.length - 4] &&
        linreg[linreg.length - 4] < linreg[linreg.length - 5])
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = LinregSignal;
