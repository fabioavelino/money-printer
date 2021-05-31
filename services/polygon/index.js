const axios = require("axios");
const dayjs = require("dayjs");
const { apikey } = require("./key");

const BASE_URL = "https://api.polygon.io/v2";

const toCurrentTimezone = (timestamp) => {
  const dateUtc = dayjs(timestamp);
  return dateUtc;
};

const getKlines = async (symbol, interval, from, to, _) => {
  const limit = 49999;
  try {
    //let currentPrice;
    let multiplier = 1;
    let timespan = "day";
    switch (interval) {
      case "2h":
        multiplier = 2;
        timespan = "hour";
        break;
      case "4h":
        multiplier = 4;
        timespan = "hour";
      case "1w":
        multiplier = 1;
        timespan = "week";
      case "1d":
      default:
        break;
    }

    const response = await axios.get(
      `${BASE_URL}/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?unadjusted=false&sort=asc&limit=${limit}&apiKey=${apikey}`
    );

    const formated = response.data.results.map((kline) => {
      //const closeValueFloat = parseFloat(kline[4]);
      return {
        openTimestamp: kline.t,
        closeTime: toCurrentTimezone(kline.t).format(),
        openValue: kline.o,
        closeValue: kline.c,
        high: kline.h,
        low: kline.l,
        volume: kline.v,
        quoteVolume: kline.vw,
        numberOfTrades: kline.n,
      };
    });
    return formated;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  getKlines,
};
