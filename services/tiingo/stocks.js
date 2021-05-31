const generateData = require("./data_handlers/generateData");

const aapl = {
  symbol: "aapl",
  begin: "2000-12-12",
  //begin: "1980-12-12",
};

const tsla = {
  symbol: "tsla",
  begin: "2010-06-29",
};

const amzn = {
  symbol: "amzn",
  begin: "2000-12-12",
  //begin: "1997-05-15",
};

const nio = {
  symbol: "nio",
  begin: "2018-09-12",
};
const amd = {
  symbol: "amd",
  begin: "2000-12-12",
  //begin: "1983-03-21",
};
const goog = {
  symbol: "goog",
  begin: "2014-03-27",
};
const nvda = {
  symbol: "nvda",
  begin: "2000-12-12",
  //begin: "1999-01-22",
};
const baba = {
  symbol: "baba",
  begin: "2014-09-19",
};
const fb = {
  symbol: "fb",
  begin: "2012-05-18",
};
const visa = {
  symbol: "v",
  begin: "2008-03-19",
};
const dis = {
  symbol: "dis",
  begin: "2000-12-12",
  //begin: "1980-01-02",
};
const pypl = {
  symbol: "pypl",
  begin: "2015-07-20",
};
const nflx = {
  symbol: "nflx",
  begin: "2002-05-23",
};
const adbe = {
  symbol: "adbe",
  begin: "2000-12-12",
  //begin: "1986-08-14",
};
const nke = {
  symbol: "nke",
  begin: "2000-12-12",
  //begin: "1980-12-02",
};

const all = [
  aapl,
  adbe,
  amd,
  amzn,
  baba,
  dis,
  fb,
  goog,
  nflx,
  nio,
  nke,
  nvda,
  pypl,
  tsla,
  visa,
];

const getAll = async () => {
  for (let i = 0; i < all.length; i++) {
    const sym = all[i];
    await generateData(sym.symbol, sym.begin);
  }
};

getAll();
