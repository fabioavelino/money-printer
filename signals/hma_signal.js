const TulindHelper = require("../helpers/tulind_helper");

let firstLog = false;
const HmaSignal = () => {
  const computeValue = async (closeValues) => {
    const hmaShort = await TulindHelper.getHMA(closeValues, 3); //4
    const hmaLong = await TulindHelper.getHMA(closeValues, 14); //15
    const previousHmaLong = hmaLong[hmaLong.length - 2];
    const previousHmaShort = hmaShort[hmaShort.length - 2];
    const currentHmaLong = hmaLong[hmaLong.length - 1];
    const currentHmaShort = hmaShort[hmaShort.length - 1];
    return {
      previousHmaShort,
      previousHmaLong,
      currentHmaShort,
      currentHmaLong,
    };
  };

  const isBuySignal = async ({ closeValues, currentCloseValue }) => {
    const {
      previousHmaShort,
      previousHmaLong,
      currentHmaShort,
      currentHmaLong,
    } = await computeValue(closeValues);
    return (
      previousHmaShort <= previousHmaLong && currentHmaShort >= currentHmaLong
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const {
      previousHmaShort,
      previousHmaLong,
      currentHmaShort,
      currentHmaLong,
    } = await computeValue(closeValues);
    return (
      previousHmaShort >= previousHmaLong && currentHmaShort <= currentHmaLong
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = HmaSignal;
