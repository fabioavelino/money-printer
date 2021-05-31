const Signal = require("./signal");

class DropSignal extends Signal {
  constructor({
    isEnabled = true,
    acceptableNbPeriodDrop = 20,
    acceptableDiffPercentage = 0.3 / 100,
  }) {
    super();
    this.isEnabled = isEnabled;
    this.acceptableNbPeriodDrop = acceptableNbPeriodDrop;
    this.acceptableDiffPercentage = acceptableDiffPercentage;
  }

  computeValue = (closeValues) => {
    const { acceptableNbPeriodDrop } = this;
    this.closeValues = closeValues;
    this.previousCloseValue = closeValues[closeValues.length - 2];
  };

  haveDropped = () => {
    const {
      closeValues,
      acceptableNbPeriodDrop,
      acceptableDiffPercentage,
    } = this;
    const closeValuesLength = closeValues.length;
    const currentCloseValue = closeValues[closeValuesLength - 1];
    const reversed = closeValues
      .slice(
        closeValuesLength - 1 - acceptableNbPeriodDrop,
        closeValuesLength - 2
      )
      .reverse();
    let haveDropped = false;
    reversed.forEach((closeValue) => {
      const diffInPercentage = closeValue / currentCloseValue - 1;
      if (diffInPercentage >= acceptableDiffPercentage) {
        haveDropped = true;
      }
    });
    return haveDropped;
  };

  isBuySignal = (currentCloseValue) => {
    const {
      isEnabled,
      begin,
      previousCloseValue,
      haveDropped,
      acceptableDiffPercentage,
    } = this;
    let havePassed = true;
    if (isEnabled) {
      havePassed = haveDropped() && currentCloseValue > previousCloseValue;
    }
    return havePassed;
  };

  isSellSignal = () => {
    return true;
  };
}

module.exports = DropSignal;
