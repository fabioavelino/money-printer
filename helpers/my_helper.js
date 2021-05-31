const math = require("mathjs");
const { getMin, getMax } = require("./tulind_helper");
const TulindHelper = require("./tulind_helper");
//const polynominal = require("./tensorflow/polynominal");

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

const getStddev = (entries, depth) => {
  let stds = [];
  for (let i = 0; i <= entries.length - depth; i++) {
    const subentries = entries.slice(i, i + depth);
    stds.push(math.std(subentries));
  }
  return stds;
};

const getChanges = (entries) => {
  let changes = [];
  for (let i = 1; i < entries.length; i++) {
    const current = entries[i];
    const previous = entries[i - 1];
    const change = current - previous;
    changes.push(change);
  }
  return changes;
};

//https://www.tradientblog.com/2019/11/lessons-learned-building-an-ml-trading-system-that-turned-5k-into-200k/
const getReturns = (entries) => {
  let returns = [];
  for (let i = 1; i < entries.length; i++) {
    const current = entries[i];
    const previous = entries[i - 1];
    const mp = current / previous - 1;
    returns.push(mp);
  }
  return returns;
};

const getLogReturns = (entries) => {
  let logReturns = [];
  for (let i = 1; i < entries.length; i++) {
    const current = math.log(entries[i]);
    const previous = math.log(entries[i - 1]);
    const lmp = current - previous;
    logReturns.push(lmp);
  }
  return logReturns;
};

const getPriceFromReturns = (baseEntry, predictedMp) => {
  let predictedPrices = [];
  for (let i = 0; i < predictedMp.length; i++) {
    const basePrice =
      predictedPrices.length > 0
        ? predictedPrices[predictedPrices.length - 1]
        : baseEntry;
    const movePercentage = predictedMp[i];
    const predictedPrice = basePrice + basePrice * movePercentage;
    predictedPrices.push(predictedPrice);
  }
  return predictedPrices;
};

const getPriceFromLogReturns = (baseEntry, predictedLmp) => {
  let predictedPrices = [];
  for (let i = 0; i < predictedLmp.length; i++) {
    const basePrice =
      predictedPrices.length > 0
        ? predictedPrices[predictedPrices.length - 1]
        : baseEntry;
    const logMovePercentage = predictedLmp[i];
    const realMovePercentage = math.exp(logMovePercentage) - 1;
    const predictedPrice = basePrice + basePrice * realMovePercentage;
    predictedPrices.push(predictedPrice);
  }
  return predictedPrices;
};

//https://financial-hacker.com/trend-delusion-or-reality/
const getLowPass = (entries, depth) => {
  const alpha = 2 / (1 + depth);
  let lp = [0, 0];
  for (let i = 2; i < entries.length; i++) {
    const firstPart = (alpha - 0.25 * alpha * alpha) * entries[i];
    const secondPart = 0.5 * alpha * alpha * entries[i - 1];
    const thirdPart = (alpha - 0.75 * alpha * alpha) * entries[i - 2];
    const fourthPart = 2 * (1 - alpha) * lp[lp.length - 1];
    const fifthPart = (1 - alpha) * (1 - alpha) * lp[lp.length - 2];
    lp.push(firstPart + secondPart - thirdPart + fourthPart - fifthPart);
  }
  return lp;
};

//https://fr.tradingview.com/script/ZuIZPR4q-Ehlers-Simple-Decycler/
const getHighPass = (entries, depth /* = 125 */) => {
  const pi = math.pi;
  const alphaArg = (2 * pi) / (depth * math.sqrt(2));
  let alphas = [0];
  let hp = [0, 0];
  for (let i = 2; i < entries.length; i++) {
    const alpha =
      math.cos(alphaArg) !== 0
        ? (math.cos(alphaArg) + math.sin(alphaArg) - 1) / math.cos(alphaArg)
        : alphas[alphas.length - 1];
    alphas.push(alpha);
    const currentHp =
      math.pow(1 - alpha / 2, 2) *
        (entries[i] - 2 * entries[i - 1] + entries[i - 2]) +
      2 * (1 - alpha) * hp[hp.length - 1] -
      pow(1 - alpha, 2) * hp[hp.length - 2];
    hp.push(currentHp);
  }
  return hp;
};

const getPivotPoints = async (highs, lows, left = 10, right = 2) => {
  let ppH = [];
  let ppL = [];
  for (let i = left + right; i < highs.length; i++) {
    const subHighs = highs.slice(i - left - right, i);
    const max = TulindHelper.getMax(subHighs, left + right);
    if (max === highs[i - right]) {
      ppH.push(max);
    }
    const subMins = lows.slice(i - left - right, i);
    const min = TulindHelper.getMin(subMins, left + right);
    if (min === lows[i - right]) {
      ppL.push(min);
    }
  }
  return { ppH, ppL };
};

const getMovingPrices = (closes, { percentage = 1 / 100 }) => {
  const priceShifting = percentage;
  let prices = [];
  let previousPrice = closes[0];
  for (let i = 1; i < closes.length; i++) {
    let diff = closes[i] / previousPrice - 1;
    if (diff >= priceShifting) {
      for (
        let startPrice = previousPrice + priceShifting * previousPrice;
        startPrice <= closes[i];
        startPrice += previousPrice * priceShifting
      ) {
        prices.push({
          open: startPrice - previousPrice * priceShifting,
          close: startPrice,
        });

        previousPrice = prices[prices.length - 1].close;
      }
    } else if (diff <= -priceShifting) {
      for (
        let startPrice = previousPrice - previousPrice * priceShifting;
        startPrice >= closes[i];
        startPrice -= previousPrice * priceShifting
      ) {
        prices.push({
          open: startPrice + previousPrice * priceShifting,
          close: startPrice,
        });
        previousPrice = prices[prices.length - 1].close;
      }
    }
  }
  return prices;
};

