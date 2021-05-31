const ArimaHelper = require("../../helpers/arima_helper");
const { getPriceFromReturns } = require("../../helpers/my_helper");
const { getMin, getMax } = require("../../helpers/tulind_helper");
const { getSuperSmoother } = require("../../helpers/ehlers_helper");

const ArimaSignal = () => {
  const computeValue = async (closeValues) => {
    const arima = ArimaHelper.getArimaPredict(closeValues, 5);
    return arima;
  };

  const isBuySignal = async ({
    closeValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const arima = await computeValue(closeValues);
    const min = getMin(arima, arima.length);
    return (
      arima[0] > closeValues[closeValues.length - 1] && arima[1] > arima[0]
    );
    return (
      closeValues[closeValues.length - 2] >
        closeValues[closeValues.length - 3] &&
      closeValues[closeValues.length - 1] >
        closeValues[closeValues.length - 2] &&
      arima[0] >
        closeValues[closeValues.length - 1] /* &&
      arima[1] > arima[0] */
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const arima = await computeValue(closeValues);
    const currentValue = closeValues[closeValues.length - 1];
    const max = getMax(arima, arima.length);
    return (
      currentValue > arima[0] &&
      arima[0] > arima[1] &&
      arima[1] > arima[2] &&
      arima[2] >
        arima[3] /* &&
      arima[3] > arima[4] &&
      arima[4] > arima[5] &&
      arima[5] > arima[6] */
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = ArimaSignal;
