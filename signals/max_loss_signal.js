const DEFAULT_MAX_LOSS_PERCENTAGE = -6.3 / 100;
const MaxLossSignal = ({ maxLossPercentage = DEFAULT_MAX_LOSS_PERCENTAGE }) => {
  const isSellSignal = (currentCloseValue, lastBuyTransactionPrice) => {
    const percentage =
      maxLossPercentage < 0 ? maxLossPercentage : DEFAULT_MAX_LOSS_PERCENTAGE;
    const diffPercentage = currentCloseValue / lastBuyTransactionPrice - 1;
    return diffPercentage < percentage;
  };

  return { isSellSignal };
};

module.exports = MaxLossSignal;
