/**
 * Trash because based on my first (over-overfitted) strategy
 */

const MaxLossSignal = require("../../signals/max_loss_signal");
const MinGainSignal = require("../../signals/min_gain_signal");
const MacdSignal = require("../../signals/macd_signal");
const RSISignal = require("../../signals/rsi_signal");
const MaTrendSignal = require("../../signals/ma_trend_signal");
const InstantLossSignal = require("../../signals/instant_loss_signal");
const BearOrBullSignal = require("../../signals/bear_or_bull_signal");
const PpoSignal = require("../../signals/ppo_signal");
const dayjs = require("dayjs");

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
      : 9;
    if (buyPrice < sellPrice) {
      return diff > 16; // 16
    }
    return diff > -1; // 2 10
  }
  return true;
};

const SimpleStrategy = (backtestMode = true) => {
  const RECOMMENDED_INTERVAL = "2h"; //MA=>1h=>20 EMA=>2h=>50to70 MA=>2h=>60 1h=>HMA=>120 MA=>2h=>80to130
  const maTrendSignal = MaTrendSignal(60, "MA"); //2h=>MA=>60ou70 2h=>EMA=>110
  //const maSellTrendSignal = MaTrendSignal(10, "MA");
  const maSellTrendSignal = MaTrendSignal(24, "EMA"); //23 25
  const bearSignal = BearOrBullSignal(120); //40 60 90 120
  const smallBearSignal = BearOrBullSignal(60);
  const macdSignal = MacdSignal([11, 24, 7]); //11, 24, 7 9,24,7
  const ppoSignal = PpoSignal([6, 16]);
  const instantLossSignal = InstantLossSignal({
    instantLossPercentage: -8 / 100, //-1.2 3.6 3.7 4.2 4.5 4.6
  });

  const isBuyingTime = async ({
    closeValues,
    currentCloseTime,
    currentCloseValue,
    lastSellTransaction,
    lastBuyTransaction,
  }) => {
    const maPassed = await maTrendSignal.isBuySignal({
      closeValues,
      count: 2,
    });
    if (bearSignal.isBearish({ closeValues })) {
      return false;
    }
    /* if (bearSignal.isBearish({ closeValues })) {
      const macdPassed = await macdSignal.isBuySignal({ closeValues });
      const ppoPassed = await ppoSignal.isBuySignal({ closeValues });
      /* const macdPassed = await macdSignal.isBuySignal({
        closeValues: closeValues,
      });*/
    //return macdPassed && ppoPassed;
    //}

    const diff = await maTrendSignal.getDifferenceCompareToPrice({
      closeValues,
    });
    if (diff.slice(diff.length - 7).find((d) => d > 9 / 100)) {
      const maSellPassed = await maSellTrendSignal.isBuySignal({
        closeValues,
      });
      return maSellPassed;
    }
    /* if (diff.slice(diff.length - 7).find((d) => d < -9 / 100)) {
      console.log(currentCloseTime, currentCloseValue, diff[diff.length - 1]);
    } */

    const isDiffWithLastTransactionEnoughPassed = isDiffWithLastTransactionEnough(
      currentCloseTime,
      lastSellTransaction,
      lastBuyTransaction
    );
    /* if (isDiffWithLastTransactionEnoughPassed && maPassed) {
      const count = await maTrendSignal.countBullMAs({ closeValues });
      if (count > 80) {
        const maSellPassed = await maSellTrendSignal.isBuySignal({
          closeValues,
        });
        return maSellPassed;
      }
    } */

    return (
      isDiffWithLastTransactionEnoughPassed && maPassed /*  && macdUpPassed */
    );
  };

  const isSellingTime = async ({
    closeValues,
    lowValues,
    lastBuyTransaction,
    currentCloseValue,
    currentCloseTime,
  }) => {
    const {
      instantLossPassed,
      instantLossPriceLimit,
    } = instantLossSignal.isSellSignal(
      currentCloseValue,
      closeValues,
      lastBuyTransaction.price,
      true
    );

    if (instantLossPassed) {
      return true;
    }
    if (bearSignal.isBearish({ closeValues })) {
      const diffPercentage = currentCloseValue / lastBuyTransaction.price - 1;
      if (diffPercentage < -(1.2 / 100)) {
        //-2
        return true;
      }
      /* const emaPassed = await maSellTrendSignal.isSellSignal({ closeValues });
      return emaPassed; */
      /* if (emaPassed) {
        return true;
      } */
    }

    const diff = await maTrendSignal.getDifferenceCompareToPrice({
      closeValues,
    });
    if (diff.slice(diff.length - 8).find((d) => d > 9 / 100)) {
      //console.log(currentCloseTime, currentCloseValue, diff[diff.length - 1]);
      const maSellPassed = await maSellTrendSignal.isSellSignal({
        closeValues,
        count: 2,
      });
      return maSellPassed;
    }

    /* if (smallBearSignal.isBearish({ closeValues })) {
      const diffPercentage = currentCloseValue / lastBuyTransaction.price - 1;
      if (diffPercentage < -(2 / 100)) {
        return true;
      }
      //const macdPassed = await macdSignal.isSellSignal({ closeValues });
      //const ppoPassed = await ppoSignal.isSellSignal({ closeValues });
      /* const macdPassed = await macdSignal.isBuySignal({
        closeValues: closeValues,
      }); s
      //return macdPassed;
      //return macdPassed && ppoPassed;
    } */

    const maPassed = await maTrendSignal.isSellSignal({
      closeValues,
      count: 2,
    });
    /* if (!maPassed) {
      const count = await maTrendSignal.countBullMAs({ closeValues });
      if (count > 80) {
        const maSellPassed = await maSellTrendSignal.isSellSignal({
          closeValues,
        });
        if (maSellPassed) {
          return true;
        }
      }
    } */
    /* if (maPassed && lastBuyTransaction.price > currentCloseValue) {
      isNegativeDiffNotAcceptable =
        100 - (lastBuyTransaction.price * 100) / currentCloseValue < -1000; //-1 -5 -10 -15 -20
    } */
    return maPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
