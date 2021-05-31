const math = require("mathjs");
const getSharpeRatio = (returns, interval) => {
  try {
    let nbTradingDays = 252;
    switch (interval) {
      case "1d":
      default:
        nbTradingDays = 252;
    }
    return (
      (math.mean(returns.map((r) => r.r)) / math.std(returns.map((r) => r.r))) *
      math.sqrt(nbTradingDays)
    );
  } catch (error) {
    return 0;
  }
};
const getSortinoRatio = (returns = []) => {
  try {
    const negativeDrawdown = returns.map((r) => r.r).filter((r) => r < 0);
    return math.mean(returns.map((r) => r.r)) / math.std(negativeDrawdown);
  } catch (error) {
    return 0;
  }
};
const getMaxDrawdown = (returns = []) => {
  let highestPoint = 0;
  let cumulative = 0;
  let maxDrawdown = 0;
  let lastDate = "";
  let start = "";
  let end = "";
  returns.forEach((r) => {
    cumulative += r.r;
    if (r.r <= 0) {
      if (cumulative - highestPoint < maxDrawdown) {
        maxDrawdown = cumulative - highestPoint;
        start = lastDate;
        end = r.date;
      }
    } else {
      if (highestPoint < cumulative) {
        highestPoint = cumulative;

        lastDate = r.date;
      }
    }
  });
  return `${start} -> ${end}, ${Math.round(maxDrawdown * 100)}`;
};
const getMaxTradeDrawdown = (returns = []) => {
  let cumulative = 0;
  let maxDrawdown = 0;
  let maxStart = "";
  let maxEnd = "";
  let start = "";
  let end = "";
  returns.forEach(({ buyTime, sellTime, percentage }) => {
    if (percentage < 0) {
      if (cumulative === 0) {
        start = buyTime;
      }
      cumulative += percentage;
      end = sellTime;
    } else {
      if (cumulative < maxDrawdown) {
        maxStart = start;
        maxEnd = end;
        maxDrawdown = cumulative;
      }
      cumulative = 0;
    }
  });
  return `${maxStart} -> ${maxEnd}, ${Math.round(maxDrawdown)}`;
};
module.exports = {
  getSharpeRatio,
  getSortinoRatio,
  getMaxDrawdown,
  getMaxTradeDrawdown,
};
