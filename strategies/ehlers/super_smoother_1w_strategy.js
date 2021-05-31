const MaxLossSignal = require("../../signals/max_loss_signal");
const SupersmootherTrendSignal = require("../../signals/supersmoother_trend_signal");
const InstantLossSignal = require("../../signals/instant_loss_signal");

const SimpleStrategy = () => {
  const RECOMMENDED_INTERVAL = "1w";
  const superSmootherTrendSignal = SupersmootherTrendSignal(3); //3 ou 4 ou 5
  const maxLossSignal = MaxLossSignal({ maxLossPercentage: -8 / 100 }); //-2 ou -3 ou -4

  const isBuyingTime = async ({
    closeValues,
    ch2Values,
    highValues,
    hl2Values,
  }) => {
    const trendPassed = superSmootherTrendSignal.isBuySignal({
      closeValues: highValues,
      count: 2,
    });
    return trendPassed;
  };

  const isSellingTime = async ({
    closeValues,
    currentCloseValue,
    lastBuyTransaction,
    highValues,
    ch2Values,
    hl2Values,
  }) => {
    const maxLossPassed = maxLossSignal.isSellSignal(
      currentCloseValue,
      lastBuyTransaction.price
    );
    const trendPassed = superSmootherTrendSignal.isSellSignal({
      closeValues: highValues,
      count: 1,
    });
    return /* maxLossPassed ||  */ trendPassed;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL };
};

module.exports = SimpleStrategy;
