const TulindHelper = require("../helpers/tulind_helper");

const MaTrendSignal = (depth = 16, maToUse = "MA") => {
  const computeValue = async (closeValues) => {
    const mas = await TulindHelper[`get${maToUse}`](closeValues, depth);
    return mas;
  };

  const countBullMAs = async ({ closeValues }) => {
    const mas = await computeValue(closeValues);
    let count = 0;
    let start = mas.length - 1;
    for (let i = start; i > 0; i--) {
      if (mas[i] > mas[i - 1]) {
        count++;
      } else {
        return count;
      }
    }
    return count;
  };
  const countBearMAs = async ({ closeValues }) => {
    const mas = await computeValue(closeValues);
    let count = 0;
    let start = mas.length - 1;
    for (let i = start; i > 0; i--) {
      if (mas[i] < mas[i - 1]) {
        count++;
      } else {
        return count;
      }
    }
    return count;
  };

  const getDifferenceCompareToPrice = async ({ closeValues }) => {
    const mas = await computeValue(closeValues);
    const diff = [];
    const lastIndexCloseValues = closeValues.length - 1;
    const lastIndexMas = mas.length - 1;
    for (let i = 0; i <= lastIndexMas; i++) {
      const diffPercentage =
        1 - mas[lastIndexMas - i] / closeValues[lastIndexCloseValues - i];
      diff[lastIndexMas - i] = diffPercentage;
    }
    return diff;
  };

  const isBuySignal = async ({ closeValues, count = 2 }) => {
    //const mas = await computeValue(closeValues);
    //const currentIndex = mas.length - 1;
    const countBull = await countBullMAs({ closeValues });
    return countBull >= count;
    return (
      mas[currentIndex] > mas[currentIndex - 1] &&
      mas[currentIndex - 1] > mas[currentIndex - 2]
    );
  };

  const isSellSignal = async ({ closeValues, count = 3 }) => {
    const countBull = await countBearMAs({ closeValues });
    return countBull >= count;
    const mas = await computeValue(closeValues);
    const currentIndex = mas.length - 1;
    return (
      mas[currentIndex] < mas[currentIndex - 1] &&
      mas[currentIndex - 1] < mas[currentIndex - 2] &&
      mas[currentIndex - 2] < mas[currentIndex - 3]
    );
  };

  /* const shortIsOverLong = async ({ closeValues }) => {
    const maShort = await TulindHelper.getMA(closeValues, depth);
    const maLong = await TulindHelper.getMA(closeValues, long);
    return maShort[maShort.length - 1] > maLong[maLong.length - 1];
  }; */

  return {
    isBuySignal,
    isSellSignal,
    getDifferenceCompareToPrice,
    countBullMAs,
  };
};

module.exports = MaTrendSignal;
