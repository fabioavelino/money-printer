const crypto = require("crypto");
const dayjs = require("dayjs");
const { privateKey } = require("./key");

const recvWindow = "5000"; //recommended by Binance

const getRecvWindowAndTimestamp = () => {
  const timestamp = Date.now();
  const query = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
  return query;
};

const generateSignature = (query) => {
  const hmac = crypto.createHmac("sha256", privateKey);
  hmac.update(query);
  return hmac.digest("hex").toString();
};

const toCurrentTimezone = (timestamp) => {
  const dateUtc = dayjs(timestamp);
  return dateUtc;
};

module.exports = {
  getRecvWindowAndTimestamp,
  generateSignature,
  toCurrentTimezone,
};
