const { getMinMax } = require("../helpers/data_helper");
const math = require("mathjs");
const TulindHelper = require("../helpers/tulind_helper");

const StochRSISignal = ({ highLimit = 80, lowLimit = 20 }) => {
  const computeValue = async (closeValues) => {
    const { kValues, dValues } = await TulindHelper.getStochRSIs(
      closeValues,
      14
    );

    return {
      previousK: kValues[kValues.length - 2],
      previousD: dValues[dValues.length - 2],
      currentK: kValues[kValues.length - 1],
      currentD: dValues[dValues.length - 1],
    };
  };

  const isBuySignal = async ({ closeValues }) => {
    const { previousK, previousD, currentK, currentD } = await computeValue(
      closeValues
    );

    if (closeValues[closeValues.length - 1] === 18368.0) {
      console.log({ previousK, previousD, currentK, currentD });
    }

    let havePassed =
      previousK <= previousD &&
      currentK >= currentD &&
      currentD < lowLimit / 100; /* && previousRsi <= lowLimit */
    return havePassed;
  };

  const isSellSignal = async ({ closeValues }) => {
    const { previousK, previousD, currentK, currentD } = await computeValue(
      closeValues
    );
    if (closeValues[closeValues.length - 1] === 18368.0) {
      console.log({ previousK, previousD, currentK, currentD });
    }
    let havePassed =
      previousK >= previousD &&
      currentK <= currentD &&
      currentD > highLimit / 100;
    return havePassed;
  };

  return { isBuySignal, isSellSignal };
};

module.exports = StochRSISignal;
