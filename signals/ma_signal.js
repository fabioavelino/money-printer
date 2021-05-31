const TulindHelper = require("../helpers/tulind_helper");

const MaSignal = (short = 5, long = 14, type = "MA") => {
  //TEMA: 4-14 //HMA: 5, 14
  const computeValue = async (closeValues) => {
    const getType = `get${type}`;
    const masShort = await TulindHelper[getType](closeValues, short);
    const masLong = await TulindHelper[getType](closeValues, long); //MA: 3-38 3-70
    return {
      masShort,
      masLong,
    };
  };

  const isBuySignal = async ({ closeValues, currentCloseValue }) => {
    const { masShort, masLong } = await computeValue(closeValues);
    return (
      masShort[masShort.length - 1] > masLong[masLong.length - 1] &&
      masShort[masShort.length - 2] < masLong[masLong.length - 2]
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const { masShort, masLong } = await computeValue(closeValues);
    return (
      masShort[masShort.length - 1] < masLong[masLong.length - 1] &&
      masShort[masShort.length - 2] > masLong[masLong.length - 2]
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = MaSignal;
