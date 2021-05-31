/**
 * Trash because overfitted
 */
const MaxLossSignal = require("../signals/max_loss_signal");
const MinGainSignal = require("../signals/min_gain_signal");
const MacdzlSignal = require("../signals/macdzl_signal");
const MacdSignal = require("../signals/macd_trend_signal");
const RSISignal = require("../signals/rsi_signal");
const BollBandSignal = require("../signals/boll_band_signal");
const InstantLossSignal = require("../signals/instant_loss_signal");
const PpoSignal = require("../signals/ppo_trend_signal");
const dayjs = require("dayjs");
const BearOrBullSignal = require("../signals/bear_or_bull_signal");

const isTradingRangeTime = (currentCloseTime) => {
  const now = dayjs();
  const currentCloseTimeParsed = dayjs(currentCloseTime);
  const diffInSecond = currentCloseTimeParsed.diff(now, "second");
  return diffInSecond <= 33 && diffInSecond >= 0;
};

const isDiffWithLastTransactionEnough = (
  currentCloseTime,
  lastSellTransaction,
  lastBuyTransaction
) => {
  if (lastBuyTransaction && lastSellTransaction) {
    const buyPrice = lastBuyTransaction.price;
    const sellPrice = lastSellTransaction.price;
    const sellDate = lastSellTransaction.date;
    const diff = lastSellTransaction
      ? dayjs(currentCloseTime).diff(dayjs(sellDate), "hour")
      : 90;
    if (buyPrice < sellPrice) {
      return diff > 5; // 2 4 10
    }
    return diff > 1; //BTC: 0=>4380 1=>4225 2=>4332 - ETH: 0=>4865 1=>5054 2=>4133 3=>4560 4=>5301
  }
  return true;
};

const SimpleStrategy = (backtestMode = true) => {
  const RECOMMENDED_INTERVAL = "4h";
  const macdSignal = MacdSignal([60, 250, 9]); //11, 24, 7 9,24,7 => 62, 250
  const ppoSignal = PpoSignal([7, 15]); //7, 15 //7, 16 //7, 18
  const bearSignal = BearOrBullSignal(40); //15*12 ? 40 150
  const instantLossSignal = InstantLossSignal({
    instantLossPercentage: -10 / 100, // BTC:-1 -2.3 -2.4 -3.5
  });

  const isBuyingTime = async ({
    closeValues,
    lowValues,
    highValues,
    currentCloseTime,
    currentCloseValue,
    lastSellTransaction,
    lastBuyTransaction,
  }) => {
    const isTradingRangeTimePassed = backtestMode
      ? true
      : isTradingRangeTime(currentCloseTime);
    if (!isTradingRangeTimePassed) {
      return false;
    }

    /* if (bearSignal.isBearish({ closeValues })) {
      return false;
    } */
    if (
      closeValues[closeValues.length - 1] <
        closeValues[closeValues.length - 2] &&
      closeValues[closeValues.length - 2] <
        closeValues[closeValues.length - 3] &&
      closeValues[closeValues.length - 3] < closeValues[closeValues.length - 4]
    ) {
      return false;
    }
    const ppoPassed = await ppoSignal.isBuySignal({ closeValues });
    const macdPassed = await macdSignal.isBuySignal({
      closeValues: closeValues,
    });
    return ppoPassed && macdPassed;
  };

  const isSellingTime = async ({
    closeValues,
    currentCloseValue,
    lowValues,
    highValues,
    lastBuyTransaction,
    currentCloseTime,
  }) => {
    const isTradingRangeTimePassed = backtestMode
      ? true
      : isTradingRangeTime(currentCloseTime);
    if (!isTradingRangeTimePassed) {
      return false;
    }

    const ppoPassed = await ppoSignal.isSellSignal({ closeValues });
    const macdPassed = await macdSignal.isSellSignal({
      closeValues: closeValues,
    });
    /* const maxLossPassed = maxLossSignal.isSellSignal(
      currentCloseValue,
      lastBuyTransaction.price
    ); */

    // Checking if trading is not losing directly
    const {
      instantLossPassed,
      instantLossPriceLimit,
    } = instantLossSignal.isSellSignal(
      currentCloseValue,
      closeValues,
      undefined,
      true
    );

    if (instantLossPassed) {
      return true;
    }

    /* const instantLossPassed = instantLossSignal.isSellSignal(closeValues); */
    /* const bollBandPassed = await bollBandSignal.isLow({
      closeValues,
      currentCloseValue,
    }); */
    /* let isNegativeDiffNotAcceptable = true;
    if (macdPassed && lastBuyTransaction.price > currentCloseValue) {
      isNegativeDiffNotAcceptable =
        100 - (lastBuyTransaction.price * 100) / currentCloseValue < -3; //0.7 //-1 //-1.3 //-1.5 //-7 -11 -13 -15
    } */
    return (
      /* maxLossPassed || */
      /* instantLossPassed || */
      ppoPassed && macdPassed
      //isNegativeDiffNotAcceptable /*  && lastBuyTransaction.price < currentCloseValue */
      /* (macdPassed &&
        isNegativeDiffNotAcceptable) */
      /* (macdPassed &&
        lastBuyTransaction.price >= currentCloseValue &&
        bollBandPassed) */
    );
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
