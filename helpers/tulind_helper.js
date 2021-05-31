const tulind = require("tulind");
const math = require("mathjs");
const { getCosineIFM } = require("./ehlers_helper");

// Calculate the arithmetic mean of a vector.
//
// Args:
//   vector: The vector represented as an Array of Numbers.
//
// Returns:
//   The arithmetic mean.
function mean(vector) {
  let sum = 0;
  for (const x of vector) {
    sum += x;
  }
  return sum / vector.length;
}

// Calculate the standard deviation of a vector.
//
// Args:
//   vector: The vector represented as an Array of Numbers.
//
// Returns:
//   The standard deviation.
function stddev(vector) {
  let squareSum = 0;
  const vectorMean = mean(vector);
  for (const x of vector) {
    squareSum += (x - vectorMean) * (x - vectorMean);
  }
  return Math.sqrt(squareSum / (vector.length - 1));
}

// Normalize a vector by its mean and standard deviation.
function normalizeVector(vector) {
  const vectorMean = mean(vector);
  const vectorStddev = stddev(vector);
  return {
    normalized: vector.map((x) => (x - vectorMean) / vectorStddev),
    mean: vectorMean,
    stddev: vectorStddev,
  };
}

const getRSIs = (entries, depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.rsi.indicator([entries], [depth], (_, results) => {
      resolve(results[0]);
    });
  });
};

const getStochRSIs = (entries, depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.stochrsi.indicator([entries], [depth], (_, results) => {
      const rsi = results[0];
      const kValues = [];
      const dValues = [];
      const rsiReversed = rsi.reverse();
      rsiReversed.forEach((_, index) => {
        const sliced = rsiReversed.slice(index, index + 3);
        kValues.push(math.mean(sliced));
      });
      kValues.forEach((_, index) => {
        const sliced = kValues.slice(index, index + 3);
        dValues.push(math.mean(sliced));
      });

      if (entries[entries.length - 1] === 18368.0) {
        console.log(kValues[0], kValues[kValues.length - 1]);
      }
      resolve({
        kValues: kValues.reverse(),
        dValues: dValues.reverse(),
      });
    });
  });
};
const getStochs = ([high, low, close], [period, k, d]) => {
  return new Promise((resolve, _) => {
    tulind.indicators.stoch.indicator(
      [high, low, close],
      [period, k, d],
      (_, results) => {
        resolve(results[0]);
      }
    );
  });
};

const getADX = (high, low, close, depth, smoothing) => {
  return new Promise((resolve, _) => {
    tulind.indicators.dx.indicator([high, low, close], [depth], (_, [dx]) => {
      getMA(dx, smoothing).then((adx) => resolve(adx));
    });
  });
};

const getDI = (high, low, close, depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.di.indicator(
      [high, low, close],
      [depth],
      (_, results) => {
        resolve({ plus_di: results[0], minus_di: results[1] });
      }
    );
  });
};

const getHMA = (entries, depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.hma.indicator([entries], [depth], (_, results) => {
      resolve(results[0]);
    });
  });
};

const getEMA = (entries, depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.ema.indicator([entries], [depth], (_, results) => {
      resolve(results[0]);
    });
  });
};

const getZLEMA = (entries, depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.zlema.indicator([entries], [depth], (_, results) => {
      resolve(results[0]);
    });
  });
};

const getMA = (entries, depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.sma.indicator([entries], [depth], (_, results) => {
      resolve(results[0]);
    });
  });
};
const getWMA = (entries, depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.wma.indicator([entries], [depth], (_, results) => {
      resolve(results[0]);
    });
  });
};

const getLinReg = (entries, depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.linreg.indicator([entries], [depth], (_, results) => {
      tulind.indicators.stddev.indicator([entries], [depth], (_, results2) => {
        resolve({
          linreg: results[0],
          stddev: results2[0],
        });
      });
    });
  });
};

