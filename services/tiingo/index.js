const axios = require("axios");
const dayjs = require("dayjs");
const https = require("https");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);

const BASE_URL = "tiingo.com";

const toCurrentTimezone = (timestamp) => {
  const dateUtc = dayjs(timestamp);
  return dateUtc;
};

const getKlines = async (symbol, begin) => {
  return new Promise((resolve) => {
    try {
      const body = JSON.stringify({
        assetTicker: symbol,
        startDate: dayjs(begin).utc().format("YYYY-MM-DDTHH:mm:ss.000") + "Z",
        endDate: dayjs().utc().format("YYYY-MM-DDTHH:mm:ss.000") + "Z",
        resampleFreq: "1day",
      });
      const options = {
        hostname: BASE_URL,
        path: "/charts/pricedata",
        method: "POST",
        headers: {
          Host: "www.tiingo.com",
          Connection: "keep-alive",
          "Content-Length": body.length,
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
          Accept: "application/json, text/plain, */*",
          "X-CSRFTOKEN":
            "dZfqZBbNSsx5AIzstr58ypE2qrqzr4vANpyTlEKptejijYowf5GTrPsw9UdGgcTs",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36",
          "Content-Type": "application/json",
          Origin: "https://www.tiingo.com",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          Referer: `https://www.tiingo.com/${symbol}/overview`,
          "Accept-Encoding": "gzip, deflate, br",
          "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
          Cookie:
            "csrftoken=dZfqZBbNSsx5AIzstr58ypE2qrqzr4vANpyTlEKptejijYowf5GTrPsw9UdGgcTs; sessionid=tfri74rdic3thck0bfbwc83v4wmkhwmg; _ga=GA1.2.1421192553.1612221161; _gid=GA1.2.1234323518.1612221161",
        },
      };
      const req = https.request(options, (res) => {
        res.setEncoding("utf8");
        let data = "";
        res
          .on("data", (d) => {
            data += d;
          })
          .on("end", () => {
            data = JSON.parse(data);
            const prices = JSON.parse(data.data.prices);
            /* const splits = JSON.parse(data.data.splits).sort(
              (a, b) => a.date - b.date
            ); */
            const newPrices = prices.map((kline) => {
              return {
                originalTime: kline.date,
                timestamp: toCurrentTimezone(kline.date).valueOf(),
                closeTime: toCurrentTimezone(kline.date).format(),
                openValue: kline.open,
                closeValue: kline.close,
                high: kline.high,
                low: kline.low,
                volume: kline.volume,
              };
            });
            resolve(newPrices);
          });
      });
      req.write(body);
      req.end();
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = {
  getKlines,
};
