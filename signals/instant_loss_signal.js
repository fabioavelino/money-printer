const InstantLossSignal = ({
  instantLossPercentage = -6 / 100,
  instantWinPercentage = 6 / 100,
}) => {
  const findLastTrendingCloseValue = (closeValues = []) => {
    let closeValue = closeValues[closeValues.length - 2];
    if (closeValue < closeValues[closeValues.length - 3]) {
      closeValue = findLastTrendingCloseValue(
        closeValues.slice(0, closeValues.length - 1)
      );
    }
    return closeValue;
  };

  const isTooMuchWin = (currentPrice, values) => {
    let lastPrice = values[values.length - 2];
    //const priceBefore = values[values.length - 2];
    let instantWinPriceLimit = lastPrice + lastPrice * instantWinPercentage;
    /* let difference = 1 - lastPrice / currentPrice; */

    /* if (difference < instantLossPercentage) {
      const previousPrice = closeValues[closeValues.length - 3];
      difference = 1 - previousPrice / currentPrice;
    }
 */
    return currentPrice >= instantWinPriceLimit;
    //return difference <= instantLossPercentage;
  };

  const isSellSignal = (
    currentPrice,
    values,
    lastBuyPrice = Number.MAX_SAFE_INTEGER,
    compareToLast = false
  ) => {
    //const currentRealPrice = closeValues[closeValues.length - 1];
    const openPrice = values[values.length - 2];
    let lastPrice = compareToLast
      ? values[values.length - 2]
      : findLastTrendingCloseValue(values);
    //const priceBefore = values[values.length - 2];
    lastPrice = lastPrice > lastBuyPrice ? lastBuyPrice : lastPrice;
    let instantLossPriceLimit = lastPrice + lastPrice * instantLossPercentage;
    /* let difference = 1 - lastPrice / currentPrice; */

    /* if (difference < instantLossPercentage) {
      const previousPrice = closeValues[closeValues.length - 3];
      difference = 1 - previousPrice / currentPrice;
    }
 */
    if (currentPrice <= instantLossPriceLimit) {
      if (openPrice <= instantLossPriceLimit) {
        return { instantLossPassed: true, instantLossPriceLimit: openPrice };
      }
      /* console.log("INSTANT LOSS SIGNAL");
      console.log(currentPrice, previousPrice, lastPrice);
      console.log(instantLossPriceLimit);
      console.log(currentCloseTime); */
      return { instantLossPassed: true, instantLossPriceLimit };
      //return true;
    }
    return { instantLossPassed: false };
    //return difference <= instantLossPercentage;
  };

  return { isSellSignal, isTooMuchWin };
};

module.exports = InstantLossSignal;