const getLinearRegressionXY = (xData, yData) => {
  const { normalized: xs } = normalizeVector(xData);
  const { normalized: ys } = normalizeVector(yData);

  const depth = xs.length;
  let sum_x = 0,
    sum_y = 0,
    sum_xy = 0,
    sum_xx = 0,
    sum_yy = 0;
  for (var i = 0; i < xs.length; i++) {
    const currentX = xs[i];
    const currentY = ys[i];
    sum_x += currentX;
    sum_y += currentY;
    sum_xy += currentX * currentY;
    sum_xx += currentX * currentX;
    sum_yy += currentY * currentY;
  }
  const mid = sum_y / depth;
  const slope =
    (depth * sum_xy - sum_x * sum_y) / (depth * sum_xx - sum_x * sum_x);
  const begin_y = (sum_y - slope * sum_x) / depth;
  const r2 = Math.pow(
    (depth * sum_xy - sum_x * sum_y) /
      Math.sqrt(
        (depth * sum_xx - sum_x * sum_x) * (depth * sum_yy - sum_y * sum_y)
      ),
    2
  );
  const end_y = begin_y + slope * (depth - 1);
  const next_y = end_y + slope;
  let stddev = math.std(ys);

  return {
    mid,
    slope,
    begin_y,
    r2,
    end_y,
    next_y,
    stddev,
  };
};

const getLinearRegression = (entries, depth) => {
  const linregs = [];
  for (
    let entriesIndex = 0;
    entriesIndex < entries.length - depth;
    entriesIndex++
  ) {
    let subEntries = entries.slice(entriesIndex, entriesIndex + depth);
    let sum_x = 0,
      sum_y = 0,
      sum_xy = 0,
      sum_xx = 0,
      sum_yy = 0;
    for (var i = 0; i < depth; i++) {
      const currentX = i + 1;
      const currentY = subEntries[i];
      sum_x += currentX;
      sum_y += currentY;
      sum_xy += currentX * currentY;
      sum_xx += currentX * currentX;
      sum_yy += currentY * currentY;
    }
    const mid = sum_y / depth;
    const slope =
      (depth * sum_xy - sum_x * sum_y) / (depth * sum_xx - sum_x * sum_x);
    const begin_y = (sum_y - slope * sum_x) / depth;
    const r2 = Math.pow(
      (depth * sum_xy - sum_x * sum_y) /
        Math.sqrt(
          (depth * sum_xx - sum_x * sum_x) * (depth * sum_yy - sum_y * sum_y)
        ),
      2
    );
    const end_y = begin_y + slope * (depth - 1);
    const next_y = end_y + slope;
    let stddev = 0;
    for (var i = 0; i < depth; i++) {
      stddev =
        stddev + Math.pow(subEntries[i] - (slope * (depth - i) + begin_y), 2);
    }
    stddev = Math.sqrt(stddev / depth);

    linregs.push({
      mid,
      slope,
      begin_y,
      r2,
      end_y,
      next_y,
      stddev,
    });
  }
  return linregs;
};

const getKAMA = (entries, depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.kama.indicator([entries], [depth], (_, results) => {
      resolve(results[0]);
    });
  });
};

const getALMA = (entries, [window = 9, sigma = 6, offset = 0.85]) => {
  let m = offset * (window - 1);
  let s = window / sigma;

  let w = [];
  let wSum = 0;

  for (let i = 1; i < window; i++) {
    w[i] = Math.exp(-((i - m) * (i - m)) / (s * s)); // 2 should be there?
    wSum += w[i];
  }

  for (let i = 1; i < window; i++) {
    w[i] = w[i] / wSum;
  }

  let outalma = [];

  for (let j = 0; j < entries.length; j++) {
    alSum = 0;

    if (j < window) {
      outalma[j] = null;
    } else {
      for (i = 1; i < window; i++) {
        alSum += entries[j - (window - 1 - i)] * w[i];
      }

      outalma[j] = alSum;
    }
  }

  return outalma;
};

