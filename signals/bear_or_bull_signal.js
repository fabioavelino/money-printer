const TulindHelper = require("../helpers/tulind_helper");

const BearOrBullSignal = (previousPeriod = 10) => {
  const isBullish = ({ closeValues }) => {
    const currentIndex = closeValues.length - 2;
    const currentCloseValue = closeValues[currentIndex];
    const previousCloseValue = closeValues[currentIndex - previousPeriod + 1];
    return currentCloseValue > previousCloseValue;
  };

  const isBearish = ({ closeValues }) => {
    const currentIndex = closeValues.length - 2;
    const currentCloseValue = closeValues[currentIndex];
    const previousCloseValue = closeValues[currentIndex - previousPeriod + 1];
    return currentCloseValue < previousCloseValue;
  };

  const isContinuousBearish = ({ closeValues }) => {
    const startIndex = closeValues.length - 2;
    const endIndex = startIndex - previousPeriod + 1;
    for (let index = startIndex; index >= endIndex; index--) {
      if (closeValues[index] > closeValues[index - 1]) {
        return false;
      }
    }
    return true;
  };

  const isMostlyBearish = ({ closeValues }) => {
    const startIndex = closeValues.length - 2;
    const endIndex = startIndex - previousPeriod + 1;
    let haveIncreased = 0;
    let haveDecreased = 0;
    for (let index = startIndex; index >= endIndex; index--) {
      if (closeValues[index] > closeValues[index - 1]) {
        haveIncreased++;
      } else {
        haveDecreased++;
      }
    }
    return haveDecreased > haveIncreased;
  };

  const isMostlyBullish = ({ closeValues }) => {
    const startIndex = closeValues.length - 2;
    const endIndex = startIndex - previousPeriod + 1;
    let haveIncreased = 0;
    let haveDecreased = 0;
    for (let index = startIndex; index >= endIndex; index--) {
      if (closeValues[index] > closeValues[index - 1]) {
        haveIncreased++;
      } else {
        haveDecreased++;
      }
    }
    return haveDecreased < haveIncreased;
  };

  /* const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const {
      previousHmaShort,
      previousHmaLong,
      currentHmaShort,
      currentHmaLong,
    } = await computeValue(closeValues);
    return (
      previousHmaShort >= previousHmaLong && currentHmaShort <= currentHmaLong
    );
  }; */

  return {
    isBullish,
    isBearish,
    isMostlyBearish,
    isContinuousBearish,
    isMostlyBullish,
  };
};

module.exports = BearOrBullSignal;
