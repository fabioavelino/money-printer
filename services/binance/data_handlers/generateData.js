//import { getPreviousPrice, getCurrentPrice } from "../services/binance";
const { getKlinesFromPastHour } = require("../");
const fs = require("fs");
const path = require("path");

const generateFileName = (id) =>
  path.resolve(__dirname, `./output/data-${id}.json`);

const generateData = async (symbol, interval, start, end = undefined) => {
  try {
    let oldData = { id: "" };
    const newId = end
      ? `${symbol}${interval}${start}${end}`
      : `${symbol}${interval}${start}`;
    try {
      oldData = JSON.parse(fs.readFileSync(generateFileName(newId)));
    } catch (_) {}
    if (oldData.id === newId) {
      return oldData.data;
    }
    let klinesFromPast24Hour = await getKlinesFromPastHour(
      symbol,
      interval,
      end,
      1000
    );
    klinesFromPast24Hour.pop();
    //writeToFile(klinesFromPast24Hour);
    let newData = [...klinesFromPast24Hour];
    let klineFirstTimestamp = klinesFromPast24Hour[0].openTimestamp - 1;
    let newKlines = [...klinesFromPast24Hour];
    while (klineFirstTimestamp >= start) {
      newKlines = await getKlinesFromPastHour(
        symbol,
        interval,
        klineFirstTimestamp,
        1000
      );
      newData = [...newKlines, ...newData];
      klineFirstTimestamp = newKlines[0].openTimestamp - 1;
    }
    fs.writeFileSync(
      generateFileName(newId),
      JSON.stringify({
        id: newId,
        data: newData,
      })
    );
    return newData;
  } catch (error) {
    console.log(error);
    return [];
  }
};

module.exports = generateData;
