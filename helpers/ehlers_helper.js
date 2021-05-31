const math = require("mathjs");
const {
  abs,
  asin,
  exp,
  pow,
  sqrt,
  sin,
  cos,
  subtract,
  atan,
  add,
  subset,
} = require("mathjs");

const nz = (value) => {
  return typeof value === "number" ? value : 0;
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

//see tradingview's Ehlers Even Better
//http://www.technicalanalysis.org.uk/moving-averages/Ehle.pdf
const getEhlersEvenBetterSineWave = (
  entries,
  [hpLength = 40, ssfLength = 10]
) => {
  let pi = 2 * asin(1);
  let alpha1 = (1 - sin((2 * pi) / hpLength)) / cos((2 * pi) / hpLength);
  let alpha2 = exp((-1.414 * pi) / ssfLength);
  let beta = 2 * alpha2 * cos((1.414 * pi) / ssfLength);
  let c2 = beta;
  let c3 = -alpha2 * alpha2;
  let c1 = 1 - c2 - c3;

  let hp = [0];
  let filt = [0, 0];

  for (let index = 1; index < entries.length; index++) {
    hp[index] =
      0.5 * (1 + alpha1) * (entries[index] - nz(entries[index - 1])) +
      alpha1 * nz(hp[index - 1]);
  }

  for (let index = 2; index < entries.length; index++) {
    filt[index] =
      c1 * ((hp[index] + nz(hp[index - 1])) / 2) +
      c2 * nz(filt[index - 1]) +
      c3 * nz(filt[index - 2]);
  }

  let wave = [];
  let pwr = [];
  for (let filtIndex = filt.length - 1; filtIndex > 0; filtIndex--) {
    wave[filtIndex] =
      (filt[filtIndex] + nz(filt[filtIndex - 1]) + nz(filt[filtIndex - 2])) / 3;
    pwr[filtIndex] =
      (pow(filt[filtIndex], 2) +
        pow(nz(filt[filtIndex - 1]), 2) +
        pow(nz(filt[filtIndex - 2]), 2)) /
      3;
  }

  wave = wave.map((w, indW) => w / sqrt(pwr[indW]));
  let sig = wave.map((w) => (w > 0 ? 1 : w < 0 ? -1 : 0));

  return wave;
};

//Ehlers measuring cycles
//see: https://www.tradingview.com/script/5WqrAJgu-Cosine-IFM-Ehlers/
//https://www.tradingview.com/script/Q7h83i1t-Adaptive-Zero-Lag-EMA-v2/
// http://www.jamesgoulding.com/Research_II/Ehlers/Ehlers%20(Measuring%20Cycles).doc
const getCosineIFM = (entries, range = 50) => {
  const fullAngle = 2 * 3.14159265359; //2xPi to have a full angle
  let instPeriod = [0];
  let period = [0];

  for (let entriesIndex = 57; entriesIndex <= entries.length; entriesIndex++) {
    let s2 = [0];
    let s3 = [0];
    let deltaPhase = [0];
    let value2 = [0];
    let value1 = subtract(
      entries.slice(7, entriesIndex),
      entries.slice(0, entriesIndex - 7)
    );
    for (let i = 1; i < value1.length; i++) {
      s2[i] =
        0.2 * (value1[i - 1] + value1[i]) * (value1[i - 1] + value1[i]) +
        0.8 * nz(s2[i - 1]);
      s3[i] =
        0.2 * (value1[i - 1] - value1[i]) * (value1[i - 1] - value1[i]) +
        0.8 * nz(s3[i - 1]);

      if (s2[i] !== 0) {
        value2[i] = sqrt(s3[i] / s2[i]);
      }
      if (s3[i] !== 0) {
        deltaPhase[i] = 2 * atan(value2[i]);
      }
    }
    instPeriod.push(0);
    let value4 = 0;
    for (let count = 0; count <= range; count++) {
      value4 = value4 + deltaPhase[deltaPhase.length - 1 - count];
      if (value4 > fullAngle && instPeriod[instPeriod.length - 1] === 0) {
        instPeriod[instPeriod.length - 1] = count - 1;
      }
    }

    if (instPeriod[instPeriod.length - 1] === 0) {
      instPeriod[instPeriod.length - 1] = instPeriod[instPeriod.length - 2];
    }
    period.push(
      0.25 * instPeriod[instPeriod.length - 1] +
        0.75 * nz(period[period.length - 1])
    );
  }
  return math.round(period[period.length - 1]);
};

const getSuperSmoother = (entries, depth = undefined) => {
  const depthToUse = depth ? depth : getCosineIFM(entries, 50);
  let f = (1.414 * 3.14159) / depthToUse;
  let a = exp(-f);
  let c2 = 2 * a * cos(f);
  let c3 = -a * a;
  let c1 = 1 - c2 - c3;
  const smooth = [entries[0], entries[1]];
  for (let index = 2; index < entries.length; index++) {
    smooth[index] =
      (c1 * (entries[index] + entries[index - 1])) / 2 +
      c2 * nz(smooth[index - 1]) +
      c3 * nz(smooth[index - 2]);
  }
  return smooth;
};

const getAdaptiveZLEMA = async (entries, [gainLimit = 50, depth]) => {
  const depthToUse = depth ? depth : math.round(getCosineIFM(entries));
  let ema = [0];

  let alpha = 2 / (depthToUse + 1);
  for (let ind = 1; ind < entries.length; ind++) {
    ema[ind] = alpha * entries[ind] + (1 - alpha) * ema[ind - 1];
  }

  let ec = [0];

  let leastError = 1000000;
  for (let ind = 1; ind < entries.length; ind++) {
    leastError = 1000000;
    let error = 0;
    let gain = 0;
    let bestGain = 0;
    for (let i = -gainLimit; i <= gainLimit; i++) {
      gain = i / 10;
      ec[ind] =
        alpha * (ema[ind] + gain * (entries[ind] - nz(ec[ind - 1]))) +
        (1 - alpha) * nz(ec[ind - 1]);
      error = abs(entries[ind] - ec[ind]);
      if (error < leastError) {
        leastError = error;
        bestGain = gain;
      }
    }
    ec[ind] =
      alpha * (ema[ind] + bestGain * (entries[ind] - nz(ec[ind - 1]))) +
      (1 - alpha) * nz(ec[ind - 1]);
  }

  return { ema, ec, leastError };
};

const getInstantaneousTrend = (entries, alpha = 0.08) => {
  let iTrend = [entries[0], entries[1]];
  let trigger = [entries[0], entries[1]];

  for (let index = 2; index < entries.length; index++) {
    iTrend[index] =
      (alpha - (alpha * alpha) / 4) * entries[index] +
      0.5 * alpha * alpha * entries[index - 1] -
      (alpha - 0.75 * alpha * alpha) * entries[index - 2] +
      2 * (1 - alpha) * iTrend[index - 1] -
      (1 - alpha) * (1 - alpha) * iTrend[index - 2];

    if (index < 9) {
      //7+2 car on commence a 2
      iTrend[index] =
        entries[index] + 2 * entries[index - 1] + entries[index - 2] / 4;
    }

    trigger[index] = 2 * iTrend[index] - iTrend[index - 2];
  }
  return { trigger, iTrend };
};

const getLaguerreRSI = (entries, alpha = 0.2) => {
  const gamma = 1 - alpha;
  let laRSI = [];
  let L0 = [0];
  let L1 = [0];
  let L2 = [0];
  let L3 = [0];
  for (let index = 1; index < entries.length; index++) {
    L0[index] = (1 - gamma) * entries[index] + gamma * nz(L0[index - 1]);
    L1[index] =
      -gamma * L0[index] + nz(L0[index - 1]) + gamma * nz(L1[index - 1]);
    L2[index] =
      -gamma * L1[index] + nz(L1[index - 1]) + gamma * nz(L2[index - 1]);
    L3[index] =
      -gamma * L2[index] + nz(L2[index - 1]) + gamma * nz(L3[index - 1]);
    const cu =
      (L0[index] > L1[index] ? L0[index] - L1[index] : 0) +
      (L1[index] > L2[index] ? L1[index] - L2[index] : 0) +
      (L2[index] > L3[index] ? L2[index] - L3[index] : 0);
    const cd =
      (L0[index] < L1[index] ? L1[index] - L0[index] : 0) +
      (L1[index] < L2[index] ? L2[index] - L1[index] : 0) +
      (L2[index] < L3[index] ? L3[index] - L2[index] : 0);
    const temp = cu + cd == 0 ? -1 : cu + cd;
    laRSI.push((temp == -1 ? 0 : cu / temp) * 100);
  }
  return laRSI;
};

//https://fr.tradingview.com/script/ZuIZPR4q-Ehlers-Simple-Decycler/
const getSimpleDecycler = (entries, depth) => {
  const highPass = getHighPass(entries, depth);
  const diff = entries.length - highPass.length;
  return highPass.map((hp, index) => entries[index + diff] - hp);
};

module.exports = {
  getEhlersEvenBetterSineWave,
  getCosineIFM,
  getSuperSmoother,
  getAdaptiveZLEMA,
  getInstantaneousTrend,
  getLaguerreRSI,
  getSimpleDecycler,
};
