/**
 * trash because overfitted as fuck
 */
const MaTrendSignal = require("../../signals/ma_trend_signal");
const dayjs = require("dayjs");
const BearOrBullSignal = require("../../signals/bear_or_bull_signal");
const MacdSignal = require("../../signals/macd_signal");
const PpoSignal = require("../../signals/ppo_signal");
const MaSignal = require("../../signals/ma_signal");
const MacdzlSignal = require("../../signals/macdzl_signal");
const AlmaSignal = require("../../signals/alma_signal");
const InstantLossSignal = require("../../signals/instant_loss_signal");
const MaxLossSignal = require("../../signals/max_loss_signal");
const PreviousMaxSignal = require("../../signals/previous_ath_signal");
const IchimokuSignal = require("../../signals/ichimoku_signal");

const isTradingRangeTime = (currentCloseTime) => {
  const now = dayjs();
  const currentCloseTimeParsed = dayjs(currentCloseTime);
  const diffInSecond = currentCloseTimeParsed.diff(now, "second");
  return diffInSecond <= 180 && diffInSecond >= 0;
};

const isDiffWithLastTransactionEnough = (
  currentCloseTime,
  lastSellTransaction,
  cryptoCurrency = "BTC",
  lastBuyTransaction
) => {
  if (lastBuyTransaction && lastSellTransaction) {
    const buyPrice = lastBuyTransaction.price;
    const sellPrice = lastSellTransaction.price;
    const sellDate = lastSellTransaction.date;
    const diff = lastSellTransaction
      ? dayjs(currentCloseTime).diff(dayjs(sellDate), "day")
      : 9;
    if (buyPrice < sellPrice) {
      return diff > (cryptoCurrency === "BTC" ? 4 : 4); // 2 4 10
    }
    return diff > (cryptoCurrency === "BTC" ? 2 : 2); //BTC: 0=>4380 1=>4225 2=>4332 - ETH: 0=>4865 1=>5054 2=>4133 3=>4560 4=>5301
  }
  return true;
};