/* const getALMA = (entries, [window = 9, sigma = 6, offset = 0.85]) => {
  const ALMAs = [];
  for (let index = window; index < entries.length; index++) {
    const subArray = entries.slice(index - window, index);
    let eq = 0,
      wtd = 0,
      wtdSum = 0,
      wtdCum = 0;
    for (let i = 0; i < window - 1; i++) {
      eq = -1 * (Math.pow(i - offset, 2) / Math.pow(sigma, 2));
      wtd = Math.exp(eq);
      wtdSum = wtdSum + wtd * subArray[i];
      wtdCum = wtdCum + wtd;
    }
    const alma = wtdSum / wtdCum;
    ALMAs.push(alma);
  }
  return ALMAs;
}; */

/* const getALMA = (entries, [window = 9, sigma = 6, offset = 0.85]) => {
  const ALMAs = [];
  const m = offset * (window - 1);
  const s = window / sigma;
  for (let index = window; index < entries.length; index++) {
    let wtdSum = 0;
    let cumWt = 0;
    const subArray = entries.slice(index - window, index);
    for (let k = 0; k < window - 1; k++) {
      const wtd = Math.exp(-((k - m) * (k - m)) / (2 * (s * s)));
      wtdSum += wtd * subArray[subArray.length - 1 - k];
      cumWt += wtd;
    }
    const alma = wtdSum / cumWt;
    ALMAs.push(alma);
  }
  return ALMAs;
}; */

const getDEMA = (entries, depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.dema.indicator([entries], [depth], (_, results) => {
      resolve(results[0]);
    });
  });
};

const getTEMA = (entries, depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.tema.indicator([entries], [depth], (_, results) => {
      resolve(results[0]);
    });
  });
};

const getMACDs = async (entries, [short = 12, long = 26, signal = 9]) => {
  return new Promise((resolve, _) => {
    tulind.indicators.macd.indicator(
      [entries],
      [short, long, signal],
      (_, results) => {
        resolve(results);
      }
    );
  });
};

const getPPOs = async (entries, [short = 12, long = 26]) => {
  return new Promise((resolve, _) => {
    tulind.indicators.ppo.indicator([entries], [short, long], (_, results) => {
      resolve(results[0]);
    });
  });
};

const getBollBands = (entries, [period = 21, stddev = 2]) => {
  return new Promise((resolve, _) => {
    tulind.indicators.bbands.indicator(
      [entries],
      [period, stddev],
      (_, results) => {
        resolve(results);
      }
    );
  });
};

const getMACDZLs = async (entries, [short = 12, long = 26, signal = 9]) => {
  const demaShort = await getDEMA(entries, short);
  const demaLong = await getDEMA(entries, long);
  const newDemaShort = demaShort.slice(
    demaShort.length - demaLong.length,
    demaShort.length
  );
  const diff = math.subtract(newDemaShort, demaLong);
  const demaSignal = await getDEMA(diff, signal);
  const newDiff = diff.slice(diff.length - demaSignal.length, diff.length);
  const macdzls = math.subtract(newDiff, demaSignal);
  return macdzls.map((macdzl, index) => ({
    macdzl,
    long: newDiff[index],
    short: demaSignal[index],
  }));
};

const getMACDZLTEMAs = async (entries, [short = 12, long = 26, signal = 9]) => {
  const demaShort = await getTEMA(entries, short);
  const demaLong = await getTEMA(entries, long);
  const newDemaShort = demaShort.slice(
    demaShort.length - demaLong.length,
    demaShort.length
  );
  const diff = math.subtract(newDemaShort, demaLong);
  const demaSignal = await getTEMA(diff, signal);
  const newDiff = diff.slice(diff.length - demaSignal.length, diff.length);
  const macdzl = math.subtract(newDiff, demaSignal);
  return macdzl;
};

