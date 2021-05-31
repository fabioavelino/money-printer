const TulindHelper = require("../helpers/tulind_helper");
const EhlersHelper = require("../helpers/ehlers_helper");

const EhlersTestSignal = () => {
  const computeValue = async (closeValues) => {
    const test = await TulindHelper.getKAMA(closeValues, 60);
    /* if (closeValues[closeValues.length - 1] === 39250) {
      console.log(test.slice(test.length - 10));
      console.log(trigger.slice(trigger.length - 10));
    } */
    return test;
  };

  const isBuySignal = async ({
    closeValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const test = await computeValue(closeValues);
    return (
      test[test.length - 1] >
      test[
        test.length - 2
      ] /* *
        1.02 */ /* || //0.99 //1.005
      test[test.length - 1] >
        test[test.length - 3] *
          1.02 */ /* &&
      test[test.length - 2] > test[test.length - 3] &&
      test[test.length - 3] > test[test.length - 4] */
    );
    return (
      test[test.length - 1] < trigger[trigger.length - 1] &&
      trigger[trigger.length - 2] < trigger[trigger.length - 1] &&
      test[test.length - 2] <
        test[
          test.length - 1
        ] /*  &&
      test[test.length - 2] < trigger[trigger.length - 2] &&
      test[test.length - 3] < trigger[trigger.length - 3] */
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const test = await computeValue(closeValues);
    return (
      test[test.length - 1] <
      test[
        test.length - 2
      ] /* &&
      test[test.length - 2] < test[test.length - 3] &&
      test[test.length - 3] < test[test.length - 4] */
    );
    return (
      test[test.length - 1] > trigger[trigger.length - 1] &&
      test[test.length - 2] > trigger[trigger.length - 2]
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = EhlersTestSignal;
