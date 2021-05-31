const HodlStrategy = () => {
  const isBuyingTime = async ({ closeValues /* currentCloseValue */ }) => {
    return true;
  };

  const isSellingTime = async ({
    closeValues,
    currentCloseValue,
    lastBuyTransaction,
  }) => {
    return false;
  };

  return { isBuyingTime, isSellingTime, RECOMMENDED_INTERVAL: "1d" };
};

module.exports = HodlStrategy;
