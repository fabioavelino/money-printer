const { getMax } = require("../helpers/data_helper");

const PreviousMaxSignal = (rangeLookup, previousLookup) => {
  const isMaxJustBefore = ({ closeValues, currentCloseValue }) => {
    const length = closeValues.length - 1;
    const previousLookupArray = closeValues.slice(
      length - previousLookup,
      length
    );
    const maxPreviousLookup = getMax(previousLookupArray);
    const rangeLookupArray = closeValues.slice(length - rangeLookup, length);
    const maxRangeLookup = getMax(rangeLookupArray);
    return maxRangeLookup.max === maxPreviousLookup.max;
  };

  return { isMaxJustBefore };
};

module.exports = PreviousMaxSignal;
