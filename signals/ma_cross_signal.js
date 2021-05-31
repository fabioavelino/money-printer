const TulindHelper = require("../helpers/tulind_helper");

const MaSignal = (short = 5, long = 14, method = "MA") => {
  //TEMA: 4-14 //HMA: 5, 14
  const computeValue = async (closeValues) => {
    const masShort = await TulindHelper["get" + method](closeValues, short);
    const masLong = await TulindHelper["get" + method](closeValues, long); //MA: 3-38 3-70
    return {
      masShort,
      masLong,
    };
  };

  const isBuySignal = async ({
    closeValues,
    lowValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const { masShort, masLong } = await computeValue(closeValues);

    /* if (currentCloseTime === "2019-10-31T21:00:00+01:00") {
      console.log(closeValues[closeValues.length - 1]);
      console.log(masShort[masShort.length - 1], masLong[masLong.length - 1]);
      console.log(masShort[masShort.length - 2], masLong[masLong.length - 2]);
      console.log(masShort[masShort.length - 3], masLong[masLong.length - 3]);
    } */
    return (
      (masShort[masShort.length - 1] > masLong[masLong.length - 1] &&
        masShort[masShort.length - 2] < masLong[masLong.length - 2]) ||
      (masShort[masShort.length - 2] > masLong[masLong.length - 2] &&
        masShort[masShort.length - 3] < masLong[masLong.length - 3])
    );
  };

  const isSellSignal = async ({
    closeValues,
    lowValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const { masShort, masLong } = await computeValue(closeValues);
    return (
      masShort[masShort.length - 1] < masLong[masLong.length - 1] &&
      masShort[masShort.length - 2] > masLong[masLong.length - 2]
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = MaSignal;
