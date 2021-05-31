const { getSuperSmoother } = require("../helpers/ehlers_helper");
const TulindHelper = require("../helpers/tulind_helper");

const RenkoSignal = ({ atr, sizePrice, atr_multiplier, pricePercentage }) => {
  //marche bien actuellement pour les trend !!!
  const getPriceSize = (highs, lows, closes) => {
    const max = TulindHelper.getMax(highs, 5);
    const min = TulindHelper.getMin(lows, 5);
    const diff = Math.abs(max - min);
    return diff / 4;
  };

  const computeValue = async (highs, lows, closes) => {
    const renko = await TulindHelper.getRenko([highs, lows, closes], {
      atr,
      sizePrice: sizePrice
        ? sizePrice
        : pricePercentage
        ? closes[closes.length - 1] * pricePercentage
        : undefined,
      atr_multiplier,
    });
    return renko;
  };

  const isBuySignal = async ({ lowValues, highValues, closeValues }) => {
    try {
      const renko = await computeValue(highValues, lowValues, closeValues);
      return (
        renko[renko.length - 1].ranging === "+" &&
        renko[renko.length - 2].ranging === "+" &&
        renko[renko.length - 3].ranging === "+"
      );
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const isSellSignal = async ({ lowValues, highValues, closeValues }) => {
    try {
      const renko = await computeValue(highValues, lowValues, closeValues);
      return (
        renko[renko.length - 1].ranging === "-" &&
        renko[renko.length - 2].ranging === "-" &&
        renko[renko.length - 3].ranging ===
          "-" /* &&
        renko[renko.length - 4].ranging === "-" */
      );
    } catch (error) {
      return false;
    }
  };

  return { isBuySignal, isSellSignal };
};

module.exports = RenkoSignal;
