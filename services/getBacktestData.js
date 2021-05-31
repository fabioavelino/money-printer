const getDataFromBinance = require("./binance/data_handlers/generateData");
const getDataFromPolygon = require("./polygon/data_handlers/generateData");
const getDataFromTiingo = require("./tiingo/data_handlers/generateData");
const getDataFromAlphavantage = require("./alphavantage/data_handlers/generateData");

const getBacktestData = async (
  service,
  symbol,
  recommended_interval,
  start,
  end
) => {
  let data = [];
  switch (service) {
    case "binance":
      data = await getDataFromBinance(symbol, recommended_interval, start, end);
      break;
    case "polygon":
      data = await getDataFromPolygon(symbol, recommended_interval, start, end);
      break;
    case "alphavantage":
      data = await getDataFromAlphavantage(symbol, recommended_interval);
      break;
    case "tiingo":
      data = await getDataFromTiingo(symbol, start, "1d");
      break;
    default:
      throw "NOT VALID SOURCE DATA";
  }
  return data;
};

module.exports = getBacktestData;
