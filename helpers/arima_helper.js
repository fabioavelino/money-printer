const ARIMA = require("arima");
const math = require("mathjs");
const {
  getReturns,
  getLogReturns,
  getPriceFromLogReturns,
} = require("./my_helper");
/*const generateDataFromBinance = require("../services/binance/data_handlers/generateData");
const configs = require("../config/backtest");
 
const CHOSEN_CONFIG = configs.btc.arimatest;
const SYMBOL_TO_TEST = CHOSEN_CONFIG.SYMBOL_TO_TEST;
const TIMESTAMP_TARGET = CHOSEN_CONFIG.TIMESTAMP_TARGET;
const TIMESTAMP_TARGET_TEST = CHOSEN_CONFIG.TIMESTAMP_TARGET_TEST;
const TIMESTAMP_END_TARGET = CHOSEN_CONFIG.TIMESTAMP_END_TARGET;
 */
/* const getArima = async (entries) => {
  const autoOptions = { auto: true };
  const recommended = { p: 1, d: 1, q: 1 };
  const arima = new ARIMA(autoOptions);
  const data = await generateDataFromBinance(
    SYMBOL_TO_TEST,
    "4h",
    TIMESTAMP_TARGET,
    TIMESTAMP_END_TARGET
  );
  const ts = data.map((kline) => Number.parseFloat(kline.closeValue));
  const train = ts.slice(0, ts.length - 10);
  arima.train(train); // Or arima.fit(ts)
  const [pred, errors] = arima.predict(10);
  console.log(pred);
  console.log(ts.slice(ts.length - 10));
}; */

const getArimaPredict = (entries, length) => {
  const autoOptions = { auto: true, verbose: true };
  const options = { p: 2, d: 1, q: 1, verbose: false };
  const lmp = getLogReturns(entries);
  if (lmp.length === 0) {
    return [];
  }
  const arima = new ARIMA(options).fit(lmp);
  const [pred, errors] = arima.predict(length);
  const predictedPrices = getPriceFromLogReturns(
    entries[entries.length - 1],
    pred
  );
  return predictedPrices;
};

module.exports = {
  getArimaPredict,
};
