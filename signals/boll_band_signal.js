const TulindHelper = require("../helpers/tulind_helper");

const BollBandSignal = ({ highDiff = 20 / 100, lowDiff = 20 / 100 }) => {
  const computeValue = async (closeValues) => {
    const bollBands = await TulindHelper.getBollBands(closeValues, [21, 2]);
    const currentIndex = bollBands[0].length - 1;
    return {
      currentBollBandLower: bollBands[0][currentIndex],
      currentBollBandMiddle: bollBands[1][currentIndex],
      currentBollBandUpper: bollBands[2][currentIndex],
    };
  };

  const isBuySignal = async ({ closeValues, currentCloseValue }) => {
    const { currentBollBandUpper, currentBollBandLower } = await computeValue(
      closeValues
    );
    const intervalBollBand = currentBollBandUpper - currentBollBandLower;
    const diffWithLower = currentCloseValue - currentBollBandLower;
    const percentageDiffWithLower = diffWithLower / intervalBollBand;
    return percentageDiffWithLower <= lowDiff;
  };

  const isLow = async ({ closeValues, currentCloseValue }) => {
    const { currentBollBandUpper, currentBollBandLower } = await computeValue(
      closeValues
    );
    const intervalBollBand = currentBollBandUpper - currentBollBandLower;
    const diffWithLower = currentCloseValue - currentBollBandLower;
    const percentageDiffWithLower = diffWithLower / intervalBollBand;
    return percentageDiffWithLower <= lowDiff;
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const { currentBollBandUpper, currentBollBandLower } = await computeValue(
      closeValues
    );
    const intervalBollBand = currentBollBandUpper - currentBollBandLower;
    const diffWithUpper = currentBollBandUpper - currentCloseValue;
    const percentageDiffWithUpper = diffWithUpper / intervalBollBand;
    return percentageDiffWithUpper <= highDiff;
  };

  return { isBuySignal, isSellSignal, isLow };
};

module.exports = BollBandSignal;
