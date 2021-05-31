const TulindHelper = require("../helpers/tulind_helper");

const AlmaSignal = () => {
  const computeValue = async (closeValues) => {
    const alma = await TulindHelper.getALMA(closeValues, [4, 6, 0.85]); //bearish: 4 17 / bullish: 41 50 51 52
    return alma;
  };

  const isBuySignal = async ({
    closeValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const alma = await computeValue(closeValues);
    /* if (currentCloseTime === "2020-12-27T00:59:59+01:00") {
      console.log(alma.length);
      console.log(alma.slice(alma.length - 10));
    } */
    const currentIndex = alma.length - 1;
    return (
      alma[currentIndex] > alma[currentIndex - 1] &&
      alma[currentIndex - 1] > alma[currentIndex - 2]
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const alma = await computeValue(closeValues);
    const currentIndex = alma.length - 1;
    return (
      alma[currentIndex] <
      alma[
        currentIndex - 1
      ] /*  &&
      alma[currentIndex - 1] < alma[currentIndex - 2] */
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = AlmaSignal;