const StrategyTrendBasedMa = (backtestMode = false, cryptoCurrency = "BTC") => {
  const RECOMMENDED_INTERVAL = "1d";

  const maTrendSignal = MaTrendSignal(16, "MA"); //4h=>97/100/102, 6h=>64, 12h=>32, 1d=>16 (16, 17, 21)
  const maSellTrendSignal = MaTrendSignal(3, "TEMA");
  const bearSignal = BearOrBullSignal(15); //13 - 15
  const continuousBearSignal = BearOrBullSignal(4); //13 - 15
  const macdSignal = MacdSignal([13, 26, 9]); //10,21, 9 || 13, 26, 9 || 22, 26, 9 || 16, 17, 9 || 17,18,9
  const ppoSignal = PpoSignal([6, 16]); //10,21, 9 || 13, 26, 9 || 22, 26, 9 || 16, 17, 9 || 17,18,9
  const instantLossSignal = InstantLossSignal({
    instantLossPercentage: cryptoCurrency === "BTC" ? -1.8 / 100 : -3 / 100, // BTC: -1.6 -1.8
  });
  const previousMaxSignal = PreviousMaxSignal(3, 1); //2,1 3,1 4,1

  const isBuyingTime = async ({
    closeValues,
    currentCloseTime,
    currentCloseValue,
    lastBuyTransaction,
    lastSellTransaction,
  }) => {
    const isTradingRangeTimePassed = backtestMode
      ? true
      : isTradingRangeTime(currentCloseTime);

    if (isTradingRangeTimePassed) {
      if (bearSignal.isBearish({ closeValues })) {
        const macdPassed = await macdSignal.isBuySignal({ closeValues });
        const ppoPassed = await ppoSignal.isBuySignal({ closeValues });
        if (ppoPassed && macdPassed) {
          if (previousMaxSignal.isMaxJustBefore({ closeValues })) {
            //console.log(currentCloseTime, currentCloseValue);
            if (
              closeValues[closeValues.length - 1] <
              closeValues[closeValues.length - 2]
            ) {
              return false;
            }
          }
          console.log(" ");
          console.log("********");
          console.log("BUY SIGNAL WITH PPO&MACD");
          console.log(currentCloseTime, currentCloseValue);
          return true;
        }
        return false;
      }

      const isDiffWithLastTransactionEnoughPassed = isDiffWithLastTransactionEnough(
        currentCloseTime,
        lastSellTransaction,
        cryptoCurrency,
        lastBuyTransaction
      );

      const maTrendPassed = await maTrendSignal.isBuySignal({ closeValues });
      const wasBearishJustBefore = bearSignal.isBearish({
        closeValues: closeValues.slice(0, closeValues.length - 1),
      });
      if (cryptoCurrency === "BTC" && maTrendPassed && wasBearishJustBefore) {
        return false;
      }
      if (isDiffWithLastTransactionEnoughPassed && maTrendPassed) {
        console.log(" ");
        console.log("********");
        console.log("BUY SIGNAL WITH MA");
        console.log(currentCloseTime, currentCloseValue);

        const diff = await maTrendSignal.getDifferenceCompareToPrice({
          closeValues,
        });
        if (diff.slice(diff.length - 14).find((d) => d > 15 / 100)) {
          const maSellPassed = await maSellTrendSignal.isBuySignal({
            closeValues,
            count: 1,
          });
          return maSellPassed;
        }
      }
      return isDiffWithLastTransactionEnoughPassed && maTrendPassed;
    }

    return false;
  };

  const isSellingTime = async ({
    closeValues,
    lowValues,
    highValues,
    currentCloseTime,
    currentCloseValue,
    lastBuyTransaction,
  }) => {
    const isTradingRangeTimePassed = backtestMode
      ? true
      : isTradingRangeTime(currentCloseTime);

    // Checking if trading is not losing directly
    const {
      instantLossPassed,
      instantLossPriceLimit,
    } = instantLossSignal.isSellSignal(
      backtestMode ? lowValues[lowValues.length - 1] : currentCloseValue,
      closeValues,
      lastBuyTransaction.price,
      false
    );

    if (instantLossPassed) {
      console.log("InstantLossPassed");
      console.log(currentCloseTime, currentCloseValue, instantLossPriceLimit);
      console.log("********");
      console.log(" ");
      return backtestMode ? instantLossPriceLimit : true;
    }

    /**
     * When market is going doing
     *  */
    if (bearSignal.isBearish({ closeValues })) {
      if (isTradingRangeTimePassed) {
        const macdPassed = await macdSignal.isSellSignal({ closeValues });
        const ppoPassed = await ppoSignal.isSellSignal({ closeValues });
        if (ppoPassed && macdPassed) {
          console.log("ppoPassed && macdPassed");
          console.log(currentCloseTime, currentCloseValue);
          console.log("********");
          console.log(" ");
        }
        return ppoPassed && macdPassed;
      }
    }

    if (
      isTradingRangeTimePassed &&
      continuousBearSignal.isContinuousBearish({
        closeValues,
      }) &&
      closeValues[closeValues.length - 1] <= closeValues[closeValues.length - 2]
    ) {
      console.log("isContinuousBearish and <");
      console.log(currentCloseTime, currentCloseValue);
      console.log("********");
      console.log(" ");
      return true;
    }

    const diff = await maTrendSignal.getDifferenceCompareToPrice({
      closeValues,
    });
    if (diff.slice(diff.length - 14).find((d) => d > 20 / 100)) {
      console.log(currentCloseTime, currentCloseValue, diff[diff.length - 1]);
      const maSellPassed = await maSellTrendSignal.isSellSignal({
        closeValues,
        count: 1,
      });
      return maSellPassed;
    }

    const maTrendPassed = await maTrendSignal.isSellSignal({
      closeValues,
    });

    if (maTrendPassed) {
      console.log("maTrendPassed");
      console.log(currentCloseTime, currentCloseValue);
      console.log("********");
      console.log(" ");
    }

    return isTradingRangeTimePassed && maTrendPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = StrategyTrendBasedMa;
