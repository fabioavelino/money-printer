const TulindHelper = require("../helpers/tulind_helper");
const EhlersHelper = require("../helpers/ehlers_helper");

const SupersmootherTrendSignal = (depth = 16) => {
  const computeValue = (closeValues) => {
    const values = EhlersHelper.getSuperSmoother(closeValues, depth);
    return values;
  };

  const countBull = ({ closeValues }) => {
    const values = computeValue(closeValues);
    let count = 0;
    let start = values.length - 1;
    for (let i = start; i > 0; i--) {
      if (values[i] > values[i - 1]) {
        count++;
      } else {
        return count;
      }
    }
    return count;
  };

  const countBear = ({ closeValues }) => {
    const values = computeValue(closeValues);
    let count = 0;
    let start = values.length - 1;
    for (let i = start; i > 0; i--) {
      if (values[i] < values[i - 1]) {
        count++;
      } else {
        return count;
      }
    }
    return count;
  };

  /* const getDifferenceCompareToPrice = async ({ closeValues }) => {
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
  }; */

  const isBuySignal = async ({ closeValues, count = 4 }) => {
    const values = EhlersHelper.getSuperSmoother(closeValues, depth);
    const isBullish = countBull({ closeValues }) >= count;
    return isBullish;

    const bull = countBull({ closeValues });
    if (bull >= count) {
      const values = computeValue(closeValues);
      //console.log(values[values.length - 2] / values[values.length - 1]);
      return true;
    }
  };

  const isSellSignal = async ({ closeValues, count = 1 }) => {
    //const values = EhlersHelper.getSuperSmoother(closeValues, depth);
    const bear = countBear({ closeValues });
    return bear >= count;
  };

  return {
    isBuySignal,
    isSellSignal,
  };
};

module.exports = SupersmootherTrendSignal;
