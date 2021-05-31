const TulindHelper = require("../helpers/tulind_helper");
const RSISignal = require("./rsi_signal");

const MacdzlSignal = ([short = 12, long = 26, signal = 9]) => {
  const rsiSignal = RSISignal({ highLimit: 80, lowLimit: 20 });
  const computeValue = async (closeValues) => {
    const macdzls = await TulindHelper.getMACDZLs(closeValues, [
      short,
      long,
      signal,
    ]); //[10, 22, 7] || [12, 26, 9]
    const currentIndex = macdzls.length - 1;
    /* if (closeValues[closeValues.length - 1] === 7384.85) {
      console.log(macdzls[currentIndex]);
    } */
    return macdzls;
  };

  const isBuySignal = async ({ closeValues, currentCloseValue }) => {
    const macdzls = await computeValue(closeValues);
    const currentIndex = macdzls.length - 1;
    const LIMIT = -30;
    return (
      macdzls[currentIndex].macdzl > LIMIT &&
      macdzls[currentIndex - 1].macdzl < LIMIT
    );
    if (macdzls[currentIndex].short < 0) {
      //return macdzls[currentIndex].short > macdzls[currentIndex - 1].short;
      return (
        macdzls[currentIndex].macdzl > -2 && //-2 -4
        macdzls[currentIndex].macdzl > macdzls[currentIndex - 1].macdzl && //0.08, 0.11, 0.13, 0.9, 3
        macdzls[currentIndex].short > macdzls[currentIndex - 1].short
      );
    }
    return (
      macdzls[currentIndex].macdzl > -30 && // -20 -30
      macdzls[currentIndex].macdzl > macdzls[currentIndex - 1].macdzl && //0.08, 0.11, 0.13, 0.9, 3
      macdzls[currentIndex - 1].macdzl > macdzls[currentIndex - 2].macdzl &&
      macdzls[currentIndex].short > macdzls[currentIndex - 1].short
      //macdzls[currentIndex - 1].short > macdzls[currentIndex - 2].short
    );
    return (
      macdzls[currentIndex].macdzl >= 0 &&
      macdzls[currentIndex - 1].macdzl < 0 &&
      /* macdzls[currentIndex].long > macdzls[currentIndex - 1].long && */
      macdzls[currentIndex].short > macdzls[currentIndex - 1].short &&
      macdzls[currentIndex].macdzl > macdzls[currentIndex - 1].macdzl &&
      macdzls[currentIndex - 1].macdzl > macdzls[currentIndex - 2].macdzl //0.08, 0.11, 0.13, 0.9, 3
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const macdzls = await computeValue(closeValues);
    const currentIndex = macdzls.length - 1;

    const LOWER_LIMIT = -30;
    const UPPER_LIMIT = 60; //30=>389 40=>385 50=> 396 60=>428
    return (
      (macdzls[currentIndex].macdzl < UPPER_LIMIT &&
        macdzls[currentIndex - 1].macdzl > UPPER_LIMIT) ||
      (macdzls[currentIndex].macdzl < LOWER_LIMIT &&
        macdzls[currentIndex - 1].macdzl > LOWER_LIMIT)
    );
    if (macdzls[currentIndex].short < 0) {
      return (
        macdzls[currentIndex].short < macdzls[currentIndex - 1].short &&
        macdzls[currentIndex].long > macdzls[currentIndex - 1].long
      );
    }
    return (
      macdzls[currentIndex].short < macdzls[currentIndex - 1].short &&
      macdzls[currentIndex - 1].short > macdzls[currentIndex - 2].short &&
      macdzls[currentIndex - 2].short > macdzls[currentIndex - 3].short &&
      macdzls[currentIndex].long < macdzls[currentIndex - 1].long
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = MacdzlSignal;
