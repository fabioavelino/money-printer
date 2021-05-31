const dayjs = require("dayjs");
const btcusdtbearish = {
  SYMBOL_TO_TEST: "BTCUSDT",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2017-08-20").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2018-01-01").valueOf(),
  TIMESTAMP_END_TARGET: dayjs("2019-01-01").valueOf(),
};

const ethusdtdayone = {
  SYMBOL_TO_TEST: "ETHUSDT",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2017-08-20").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2017-08-20").valueOf(),
  TIMESTAMP_END_TARGET: undefined,
};

const btcusdtdayone = {
  SYMBOL_TO_TEST: "BTCUSDT",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2017-08-20").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2017-08-20").valueOf(),
  TIMESTAMP_END_TARGET: undefined,
};

const ethbusdlastyear = {
  SYMBOL_TO_TEST: "ETHBUSD",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2019-11-16").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2020-02-01").valueOf(),
  TIMESTAMP_END_TARGET: undefined,
};

const btcbusdlastyear = {
  SYMBOL_TO_TEST: "BTCUSDT",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2018-10-16").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2020-01-01").valueOf(),
  TIMESTAMP_END_TARGET: undefined,
};
const btcbusdarima = {
  SYMBOL_TO_TEST: "BTCUSDT",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2018-10-16").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2020-01-01").valueOf(),
  TIMESTAMP_END_TARGET: dayjs("2021-01-11").valueOf(),
};

const btcbusdbullrun = {
  SYMBOL_TO_TEST: "BTCBUSD",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2020-03-02").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2020-12-16").valueOf(),
  TIMESTAMP_END_TARGET: undefined,
};
const btcusdtnewyear = {
  SYMBOL_TO_TEST: "BTCBUSD",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2020-12-21").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2021-01-01").valueOf(),
  TIMESTAMP_END_TARGET: undefined,
};
const btcbusd20jan = {
  SYMBOL_TO_TEST: "BTCBUSD",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2021-01-20").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2021-01-20").valueOf(),
  TIMESTAMP_END_TARGET: undefined,
};

const btcbusdlastday = {
  SYMBOL_TO_TEST: "BTCBUSD",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2021-02-06").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2021-02-07").valueOf(),
  TIMESTAMP_END_TARGET: undefined,
};
const btcusdvalidation = {
  SYMBOL_TO_TEST: "BTCUSDT",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2017-08-20").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2017-10-05").valueOf(),
  TIMESTAMP_END_TARGET: dayjs("2019-10-30").valueOf(),
};

const btcusdcalibration = {
  SYMBOL_TO_TEST: "BTCUSDT",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2018-09-20").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2019-10-30").valueOf(),
  TIMESTAMP_END_TARGET: undefined,
};

const fiattest = {
  SYMBOL_TO_TEST: "EURUSDT",
  SERVICE: "binance",
  TIMESTAMP_TARGET: dayjs("2020-01-04").valueOf(),
  TIMESTAMP_TARGET_TEST: dayjs("2020-02-19").valueOf(),
  TIMESTAMP_END_TARGET: undefined,
};

const aapl = {
  SYMBOL_TO_TEST: "AAPL",
  SERVICE: "alphavantage",
  TIMESTAMP_TARGET_TEST: dayjs("2020-01-01").valueOf(), //dayjs("2020-01-01").valueOf()
};

