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
    const currentIndexFir = first.length - 1;
    const currentIndexSec = second.length - 1;
    return macd[macd.length - 1] > 0 && macd[macd.length - 2] < 0;
    if (first[currentIndexFir] < -40) {
      return (
        first[currentIndexFir] > first[currentIndexFir - 1] &&
        first[currentIndexFir - 1] < first[currentIndexFir - 2]
      );
    }
    return (
      first[currentIndexFir] > first[currentIndexFir - 1] &&
      second[currentIndexSec] > second[currentIndexSec - 1] &&
      macd[currentIndex] >
        macd[currentIndex - 1] /* && 
      macd[currentIndex] > 0 */
      //macd[currentIndex] > macd[currentIndex - 1]
    );
  };

  const isUpSignal = async ({ closeValues, currentCloseValue }) => {
    const [first, second, macd] = await computeValue(closeValues);
    const currentIndex = macd.length - 1;
    return (
      first[first.length - 1] >
      first[
        first.length - 2
      ] /* &&
      first[first.length - 2] > first[first.length - 3] */
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const [first, second, macd] = await computeValue(closeValues);
    const currentIndex = macd.length - 1;
    const currentIndexFir = first.length - 1;
    const currentIndexSec = second.length - 1;
    return macd[macd.length - 1] < 0 && macd[macd.length - 2] > 0;
    return (
      (first[currentIndexFir] < first[currentIndexFir - 1] &&
        first[currentIndexFir - 1] < first[currentIndexFir - 2] &&
        first[currentIndexFir - 2] < first[currentIndexFir - 3]) ||
      (macd[currentIndex] < 5 &&
        macd[currentIndex] <
          macd[
            currentIndex - 1
          ]) /* &&
        macd[currentIndex - 1] < macd[currentIndex - 2] &&
        macd[currentIndex - 2] < macd[currentIndex - 3] */ //5
      //macd[currentIndex] > macd[currentIndex - 1]
    );
  };

  return { isBuySignal, isSellSignal, isUpSignal };
};

module.exports = MacdSignal;
