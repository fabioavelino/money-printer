//import { getPreviousPrice, getCurrentPrice } from "../services/binance";
const { getKlines } = require("../index");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

const generateFileName = (id) =>
  path.resolve(__dirname, `./output/data-${id}.json`);

const generateData = async (symbol, interval, from, to) => {
  try {
    let oldData = { id: "" };
    const newId = to
      ? `${symbol}${interval}${from}${to}`
      : `${symbol}${interval}${from}`;
    try {
      oldData = JSON.parse(fs.readFileSync(generateFileName(newId)));
    } catch (_) {}
    if (oldData.id === newId) {
      return oldData.data;
    }
    let newData = await getKlines(
      symbol,
      interval,
      from,
      to ? to : dayjs().format("YYYY-MM-DD"),
      50000
    );
    //newData = [...newData];
    /* let klineFirstTimestamp = newData[0].openTimestamp - 1;
    let newKlines = [...newData];
    console.log(dayjs(from).valueOf());
    while (klineFirstTimestamp >= dayjs(from).valueOf()) {
      newKlines = await getKlines(
        symbol,
        interval,
        from,
        dayjs(klineFirstTimestamp).format("YYYY-MM-DD"),
        50000
      );
      newData = [...newKlines, ...newData];
      klineFirstTimestamp = newKlines[0].openTimestamp - 1;
    } */
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