const getIchimoku = (
  highs,
  lows,
  [conversionPeriod, basePeriod, periodReturn, shifting]
) => {
  //Kijun
  const highKijun = getMax(highs, conversionPeriod);
  const lowKijun = getMin(lows, conversionPeriod);
  const kijunValue = (highKijun + lowKijun) / 2;
  //Tenkan
  const highTenkan = getMax(highs, basePeriod);
  const lowTenkan = getMin(lows, basePeriod);
  const tenkanValue = (highTenkan + lowTenkan) / 2;
  //Shifting for senkou and Senou
  const previousHighs = highs.slice(0, highs.length - shifting + 1);
  const previousLows = lows.slice(0, lows.length - shifting + 1);
  //Senkou
  const highKijunSenkou = getMax(previousHighs, conversionPeriod);
  const lowKijunSenkou = getMin(previousLows, conversionPeriod);
  const kijunSenkou = (highKijunSenkou + lowKijunSenkou) / 2;
  const highTenkanSenkou = getMax(previousHighs, basePeriod);
  const lowTenkanSenkou = getMin(previousLows, basePeriod);
  const tenkanSenkou = (highTenkanSenkou + lowTenkanSenkou) / 2;
  const senkouValue = (kijunSenkou + tenkanSenkou) / 2;
  //Senou
  const highSenou = getMax(previousHighs, periodReturn);
  const lowSenou = getMin(previousLows, periodReturn);
  const senouValue = (highSenou + lowSenou) / 2;
  return {
    kijun: kijunValue,
    tenkan: tenkanValue,
    senkou: senkouValue,
    senou: senouValue,
  };
};

const getATR = ([highs, lows, closes], depth) => {
  return new Promise((resolve, _) => {
    tulind.indicators.atr.indicator(
      [highs, lows, closes],
      [depth],
      (_, results) => {
        const atrs = results[results.length - 1];
        const atr = atrs[atrs.length - 1];
        resolve(atr);
      }
    );
  });
};

const getRenko = async (
  [highs, lows, closes],
  { atr, sizePrice, atr_multiplier = 1 }
) => {
  const priceShifting = sizePrice
    ? sizePrice
    : atr
    ? (await getATR([highs, lows, closes], atr)) * atr_multiplier
    : await getATR([highs, lows, closes], getCosineIFM(closes));
  let renko = [];
  let openPrice = closes[0];
  for (let i = 1; i < closes.length; i++) {
    let diff = closes[i] - openPrice;
    if (diff >= priceShifting) {
      for (
        let startPrice = openPrice + priceShifting;
        startPrice < closes[i];
        startPrice += priceShifting
      ) {
        renko.push({
          open: startPrice - priceShifting,
          close: startPrice,
          ranging: "+",
        });

        openPrice = renko[renko.length - 1].close;
      }
    } else if (diff <= -priceShifting) {
      for (
        let startPrice = openPrice - priceShifting;
        startPrice > closes[i];
        startPrice -= priceShifting
      ) {
        renko.push({
          open: startPrice,
          close: startPrice - priceShifting,
          ranging: "-",
        });
        openPrice = renko[renko.length - 1].close;
      }
    }
  }
  return renko;
};

