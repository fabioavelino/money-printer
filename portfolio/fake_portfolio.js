const {
  getSharpeRatio,
  getSortinoRatio,
  getMaxDrawdown,
  getMaxTradeDrawdown,
} = require("../helpers/portfolio_helper");

const START_VALUE = 19745;
const FEES = 0.2 / 100; //0.1 fees + 0.1 slippage
class FakePortfolio {
  constructor(interval) {
    this.interval = interval;
    this.market_portfolio = 0;
    this.fiat_portfolio = START_VALUE;
    this.buyTransactions = [];
    this.sellTransactions = [];
    this.allTransactions = [];
    this.wins = [];
    this.loss = [];
    this.all = [];
    this.returns = [];
  }

  addTransaction = (transaction) => {
    let { allTransactions, buyTransactions, sellTransactions } = this;
    allTransactions.push(transaction);
    if (transaction.action === "BUY") {
      buyTransactions.push(transaction);
    } else {
      sellTransactions.push(transaction);
    }
  };

  buy = (price, date, relevantAnalyticalData) => {
    let { addTransaction } = this;

    let cryptoBought = this.fiat_portfolio / price;
    this.fiat_portfolio = 0;
    cryptoBought = cryptoBought * (1 - FEES);
    this.market_portfolio = cryptoBought;
    addTransaction({
      action: "BUY",
      price,
      cryptoBought,
      date,
      relevantAnalyticalData,
    });
  };

  sell = (price, date, relevantAnalyticalData) => {
    let { addTransaction, calculateProfits } = this;

    let fiatBought = this.market_portfolio * price;
    this.market_portfolio = 0;
    fiatBought = fiatBought * (1 - FEES);
    this.fiat_portfolio = fiatBought;
    addTransaction({
      action: "SELL",
      price,
      fiatBought,
      date,
      relevantAnalyticalData,
    });
    calculateProfits();
  };

  calculateProfits = () => {
    const { buyTransactions, sellTransactions, wins, loss, all } = this;
    const lastBuy = buyTransactions[buyTransactions.length - 1];
    const lastSell = sellTransactions[sellTransactions.length - 1];
    if (lastBuy.price < lastSell.price) {
      wins.push({
        priceBuy: lastBuy.price,
        priceSell: lastSell.price,
        buyTime: lastBuy.date,
        sellTime: lastSell.date,
        lastBuy,
        lastSell,
      });
      all.push({
        isA: "win",
        priceBuy: lastBuy.price,
        priceSell: lastSell.price,
        buyTime: lastBuy.date,
        sellTime: lastSell.date,
        lastBuy,
        lastSell,
      });
    } else {
      loss.push({
        priceBuy: lastBuy.price,
        priceSell: lastSell.price,
        buyTime: lastBuy.date,
        sellTime: lastSell.date,
        lastBuy,
        lastSell,
      });
      all.push({
        isA: "loss",
        priceBuy: lastBuy.price,
        priceSell: lastSell.price,
        buyTime: lastBuy.date,
        sellTime: lastSell.date,
        lastBuy,
        lastSell,
      });
    }
  };

  closeLastTradeIfNeeded = (closeValue, closeTime) => {
    this.fiat_portfolio === 0 && this.sell(closeValue, closeTime);
  };

  addReturns = (date, r) => {
    this.returns.push({ date, r });
  };

  getProfits = () => {
    const { fiat_portfolio } = this;
    return Math.round((fiat_portfolio / START_VALUE - 1) * 10000) / 100;
  };

  getLastLossXTrades = (nbTrades = 50) => {
    const { loss } = this;
    return loss.slice(loss.length - nbTrades, loss.length);
  };

  printLoss = (nbToPrint = 10) => {
    const { loss } = this;
    const newLoss = loss
      .slice(loss.index - nbToPrint)
      .map(({ priceBuy, priceSell, buyTime, sellTime }) => ({
        priceBuy,
        buyTime,
        priceSell,
        sellTime,
        percentage: (priceSell * 100) / priceBuy - 100,
      }));
    console.log("Loss:");
    console.log(newLoss);
    console.log("total percentage:");
    console.log(
      newLoss.reduce((accu, current) => accu + current.percentage, 0)
    );
  };

  getNewAll = () => {
    const { all } = this;
    return all.map(({ priceBuy, priceSell, buyTime, sellTime }) => ({
      priceBuy,
      buyTime,
      priceSell,
      sellTime,
      percentage: (priceSell * 100) / priceBuy - 100,
    }));
  };

  printAll = (interval) => {
    const newAll = getNewAll();
    console.log("All:");
    console.log(newAll);
    const round = (num) => Math.round(num * 1000) / 1000;
    const winPercentage = newAll.reduce((accu, current) => {
      if (current.percentage > 0) {
        return accu + current.percentage;
      }
      return accu;
    }, 0);
    const lossPercentage = newAll.reduce((accu, current) => {
      if (current.percentage < 0) {
        return accu + current.percentage;
      }
      return accu;
    }, 0);
    console.log("");
    console.log(`ratio: ${this.wins.length} wins, ${this.loss.length} losses`);
    console.log(`win: `, round(winPercentage), "%");
    console.log(`loss:`, round(lossPercentage), "%");
    console.log(
      `mean win per trade: `,
      round(winPercentage / this.wins.length),
      "%"
    );
    console.log(
      `mean loss per trade:`,
      round(lossPercentage / this.loss.length),
      "%"
    );
    console.log("");
    const printNumber = (num) =>
      num
        .toLocaleString("fr-FR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        .split(",")
        .join("'");
    console.log("Before trading: ", printNumber(START_VALUE));
    console.log("Profits:", this.getProfits(), "%");
    console.log("After trading:", printNumber(this.fiat_portfolio));
    console.log("Sharpe ratio: ", this.getSharpeRatio("1d"));
    console.log(
      "Sortino ratio: ",
      getSortinoRatio(this.returns, this.interval)
    );
    console.log("Max drawdown: ", getMaxDrawdown(this.returns), "%");
    console.log("Max trades drawdown: ", getMaxTradeDrawdown(newAll), "%");
  };

  getMoreInfos = () => {
    return {
      sortino: getSortinoRatio(this.returns, this.interval),
      maxDrawdown: getMaxDrawdown(this.returns),
      maxTradesDrawdown: getMaxTradeDrawdown(this.getNewAll()),
      //trades: JSON.stringify(this.getNewAll()),
    };
  };

  getSharpeRatio = () => {
    return getSharpeRatio(this.returns, this.interval);
  };
}

module.exports = FakePortfolio;
