const MinGainSignal = ({ minGainPercentage = 0.3 / 100 }) => {
  const isSellSignal = (currentCloseValue, lastBuyTransactionPrice) => {
    const minHighPriceAccepted =
      lastBuyTransactionPrice * (1 + minGainPercentage);
    return currentCloseValue >= minHighPriceAccepted;
  };

  return { isSellSignal };
};

module.exports = MinGainSignal;