const getNormalizedIndex = (entries, depth) => {
  let normalizedIndex = [];
  for (let i = depth - 1; i < entries.length; i++) {
    const lookbackEntries = entries.slice(i - depth + 1, i + 1);
    const minLookback = getMin(lookbackEntries, depth);
    const maxLookback = getMax(lookbackEntries, depth);
    normalizedIndex.push(
      ((entries[i] - minLookback) / (maxLookback - minLookback)) * 100
    );
  }
  return normalizedIndex;
};

const getAllNormalizedIndex = (entries, start, end) => {
  let allNormalizedIndex = getNormalizedIndex(entries, start).map((ni) => [ni]);
  for (let i = start + 1; i <= end; i++) {
    const ni = getNormalizedIndex(entries, i);
    let diffSize = allNormalizedIndex.length - ni.length;
    for (let j = 0; j < ni.length; j++) {
      allNormalizedIndex[j + diffSize].push(ni[j]);
    }
  }
  return allNormalizedIndex.map((ani) => math.sum(ani) / ani.length);
};

//https://www.quantstart.com/articles/Basics-of-Statistical-Mean-Reversion-Testing
//https://robotwealth.com/demystifying-the-hurst-exponent-part-1/
// H < 0.5 => Time series is mean reverting
// H = 0.5 => Time series is efficient
// H > 0.5 => Time series is trending
const getHurst = async (prices) => {
  /* if (prices.length < 50) {
    throw "too small price set";
  } */
  const entries = prices.slice(prices.length - 10);
  // Create the range of lag values
  const lags = math.range(1, 5).toArray();

  // Calculate the array of the variances of the lagged differences
  // Here it calculates the variances, but using
  // standard deviation and then make a square root of it
  let tau = [];
  //We will divide the entries in differents chunks with the lags
  lags.forEach((lag) => {
    const variance = math.sqrt(
      math.std(math.subtract(entries.slice(lag), entries.slice(0, -lag)))
    );
    tau.push(variance);
  });
  //const poly = polynominalLinear.fit(math.log(lags), math.log(tau));
  //const { coeffs } = await polynominal.fit(math.log(lags), math.log(tau), 1);
  const result = TulindHelper.getLinearRegressionXY(
    math.log(lags),
    math.log(tau)
  );
  return result.slope;
  //console.log(result.slope / 2);
  /**
   * For a linear function : y = ax + b, what we want to know is the slope in order to get the Hurst exponent
   * We just need to get the "b" weight, that define the slope here.
   */
  const b = coeffs[1];

  // The hurst
  //console.log(b / 2);
  return b / 2;
};

const getKahlman = (entries, gain) => {
  const kf = [entries[0]];
  const velo = [0];
  for (let i = 0; i < entries.length; i++) {
    const dk = entries[i] - kf.last;
    const smooth = kf.last + dk * math.sqrt(gain * 2);
    const newVelo = velo.last + gain * dk;
    velo.push(newVelo);
    kf.push(smooth + newVelo);
  }
  return kf;
};

const getHMAKahlman = async (entries, length, gain) => {
  const getHMA3 = async (ent, len) => {
    const p = len / 2;
    let thirdWMA = await TulindHelper.getWMA(ent, p);
    let secondWMA = await TulindHelper.getWMA(ent, p / 2);
    secondWMA = secondWMA.slice(secondWMA.length - thirdWMA.length);
    let firstWMA = await TulindHelper.getWMA(ent, p / 3);
    firstWMA = firstWMA
      .slice(firstWMA.length - thirdWMA.length)
      .map((values) => values * 3);
    const total = math.subtract(math.subtract(firstWMA, secondWMA), thirdWMA);
    return await TulindHelper.getWMA(total, p);
  };
  const a = getKahlman(await TulindHelper.getHMA(entries, length), gain);
  const b = getKahlman(await getHMA3(entries, length), gain);
  const isSell = a.crossover(b) && a.fromEnd(1) < b.fromEnd(1);
  const isBuy = a.crossunder(b) && a.fromEnd(1) > b.fromEnd(1);
  return { isBuy, isSell };
};

const getTSI = async (entries, short, long, signal) => {
  const doubleSmooth = async (entries, short, long) => {
    return TulindHelper.getEMA(await TulindHelper.getEMA(entries, long), short);
  };
  const changes = getChanges(entries);
  const absChanges = math.abs(changes);
  const double_smoothed_changes = await doubleSmooth(changes, short, long);
  const double_smoothed_abs_changes = await doubleSmooth(
    absChanges,
    short,
    long
  );
  const tsi = double_smoothed_changes.map(
    (current, index) => (current / double_smoothed_abs_changes[index]) * 100
  );
  const tsi_signal = await TulindHelper.getEMA(tsi, signal);
  return { tsi, tsi_signal };
};

module.exports = {
  getStddev,
  getReturns,
  getLogReturns,
  getPriceFromReturns,
  getPriceFromLogReturns,
  getLowPass,
  getHighPass,
  getPivotPoints,
  getMovingPrices,
  getNormalizedIndex,
  getAllNormalizedIndex,
  getHurst,
  getHMAKahlman,
  normalizeVector,
  getTSI,
};
