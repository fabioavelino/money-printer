const math = require("mathjs");

const getCloseValues = (data, start, end) => {
  return data
    .slice(start, end + 1)
    .map((kline) => Number.parseFloat(kline.closeValue));
};
const getLowValues = (data, start, end) => {
  return data
    .slice(start, end + 1)
    .map((kline) => Number.parseFloat(kline.low));
};
const getHighValues = (data, start, end) => {
  return data
    .slice(start, end + 1)
    .map((kline) => Number.parseFloat(kline.high));
};
const getHL2Values = (data, start, end) => {
  return data
    .slice(start, end + 1)
    .map(
      (kline) =>
        (Number.parseFloat(kline.low) + Number.parseFloat(kline.high)) / 2
    );
};
const getCH2Values = (data, start, end) => {
  return data
    .slice(start, end + 1)
    .map(
      (kline) =>
        (Number.parseFloat(kline.closeValue) + Number.parseFloat(kline.high)) /
        2
    );
};
const getMeanVolume = (data, start, end) => {
  const volumes = data
    .slice(start, end + 1)
    .map((kline) => Number.parseFloat(kline.volume));
  return math.mean(volumes);
};
const getMaxCloseValue = (data, start, end) => {
  const sliced = data.slice(start, end + 1).map((kline) => kline.closeValue);
  let maxCloseValue = Number.MIN_SAFE_INTEGER;
  let indexMax = 0;
  sliced.forEach((value, index) => {
    if (value >= maxCloseValue) {
      maxCloseValue = value;
      indexMax = index;
    }
  });
  return {
    maxCloseValue,
    indexMax,
  };
};

const getMinMax = (data) => {
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  data.forEach((value) => {
    if (value < min) {
      min = value;
    }
    if (value > max) {
      max = value;
    }
  });
  return { min, max };
};

const getMax = (data) => {
  let max = Number.MIN_SAFE_INTEGER;
  let index = -1;
  data.forEach((value, i) => {
    if (value > max) {
      max = value;
      index = i;
    }
  });
  return { index, max };
};
const getHeikenAshi = (data, start, end) => {
  let newData = [];
  for (let i = start; i <= end; i++) {
    const openValue =
      newData.length > 0
        ? (newData[i - 1 - start].openValue +
            newData[i - 1 - start].closeValue) /
          2
        : +data[i].openValue;
    const closeValue =
      (+data[i].openValue +
        +data[i].high +
        +data[i].low +
        +data[i].closeValue) /
      4;
    const high = [+data[i].openValue, +data[i].closeValue, +data[i].high].sort(
      (a, b) => b - a
    )[0];
    const low = [+data[i].openValue, +data[i].closeValue, +data[i].low].sort(
      (a, b) => a - b
    )[0];
    newData.push({ openValue, closeValue, high, low });
  }
  return newData;
};

const getWFOSets = (entries, rollTime) => {
  /**
   * if x is the in-sample/training set size and y the out-sample/testing set size
   * and we say that training size is 2 times the testing size (x = 2y), we can find out y
   * like this :
   * y = (length - 2y) / rollTime
   * which we can simplify to :
   * y = length / rollTime + 2
   */
  const chunkSize = Math.floor(entries.length / (rollTime + 2));
  //We start by the end in order to get the latest data in priority as we have round down the chunk size
  let chunks = [];
  for (let i = entries.length; i >= chunkSize * 3; i -= chunkSize) {
    const trainingSet = entries.slice(i - chunkSize * 3, i - chunkSize);
    const testingSet = entries.slice(i - chunkSize, i);
    chunks.push({
      trainingSet,
      testingSet,
    });
  }
  return chunks.reverse();
};

const getRelevantAnalyticalData = (
  data,
  portfolio,
  currentIndex,
  lookbackLength
) => {
  const currentVolume = +data[currentIndex].volume;
  const currentCloseValue = +data[currentIndex].closeValue;
  const closeTime = data[currentIndex].closeTime;
  const closeValues = getCloseValues(
    data,
    currentIndex - lookbackLength,
    currentIndex
  );
  const lowValues = getLowValues(
    data,
    currentIndex - lookbackLength,
    currentIndex
  );
  const highValues = getHighValues(
    data,
    currentIndex - lookbackLength,
    currentIndex
  );
  /* const hl2Values = DataHelper.getHL2Values(data, index - START, index);
    const ch2Values = DataHelper.getCH2Values(data, index - START, index);
    const heikenAshi = DataHelper.getHeikenAshi(data, index - START, index); */
  return {
    currentVolume,
    currentCloseValue,
    closeTime,
    currentCloseTime: closeTime,
    closeValues,
    lowValues,
    highValues,
    lastBuyTransaction: portfolio.buyTransactions.last,
    lastSellTransaction: portfolio.sellTransactions.last,
  };
};

module.exports = {
  getCloseValues,
  getLowValues,
  getHighValues,
  getMeanVolume,
  getMaxCloseValue,
  getHL2Values,
  getCH2Values,
  getHeikenAshi,
  getMax,
  getMinMax,
  getWFOSets,
  getRelevantAnalyticalData,
};
