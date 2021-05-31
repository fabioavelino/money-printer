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

  const isUpSignal = async ({ closeValues, currentCloseValue }) => {
    const ppos = await computeValue(closeValues);
    const currentIndex = ppos.length - 1;
    return (
      ppos[currentIndex] < ppos[currentIndex - 1] * 2.2 &&
      ppos[currentIndex] > ppos[currentIndex - 1] * 1.1
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const ppos = await computeValue(closeValues);
    const currentIndex = ppos.length - 1;
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
      ppos[currentIndex] <
      ppos[
        currentIndex - 1
      ] /* &&
      ppos[currentIndex - 1] < ppos[currentIndex - 2] */
    );
  };

  return { isBuySignal, isUpSignal, isSellSignal };
};

module.exports = PpoSignal;
