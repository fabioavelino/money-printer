const dayjs = require("dayjs");
const ehlers_helper = require("../helpers/ehlers_helper");
const TulindHelper = require("../helpers/tulind_helper");

const countDiff = (lastBuyDate, currentCloseTime, interval) => {
  let unit = "hour";
  let num = 4;
  switch (interval) {
    case "2h":
      unit = "hour";
      num = 2;
    case "1d":
      unit = "day";
      num = 1;
    case "4h":
    default:
      unit = "hour";
      num = 4;
  }
  const diff = dayjs(currentCloseTime).diff(dayjs(lastBuyDate), unit);
  return diff / num;
};

const RiskManagementSignal = ({
  atr_length,
  atr_multiplier_loss = 6,
  atr_multiplier_profit = 6,
  atr_multiplier_trailing_profit = 6,
}) => {
  const computeValue = async ({ highValues, lowValues, closeValues }) => {
    const atr = await TulindHelper.getATR(
      [highValues, lowValues, closeValues],
      atr_length ? atr_length : ehlers_helper.getCosineIFM(closeValues)
    );
    return atr;
  };

  const isTakeProfit = async ({
    currentCloseValue,
    lastBuyTransaction,
    highValues,
    lowValues,
    closeValues,
    override_atr_multiplier,
  }) => {
    const result = await computeValue({ highValues, lowValues, closeValues });
    const takeProfit =
      lastBuyTransaction.price +
      result *
        (override_atr_multiplier
          ? override_atr_multiplier
          : atr_multiplier_profit);
    return currentCloseValue > takeProfit;
  };

  const isTrailingTakeProfit = async ({
    currentCloseValue,
    currentCloseTime,
    lastBuyTransaction,
    highValues,
    lowValues,
    closeValues,
    override_atr_multiplier,
  }) => {
    const result = await computeValue({ highValues, lowValues, closeValues });
    const { maxCloseValue, indexMax } = TulindHelper.getMaxCloseValue(
      closeValues
    );
    if (countDiff(lastBuyTransaction.date, currentCloseTime) > indexMax) {
      const takeProfit =
        maxCloseValue -
        result *
          (override_atr_multiplier
            ? override_atr_multiplier
            : atr_multiplier_trailing_profit);
      return currentCloseValue < takeProfit;
    }
    return false;
  };

  const isStopLoss = async ({
    currentCloseValue,
    lastBuyTransaction,
    highValues,
    lowValues,
    closeValues,
    override_atr_multiplier,
  }) => {
    const result = await computeValue({ highValues, lowValues, closeValues });
    const stopLoss =
      lastBuyTransaction.price -
      result *
        (override_atr_multiplier
          ? override_atr_multiplier
          : atr_multiplier_loss);
    return currentCloseValue < stopLoss;
  };

  return { isStopLoss, isTakeProfit, isTrailingTakeProfit };
};

module.exports = RiskManagementSignal;
