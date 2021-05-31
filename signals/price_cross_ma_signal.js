const TulindHelper = require("../helpers/tulind_helper");

const PriceCrossMaSignal = (depth) => {
  //TEMA: 4-14 //HMA: 5, 14
  const computeValue = async (values) => {
    const mas = await TulindHelper.getMA(values, depth);
    return mas;
  };

  const isBuySignal = async ({ closeValues, lowValues, highValues }) => {
    const lowMas = await computeValue(lowValues);
    const closeMas = await computeValue(closeValues);
    const highMas = await computeValue(highValues);

    const previousLowMa = lowMas[lowMas.length - 2];
    const previousCloseMa = closeMas[closeMas.length - 2];
    const previousHighMa = highMas[highMas.length - 2];

    const previousPrice = closeValues[closeValues.length - 2];
    const currentPrice = closeValues[closeValues.length - 1];
    const currentLowPrice = lowValues[lowValues.length - 1];

    if (
      previousHighMa > highMas[highMas.length - 3] &&
      highMas[highMas.length - 3] > highMas[highMas.length - 4]
    ) {
      if (currentPrice > previousHighMa) {
        if (previousPrice < previousHighMa) {
          return previousHighMa;
        }
        return currentPrice;
      }
    }
    return false;
  };

  const isSellSignal = async ({ closeValues, lowValues, highValues }) => {
    const lowMas = await computeValue(lowValues);
    const closeMas = await computeValue(closeValues);
    const highMas = await computeValue(highValues);

    const previousLowMa = lowMas[lowMas.length - 2];
    const previousCloseMa = closeMas[closeMas.length - 2];
    const previousHighMa = highMas[highMas.length - 2];

    const previousPrice = closeValues[closeValues.length - 2];
    const currentPrice = closeValues[closeValues.length - 1];
    const currentLowPrice = lowValues[lowValues.length - 1];

    if (previousPrice > previousHighMa && currentLowPrice < previousHighMa) {
      return previousHighMa;
    }
    return false;
  };

  return { isBuySignal, isSellSignal };
};

module.exports = PriceCrossMaSignal;
