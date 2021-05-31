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
    if (macdzls[currentIndex].short < 0 && macdzls[currentIndex].long < 0) {
      return (
        macdzls[currentIndex].short > macdzls[currentIndex - 1].short &&
        macdzls[currentIndex - 1].short > macdzls[currentIndex - 2].short &&
        macdzls[currentIndex - 2].short > macdzls[currentIndex - 3].short
      );
    }
    return false;
    return (
      macdzls[currentIndex].macdzl >
        macdzls[currentIndex - 1].macdzl * 10000000000 &&
      macdzls[currentIndex - 1].macdzl < macdzls[currentIndex - 2].macdzl
    );
    return (
      macdzls[currentIndex].macdzl > LOWER_LIMIT &&
      macdzls[currentIndex - 1].macdzl < LOWER_LIMIT &&
      macdzls[currentIndex - 1].macdzl > macdzls[currentIndex - 2].macdzl
      //macdzls[currentIndex].short > macdzls[currentIndex - 1].short
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const macdzls = await computeValue(closeValues);
    const currentIndex = macdzls.length - 1;
    return (
      macdzls[currentIndex].macdzl < 0 &&
      macdzls[currentIndex].short < macdzls[currentIndex - 1].short &&
      macdzls[currentIndex - 1].short < macdzls[currentIndex - 2].short
    );

    //30=>389 40=>385 50=> 396 60=>428
    return (
      /* (macdzls[currentIndex].macdzl < UPPER_LIMIT &&
        macdzls[currentIndex - 1].macdzl > UPPER_LIMIT) || */
      macdzls[currentIndex].macdzl < macdzls[currentIndex - 1].macdzl &&
      macdzls[currentIndex - 1].macdzl > macdzls[currentIndex - 2].macdzl
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = MacdzlSignal;
