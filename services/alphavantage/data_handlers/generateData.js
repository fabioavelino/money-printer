//import { getPreviousPrice, getCurrentPrice } from "../services/binance";
const { getKlines } = require("../index");
const fs = require("fs");
const path = require("path");
const dayjs = require("dayjs");

const generateFileName = (id) =>
  path.resolve(__dirname, `./output/data-${id}.json`);

const generateData = async (symbol, interval) => {
  try {
    let oldData = { id: "" };
    const newId = `${symbol}${interval}`;
    try {
      oldData = JSON.parse(fs.readFileSync(generateFileName(newId)));
    } catch (_) {}
    if (oldData.id === newId) {
      return oldData.data;
    }
    let newData = [];
    try {
      newData = JSON.parse(fs.readFileSync(generateFileName(`${symbol}60min`)))
        .data;
    } catch (_) {
      newData = await getKlines(symbol, interval);
      fs.writeFileSync(
        generateFileName(`${symbol}60min`),
        JSON.stringify({
          id: `${symbol}60min`,
          data: newData,
        })
      );
    }
    let pairing = 1;
    switch (interval) {
      case "2h":
        pairing = 2;
        break;
      case "4h":
        pairing = 4;
        break;
      case "1d":
        pairing = 16;
        break;
      case "1w":
        pairing = 16 * 5;
        break;
      default:
        pairing = 1;
        break;
    }

    const pairedData = newData.reduce((accu, current, currentIndex) => {
      const newAccu = [...accu];
      if (currentIndex % pairing === 0) {
        newAccu.push(current);
        return newAccu;
      }
      newAccu[newAccu.length - 1] = {
        ...newAccu[newAccu.length - 1],
        closeValue: +current.closeValue,
        high:
          +newAccu[newAccu.length - 1].high > +current.high
            ? +newAccu[newAccu.length - 1].high
            : +current.high,
        low:
          +newAccu[newAccu.length - 1].low < +current.low
            ? +newAccu[newAccu.length - 1].low
            : +current.low,
        volume: +newAccu[newAccu.length - 1].volume + +current.volume,
      };
      return newAccu;
    }, []);

    fs.writeFileSync(
      generateFileName(newId),
      JSON.stringify({
        id: newId,
        data: pairedData,
      })
    );
    return pairedData;
  } catch (error) {
    console.log(error);
    return [];
  }
};

module.exports = generateData;
