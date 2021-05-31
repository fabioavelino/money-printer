const TulindHelper = require("../helpers/tulind_helper");

const PpoSignal = ([short = 6, long = 16]) => {
  const computeValue = async (closeValues) => {
    const ppos = await TulindHelper.getPPOs(closeValues, [short, long]); //[6, 16] [10, 21] ?
    //const currentIndex = macd.length - 1;
    return ppos;
  };

  const isBuySignal = async ({ closeValues, currentCloseValue }) => {
    const ppos = await computeValue(closeValues);
    const currentIndex = ppos.length - 1;
    /* if (ppos[currentIndex] * 100 > 60) {
      return (
        ppos[currentIndex] < ppos[currentIndex - 1] &&
        ppos[currentIndex] < ppos[currentIndex - 2]
      );
    } */
    if (ppos[currentIndex] * 100 <= -80) {
      return (
        closeValues[closeValues.length - 1] >
          closeValues[closeValues.length - 2] &&
        closeValues[closeValues.length - 2] >
          closeValues[closeValues.length - 3] &&
        closeValues[closeValues.length - 3] <
          closeValues[closeValues.length - 4]
      );
    }
    return true;
    if (ppos[currentIndex] < ppos[currentIndex - 1]) {
      return ppos[currentIndex] < ppos[currentIndex - 1];
    } else {
      return ppos[currentIndex] > ppos[currentIndex - 1];
    }

    console.log("");
    console.log(closeValues[closeValues.length - 1], ppos[currentIndex] * 100);
    console.log(
      closeValues[closeValues.length - 2],
      ppos[currentIndex - 1] * 100
    );
    console.log(
      closeValues[closeValues.length - 3],
      ppos[currentIndex - 2] * 100
    );
    return (
      ppos[currentIndex] > ppos[currentIndex - 1] &&
      ppos[currentIndex] > ppos[currentIndex - 2]
    );

    console.log("");
    console.log(closeValues[closeValues.length - 1], ppos[currentIndex] * 100);
    console.log(
      closeValues[closeValues.length - 2],
      ppos[currentIndex - 1] * 100
    );
    console.log(
      closeValues[closeValues.length - 3],
      ppos[currentIndex - 2] * 100
    );

    console.log(
      closeValues[closeValues.length - 4],
      ppos[currentIndex - 3] * 100
    );
    return (
      ppos[currentIndex] > ppos[currentIndex - 1] &&
      ppos[currentIndex - 1] > ppos[currentIndex - 2]
    );
    return (
      ppos[currentIndex] < ppos[currentIndex - 1] * 2.2 &&
      ppos[currentIndex] > ppos[currentIndex - 1] * 1.1
    );
    /* if (ppos[currentIndex] > 0 && ppos[currentIndex - 1] < 0) {
      console.log(ppos[currentIndex - 1], closeValues[closeValues.length - 2]);
      console.log(ppos[currentIndex], closeValues[closeValues.length - 1]);
    } */

    /* if (
      ppos[currentIndex] < -3.6 &&
      ppos[currentIndex] > ppos[currentIndex - 1] &&
      ppos[currentIndex - 1] > ppos[currentIndex - 2]
    ) {
      console.log(ppos[currentIndex]);
      console.log(ppos[currentIndex] - 1);
      console.log(ppos[currentIndex] - 2);
    } */
    return (
      ppos[currentIndex] < -4 && //-3 -3.6 -4 -6.8 -7 -7.2=>-7.8 -13
      ppos[currentIndex] > ppos[currentIndex - 1] &&
      ppos[currentIndex - 1] >
        ppos[
          currentIndex - 2
        ] /*  &&
      ppos[currentIndex - 2] > ppos[currentIndex - 3] */
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const ppos = await computeValue(closeValues);
    const currentIndex = ppos.length - 1;
    /* if (ppos[currentIndex] * 100 > 60) {
      return ppos[currentIndex] > ppos[currentIndex - 1];
    } */
    /* if (ppos[currentIndex] * 100 <= 20) {
      return false;
    } */
    return (
      closeValues[closeValues.length - 1] <
        closeValues[closeValues.length - 2] &&
      closeValues[closeValues.length - 2] < closeValues[closeValues.length - 3]
    );

    /* if (
      ppos[currentIndex] < ppos[currentIndex - 1] &&
      ppos[currentIndex - 1] < ppos[currentIndex - 2] &&
      ppos[currentIndex - 2] < ppos[currentIndex - 3]
    ) {
      console.log(ppos[currentIndex]);
      console.log(ppos[currentIndex - 1]);
      console.log(ppos[currentIndex - 2]);
      console.log(ppos[currentIndex - 3]);
    } */
    return (
      ppos[currentIndex] < ppos[currentIndex - 1] &&
      ppos[currentIndex - 1] < ppos[currentIndex - 2]
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = PpoSignal;
