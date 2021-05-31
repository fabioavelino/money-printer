const TulindHelper = require("../helpers/tulind_helper");
const EhlersHelper = require("../helpers/ehlers_helper");

const EhlersSinewaveSignal = (
  hpLength = 40,
  ssfLength = 10,
  highSep = 0.9,
  lowSep = 0.4
) => {
  const computeValue = (closeValues) => {
    const waves = EhlersHelper.getEhlersEvenBetterSineWave(closeValues, [
      hpLength,
      ssfLength,
    ]);
    const sig = waves.map((w) => (w > 0 ? 1 : w < 0 ? -1 : 0));
    const { iTrend, trigger } = EhlersHelper.getInstantaneousTrend(closeValues);
    if (closeValues[closeValues.length - 1] === 39250) {
      console.log(iTrend.slice(iTrend.length - 10));
      console.log(trigger.slice(trigger.length - 10));
    }
    return sig;
  };

  const isBuySignal = async ({
    closeValues,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const waves = computeValue(closeValues);
    return (
      waves[waves.length - 1] === 1 /*  && waves[waves.length - 2] === -1 */
    );
    return (
      waves[waves.length - 1] > -0.9 &&
      waves[waves.length - 1] > waves[waves.length - 2] &&
      waves[waves.length - 2] > waves[waves.length - 3]
    );
    return (
      waves[waves.length - 1] === 1 &&
      waves[waves.length - 2] ===
        -1 /* &&
      waves[waves.length - 3] === -1 &&
      waves[waves.length - 4] === -1 &&
      waves[waves.length - 5] === -1 &&
      waves[waves.length - 6] === -1 */
    );
  };

  const isSellSignal = async ({ closeValues, currentCloseValue }) => {
    const waves = computeValue(closeValues);
    return (
      waves[waves.length - 1] === -1 /*  && waves[waves.length - 2] === 1 */
    );
    return (
      waves[waves.length - 1] < 0.85 &&
      waves[waves.length - 1] < waves[waves.length - 2] &&
      waves[waves.length - 2] < waves[waves.length - 3] &&
      waves[waves.length - 3] < waves[waves.length - 4]
    );
    return (
      waves[waves.length - 1] === -1 &&
      waves[waves.length - 2] ===
        1 /* &&
      waves[waves.length - 3] === 1 &&
      waves[waves.length - 4] === 1 &&
      waves[waves.length - 5] === 1 &&
      waves[waves.length - 6] === 1 &&
      waves[waves.length - 7] === 1 */
    );
  };

  return { isBuySignal, isSellSignal };
};

module.exports = EhlersSinewaveSignal;
