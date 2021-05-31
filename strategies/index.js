const linreg_4h_strategy = require("./lin_reg/linreg_4h_strategy");
const linreg_trend_4h_strategy = require("./lin_reg/linreg_trend_4h_strategy");
const linreg_1h_strategy = require("./lin_reg/linreg_1h_strategy");
const super_smoother_1w_strategy = require("./ehlers/super_smoother_1w_strategy");
const super_smoother_1d_strategy = require("./ehlers/super_smoother_1d_strategy");
const renko_strategy = require("./alpha/strategy_renko");
//const arima_strategy = require("./arima/arima_strategy");
const simple_strategy_ma_crossing = require("./mas/simple_strategy_ma_crossing");
const simple_strategy_ma_trending = require("./mas/simple_strategy_ma_trending");
const stdev_1h_strategy = require("./stdev/stdev_1h_strategy");
const stdev_1d_strategy = require("./stdev/stdev_1d_strategy");
const pivot_points_strategy = require("./promising/pivot_points_strategy");
const strategy_stddev = require("./strategy_stddev");
const strategy_sinewave = require("./strategy_sinewave");
const hodl = require("./hodl");
const playground_strategy = require("./playground_strategy");

const alpha = {
  super_smoother_1w_strategy,
  linreg_trend_4h_strategy,
  renko_strategy,
};

//const arima = arima_strategy;

const mas = {
  simple_strategy_ma_crossing,
  simple_strategy_ma_trending,
};

const promising = {
  linreg_1h_strategy,
  linreg_4h_strategy,
  linreg_4h_b_strategy: linreg_trend_4h_strategy,
  pivot_points_strategy,
};

const test = {
  super_smoother_1d_strategy,
  strategy_sinewave,
};

const stdev = {
  stdev_1d_strategy,
  stdev_1h_strategy,
};

const playground = playground_strategy;

module.exports = {
  alpha,
  //arima,
  mas,
  promising,
  test,
  hodl,
  strategy_stddev,
  playground,
  stdev,
};
