const MyHelper = require("../helpers/my_helper");

const StddevSignal = (depth = 50) => {
  const computeValue = async (closeValues) => {
    const stddevs = await MyHelper.getStddev(closeValues, depth);
    return stddevs;
  };

  const isBuySignal = async ({ closeValues }) => {
    const stddevs = await computeValue(closeValues);
    if (closeValues[closeValues.length - 1] === 159.92964) {
      console.log(stddevs.slice(stddevs.length - 4));
    }
    if (
      stddevs[stddevs.length - 3] < stddevs[stddevs.length - 2] &&
      stddevs[stddevs.length - 2] > stddevs[stddevs.length - 1]
    ) {
      return true;
    }
    if (
      stddevs[stddevs.length - 3] > stddevs[stddevs.length - 2] &&
      stddevs[stddevs.length - 2] < stddevs[stddevs.length - 1]
    ) {
      return true;
    }
    return false;
  };
  const isSellSignal = async ({ closeValues }) => {
    const stddevs = await computeValue(closeValues);
    if (
      (stddevs[stddevs.length - 3] < stddevs[stddevs.length - 2] &&
        stddevs[stddevs.length - 2] > stddevs[stddevs.length - 1]) ||
      (stddevs[stddevs.length - 4] < stddevs[stddevs.length - 3] &&
        stddevs[stddevs.length - 3] > stddevs[stddevs.length - 2] &&
        stddevs[stddevs.length - 2] > stddevs[stddevs.length - 1])
    ) {
      return true;
    }
    if (
      (stddevs[stddevs.length - 3] > stddevs[stddevs.length - 2] &&
        stddevs[stddevs.length - 2] < stddevs[stddevs.length - 1]) ||
      (stddevs[stddevs.length - 4] > stddevs[stddevs.length - 3] &&
        stddevs[stddevs.length - 3] < stddevs[stddevs.length - 2] &&
        stddevs[stddevs.length - 2] < stddevs[stddevs.length - 1])
    ) {
      return true;
    }
    return false;
  };

  return { isBuySignal, isSellSignal };
};

module.exports = StddevSignal;
