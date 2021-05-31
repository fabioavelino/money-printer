const axios = require("axios");
const dayjs = require("dayjs");
const { apikey } = require("./key");
const csv = require("csvtojson");

const BASE_URL = "https://www.alphavantage.co/query";

// Returns a Promise that resolves after "s" seconds
const wait = (s) => new Promise((res) => setTimeout(res, s * 1000));

const toCurrentTimezone = (timestamp) => {
  const dateUtc = dayjs(`${timestamp.replace(" ", "T")}-05:00`);
  return dateUtc;
};

const getKlines = async (symbol) => {
  let all = [];
  try {
    for (let year = 2; year >= 1; year--) {
      for (let month = 12; month >= 1; month--) {
        let response = await axios.get(
          `${BASE_URL}?function=TIME_SERIES_INTRADAY_EXTENDED&symbol=${symbol}&interval=60min&slice=year${year}month${month}&apikey=${apikey}`
        );
        const startTime = dayjs();
        while (
          typeof response.data !== "string" ||
          response.data.slice(0, 3) !== "tim"
        ) {
          const nowTime = dayjs();
          const diff = Math.abs(startTime.diff(nowTime, "second"));
          if (diff <= 70) {
            await wait(10);
            console.log("new try");
            response = await axios.get(
              `${BASE_URL}?function=TIME_SERIES_INTRADAY_EXTENDED&symbol=${symbol}&interval=60min&slice=year${year}month${month}&apikey=${apikey}`
            );
          } else {
            throw "API LIMIT REACHED";
          }
        }
        const result = await csv({
          noheader: false,
        }).fromString(response.data);

        const formated = result
          .map((kline) => {
            return {
              originalTime: kline.time,
              timestamp: toCurrentTimezone(kline.time).valueOf(),
              closeTime: toCurrentTimezone(kline.time).format(),
              openValue: +kline.open,
              closeValue: +kline.close,
              high: +kline.high,
              low: +kline.low,
              volume: +kline.volume,
            };
          })
          .reverse();
        all = [...all, ...formated];
      }
    }
  } catch (error) {
    console.log(error);
  }
  return all;
};

module.exports = {
  getKlines,
};