const tsla = {
  SYMBOL_TO_TEST: "TSLA",
  SERVICE: "alphavantage",
  TIMESTAMP_TARGET_TEST: dayjs("2020-01-01").valueOf(),
};
const nvda = {
  SYMBOL_TO_TEST: "NVDA",
  SERVICE: "alphavantage",
  TIMESTAMP_TARGET_TEST: dayjs("2020-01-01").valueOf(),
};
const nio = {
  SYMBOL_TO_TEST: "NIO",
  SERVICE: "alphavantage",
  TIMESTAMP_TARGET_TEST: dayjs("2020-01-01").valueOf(),
};
const goog = {
  SYMBOL_TO_TEST: "GOOG",
  SERVICE: "alphavantage",
  TIMESTAMP_TARGET_TEST: dayjs("2020-01-01").valueOf(),
};
const nflx = {
  SYMBOL_TO_TEST: "NFLX",
  SERVICE: "alphavantage",
  TIMESTAMP_TARGET_TEST: dayjs("2020-01-01").valueOf(),
};
const dis = {
  SYMBOL_TO_TEST: "DIS",
  SERVICE: "alphavantage",
  TIMESTAMP_TARGET_TEST: dayjs("2020-01-01").valueOf(),
};
const amd = {
  SYMBOL_TO_TEST: "AMD",
  SERVICE: "alphavantage",
  TIMESTAMP_TARGET_TEST: dayjs("2020-01-01").valueOf(),
};
const qcom = {
  SYMBOL_TO_TEST: "QCOM",
  SERVICE: "alphavantage",
  TIMESTAMP_TARGET_TEST: dayjs("2020-01-01").valueOf(),
};

const tiingo = {
  aapl: {
    SYMBOL_TO_TEST: "aapl",
    SERVICE: "tiingo",
    TIMESTAMP_TARGET_TEST: dayjs("2010-01-01").valueOf(), //dayjs("2020-01-01").valueOf()
  },
  tsla: {
    SYMBOL_TO_TEST: "tsla",
    SERVICE: "tiingo",
    TIMESTAMP_TARGET_TEST: dayjs("2010-06-29").valueOf(),
  },
  nvda: {
    SYMBOL_TO_TEST: "nvda",
    SERVICE: "tiingo",
    TIMESTAMP_TARGET_TEST: dayjs("2010-01-01").valueOf(),
  },
  adbe: {
    SYMBOL_TO_TEST: "adbe",
    SERVICE: "tiingo",
    TIMESTAMP_TARGET_TEST: dayjs("2010-01-01").valueOf(),
  },
  amd: {
    SYMBOL_TO_TEST: "amd",
    SERVICE: "tiingo",
    TIMESTAMP_TARGET_TEST: dayjs("2010-01-01").valueOf(),
  },
  amzn: {
    SYMBOL_TO_TEST: "amzn",
    SERVICE: "tiingo",
    TIMESTAMP_TARGET_TEST: dayjs("2010-01-01").valueOf(),
  },
  baba: {
    SYMBOL_TO_TEST: "baba",
    SERVICE: "tiingo",
    TIMESTAMP_TARGET_TEST: dayjs("2010-01-01").valueOf(),
  },
  dis: {
    SYMBOL_TO_TEST: "dis",
    SERVICE: "tiingo",
    TIMESTAMP_TARGET_TEST: dayjs("2010-01-01").valueOf(),
  },
  fb: {
    SYMBOL_TO_TEST: "fb",
    SERVICE: "tiingo",
    TIMESTAMP_TARGET_TEST: dayjs("2010-01-01").valueOf(),
  },
  goog: {
    SYMBOL_TO_TEST: "goog",
    SERVICE: "tiingo",
    TIMESTAMP_TARGET_TEST: dayjs("2010-01-01").valueOf(),
  },
};

module.exports = {
  btc: {
    dayone: btcusdtdayone,
    bearish: btcusdtbearish,
    lastyear: btcbusdlastyear,
    lastday: btcbusdlastday,
    bullrun2020: btcbusdbullrun,
    calibration: btcusdcalibration,
    validation: btcusdvalidation,
    newyear: btcusdtnewyear,
    jan20: btcbusd20jan,
    arimatest: btcbusdarima,
  },
  eth: {
    dayone: ethusdtdayone,
    lastyear: ethbusdlastyear,
  },
  stock: {
    aapl,
    tsla,
    nio,
    nvda,
    goog,
    nflx,
    qcom,
    dis,
    amd,
    qcom,
    tiingo,
  },
};
