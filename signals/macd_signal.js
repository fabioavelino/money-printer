const TulindHelper = require("../helpers/tulind_helper");

const MacdSignal = ([short = 12, long = 26, signal = 9]) => {
  const computeValue = async (closeValues) => {
    const [
      macd,
      macd_signal,
      macd_histogram,
    ] = await TulindHelper.getMACDs(closeValues, [short, long, signal]); //[10, 22, 7] || [12, 26, 9]
    //const currentIndex = macd.length - 1;
    return [macd, macd_signal, macd_histogram];
  };

  const isBuySignal = async ({ closeValues, currentCloseValue }) => {
    const [first, second, macd] = await computeValue(closeValues);
    const currentIndex = macd.length - 1;
    return (
      macd[currentIndex - 1] < 0 &&
      macd[currentIndex] > 0 &&
      first[first.length - 1] < 0
    );
    return (
      first[first.length - 1] < 0 &&
      first[first.length - 1] > first[first.length - 2]
    );
    const LIMIT = -9; //-9
    if (first[first.length - 1] < LIMIT && second[second.length - 1] < LIMIT) {
      return macd[currentIndex] >= 0.9; //0.001 0.2 0.26 0.6 0.9 1 3.7
    }
    return false;
  };

  const isUpSignal = async ({ closeValues, currentCloseValue }) => {
    const [first, second, macd] = await computeValue(closeValues);
    const currentIndex = macd.length - 1;
    const LIMIT = 0; //-9
    return macd[currentIndex - 1] < 0 && macd[currentIndex] < 0;
    return (
      first[first.length - 1] > first[first.length - 2] &&
      first[first.length - 2] > first[first.length - 3]
    );
    if (first[first.length - 1] > LIMIT && second[second.length - 1] > LIMIT) {
      return macd[currentIndex] >= 0; //0.001 0.2 0.26 0.6 0.9 1 3.7
    }
    return false;
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const macdArray = await computeValue(closeValues);
    const macd = macdArray[2];
    const currentIndex = macd.length - 1;
    return macd[currentIndex] <= 0 /* && macd[currentIndex - 1] >= 0 */;
  };

  return { isBuySignal, isUpSignal, isSellSignal };
};

module.exports = MacdSignal;