const getMaxCloseValue = (entries = []) => {
  let maxCloseValue = Number.MIN_SAFE_INTEGER;
  let indexMax = 0;
  entries.pop();
  entries.reverse().forEach((value, index) => {
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

const getMinMax = (entries, period = 4) => {
  const entriesSliced = entries.slice(entries.length - period);
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  entriesSliced.forEach((entry) => {
    if (entry < min) {
      min = entry;
    }
    if (entry > max) {
      max = entry;
    }
  });
  return { min, max };
};

const getMin = (entries, period = 4) => {
  const entriesSliced = entries.slice(entries.length - period);
  let min = Number.MAX_SAFE_INTEGER;
  entriesSliced.forEach((entry) => {
    if (entry < min) {
      min = entry;
    }
  });
  return min;
};

const getMax = (entries, period = 4) => {
  const entriesSliced = entries.slice(entries.length - period);
  let max = Number.MIN_SAFE_INTEGER;
  entriesSliced.forEach((entry) => {
    if (entry > max) {
      max = entry;
    }
  });
  return max;
};

const getContractionData = (entries, period = 4) => {
  const { min, max } = getMinMax(entries, period);
  const diffPercentage = 1 - min / max;
  const meanMinMax = (min + max) / 2;
  return { diffPercentage, meanMinMax, min, max, periodSize: period };
};

const newCrawlUntilLastContraction = (
  entries,
  minPeriodSize = 4,
  diffPercentageWanted
) => {
  let indexEntries = entries.length;
  for (indexEntries; indexEntries > minPeriodSize; indexEntries--) {
    const subEntries = entries.slice(0, indexEntries);
    const { diffPercentage: firstDiffPercentage } = getContractionData(
      subEntries,
      minPeriodSize
    );
    if (firstDiffPercentage < diffPercentageWanted) {
      let periodSizeForCrawling = minPeriodSize + 1;
      let diffPercentageForComparison = firstDiffPercentage;
      while (
        diffPercentageForComparison < diffPercentageWanted &&
        periodSizeForCrawling <= indexEntries
      ) {
        const {
          diffPercentage: diffPercentageOfSubCrawling,
        } = getContractionData(subEntries, periodSizeForCrawling);
        diffPercentageForComparison = diffPercentageOfSubCrawling;
        periodSizeForCrawling++;
      }
      return getContractionData(subEntries, periodSizeForCrawling - 1);
    }
  }
  return null;
};

const crawlUntilLastContraction = (
  entries,
  period = 4,
  diffPercentageWanted
) => {
  return newCrawlUntilLastContraction(entries, period, diffPercentageWanted);
  let indexEntries = entries.length;
  for (indexEntries; indexEntries > period; indexEntries--) {
    const subEntries = entries.slice(0, indexEntries);
    const { diffPercentage, meanMinMax, min, max } = getContractionData(
      subEntries,
      period
    );
    if (diffPercentage < diffPercentageWanted) {
      return { diffPercentage, meanMinMax, min, max };
    }
  }
  return null;
};

const crawlUntil4LastContraction = (
  entries,
  minPeriodSize = 4,
  diffPercentageWanted
) => {
  let lastContractions = [];
  let indexEntries = entries.length;
  for (indexEntries; indexEntries > minPeriodSize; indexEntries--) {
    const subEntries = entries.slice(0, indexEntries);
    const { diffPercentage: firstDiffPercentage } = getContractionData(
      subEntries,
      minPeriodSize
    );
    if (firstDiffPercentage < diffPercentageWanted) {
      let periodSizeForCrawling = minPeriodSize + 1;
      let diffPercentageForComparison = firstDiffPercentage;
      while (
        diffPercentageForComparison < diffPercentageWanted &&
        periodSizeForCrawling <= indexEntries
      ) {
        const {
          diffPercentage: diffPercentageOfSubCrawling,
        } = getContractionData(subEntries, periodSizeForCrawling);
        diffPercentageForComparison = diffPercentageOfSubCrawling;
        periodSizeForCrawling++;
      }
      lastContractions.push(
        getContractionData(subEntries, periodSizeForCrawling - 1)
      );
      //Not simplify that ! For documentation purpose.
      //Because we are increment in the while and decrementing in the indexEntries, we don't need to adjust this values
      indexEntries = indexEntries /* + 1 */ - periodSizeForCrawling /* - 1 */;
    }
    if (lastContractions.length >= 4) {
      return lastContractions;
    }
  }
  return lastContractions;
};

module.exports = {
  getADX,
  getDI,
  getRSIs,
  getStochRSIs,
  getStochs,
  getMA,
  getWMA,
  getALMA,
  getEMA,
  getMin,
  getMax,
  getTEMA,
  getKAMA,
  getDEMA,
  getHMA,
  getMACDZLs,
  getMACDs,
  getMACDZLTEMAs,
  getPPOs,
  getLinReg,
  getLinearRegression,
  getLinearRegressionXY,
  getBollBands,
  getMaxCloseValue,
  getIchimoku,
  getRenko,
  getATR,
  getZLEMA,
  getContractionData,
  crawlUntilLastContraction,
  crawlUntil4LastContraction,
};
