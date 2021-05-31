const axios = require("axios");
const { apiKey } = require("./key");
const {
  generateSignature,
  getRecvWindowAndTimestamp,
  toCurrentTimezone,
} = require("./helper");

const BASE_URL = "https://api.binance.com";

const getBalances = async () => {
  try {
    const query = getRecvWindowAndTimestamp();
    const signature = generateSignature(query);
    const {
      data: { balances },
    } = await axios.get(
      `${BASE_URL}/api/v3/account?${query}&signature=${signature}`,
      {
        headers: { "X-MBX-APIKEY": apiKey },
      }
    );
    const filteredBalances = balances
      .filter(
        (balance) =>
          Number.parseFloat(balance.free) > 0 ||
          Number.parseFloat(balance.locked) > 0
      )
      .reduce(
        (accu, current) => ({
          ...accu,
          [current.asset]:
            Number.parseFloat(current.free) + Number.parseFloat(current.locked),
        }),
        {
          BTC: 0,
          USDT: 0,
          ETH: 0,
          BUSD: 0,
        }
      );
    return filteredBalances;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getPastOrders = async (symbol = "BTCUSDT") => {
  try {
    let query = `symbol=${symbol}&${getRecvWindowAndTimestamp()}`;
    let signature = generateSignature(query);
    const { data: tradesWithPrice } = await axios.get(
      `${BASE_URL}/api/v3/myTrades?${query}&signature=${signature}`,
      {
        headers: { "X-MBX-APIKEY": apiKey },
      }
    );
    query = `symbol=${symbol}&${getRecvWindowAndTimestamp()}`;
    signature = generateSignature(query);
    const { data: orders } = await axios.get(
      `${BASE_URL}/api/v3/allOrders?${query}&signature=${signature}`,
      {
        headers: { "X-MBX-APIKEY": apiKey },
      }
    );
    const filteredOrders = orders
      .filter((order) => order.status !== "CANCELED")
      .map((remainingOrder) => {
        const findTrade = tradesWithPrice.find(
          (trade) => trade.orderId === remainingOrder.orderId
        );
        const { price, commission, qty, quoteQty } = findTrade;
        return {
          ...remainingOrder,
          price: Number.parseFloat(price),
          date: remainingOrder.time,
          commission,
          qty,
          quoteQty,
        };
      })
      .reverse();
    const lastBuy = filteredOrders.find((order) => order.side === "BUY");
    const lastSell = filteredOrders.find((order) => order.side === "SELL");
    return { lastBuy, lastSell };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const cancelOpenOrders = async (symbol) => {
  try {
    const query = `symbol=${symbol}&${getRecvWindowAndTimestamp()}`;
    const signature = generateSignature(query);
    const response = await axios.delete(
      `${BASE_URL}/api/v3/openOrders?${query}&signature=${signature}`,
      {
        headers: { "X-MBX-APIKEY": apiKey },
      }
    );
    console.log(response.data);
  } catch (error) {
    console.log("cancel open orders fails, no open orders surely");
    //throw error;
  }
};

const createNewMarketOrder = async (
  symbol = "BTCUSDT",
  side,
  { quantity, quoteOrderQty }
) => {
  try {
    let queryPartForQuantity = quantity
      ? `quantity=${quantity}`
      : `quoteOrderQty=${quoteOrderQty}`;
    const query = `symbol=${symbol}&side=${side}&type=MARKET&${queryPartForQuantity}&${getRecvWindowAndTimestamp()}`;
    const signature = generateSignature(query);
    const response = await axios.post(
      `${BASE_URL}/api/v3/order?${query}&signature=${signature}`,
      undefined,
      {
        headers: { "X-MBX-APIKEY": apiKey },
      }
    );
    console.log(response.data);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getKlines = async (
  symbol,
  interval = "1m",
  limit = 12,
  startTime,
  endTime
) => {
  try {
    //let currentPrice;

    const response = await axios.get(`${BASE_URL}/api/v3/klines`, {
      params: {
        symbol,
        interval,
        startTime,
        endTime,
        limit,
      },
    });

    currentPrice = parseFloat(response.data[response.data.length - 1][4]);

    const formated = response.data.map((kline) => {
      //const closeValueFloat = parseFloat(kline[4]);
      return {
        openTimestamp: kline[0],
        openTime: toCurrentTimezone(kline[0]).format(),
        closeTime: toCurrentTimezone(kline[6]).format(),
        openValue: kline[1],
        closeValue: kline[4],
        high: kline[2],
        low: kline[3],
        volume: kline[5],
        quoteVolume: kline[7],
        numberOfTrades: kline[8],
        takerBuyBaseVolume: kline[9],
        takerBuyQuoteVolume: kline[10],
        //diffNowComparedToThisCloseValue:
        //Math.round(((currentPrice * 100) / closeValueFloat - 100) * 100) /
        //100,
      };
    });

    return formated;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getKlinesFromPastHour = (
  symbol,
  interval = "1m",
  endTime,
  limit = 60 * 10
) => {
  return getKlines(symbol, interval, limit, undefined, endTime);
};

const getCurrentPrice = async (symbol) => {
  try {
    const {
      data: { price },
    } = await axios.get(`${BASE_URL}/api/v3/avgPrice`, {
      params: {
        symbol,
      },
    });
    return +price;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  getBalances,
  cancelOpenOrders,
  getKlinesFromPastHour,
  getKlines,
  getPastOrders,
  createNewMarketOrder,
  getCurrentPrice,
};
