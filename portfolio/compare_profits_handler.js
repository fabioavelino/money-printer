const CompareProfitsHandler = () => {
  let sharpeProfits = [];
  let maxProfits = [];
  const addProfits = (parameters, sharpe, profit, moreInfos) => {
    const sharpeIndex = sharpeProfits.findIndex(
      (p) => p.parameters[0] === parameters[0]
    );
    if (sharpeIndex !== -1) {
      if (sharpeProfits[sharpeIndex].sharpe < sharpe) {
        sharpeProfits[sharpeIndex] = {
          parameters,
          sharpe,
          profit,
          moreInfos,
        };
      }
    } else {
      sharpeProfits.push({
        parameters,
        sharpe,
        profit,
        moreInfos,
      });
    }
    const maxIndex = maxProfits.findIndex(
      (p) => p.parameters[0] === parameters[0]
    );
    if (maxIndex !== -1) {
      if (maxProfits[maxIndex].profit < profit) {
        maxProfits[maxIndex] = {
          parameters,
          sharpe,
          profit,
          moreInfos,
        };
      }
    } else {
      maxProfits.push({
        parameters,
        sharpe,
        profit,
        moreInfos,
      });
    }
  };

  const getXBestSharpeProfits = (nbOfBest = 3) => {
    return sharpeProfits
      .sort((a, b) => a.sharpe - b.sharpe)
      .slice(sharpeProfits.length - nbOfBest);
  };

  const getXBestMaxProfits = (nbOfBest = 3) => {
    return maxProfits
      .sort((a, b) => a.profit - b.profit)
      .slice(maxProfits.length - nbOfBest);
  };

  const getSharpeProfits = () => {
    return sharpeProfits;
  };

  return {
    addProfits,
    getXBestSharpeProfits,
    getXBestMaxProfits,
    getSharpeProfits,
  };
};

const AllCompareProfitsHandlers = (nbOfCompareProfitsHandler = 3) => {
  const allCompareProfitsHandlers = (() => {
    let arr = [];
    for (let i = 0; i < nbOfCompareProfitsHandler; i++) {
      arr.push([]);
    }
    return arr;
  })();

  const handleCompareProfitsHandlerResults = (results) => {
    for (let i = 0; i < results.length; i++) {
      allCompareProfitsHandlers[i].push(results[i]);
    }
  };

  const getCombinedResults = () => {
    return allCompareProfitsHandlers.map((results, index) => {
      let countValidSharpe = 0;
      let result = results.reduce(
        (accu, currentResult) => {
          if (currentResult.sharpe !== 0) {
            countValidSharpe++;
          }
          return {
            rank: allCompareProfitsHandlers.length - index,
            sharpe:
              accu.sharpe +
              (isFinite(currentResult.sharpe) ? currentResult.sharpe : 20),
            profit: accu.profit + currentResult.profit,
          };
        },
        {
          rank: allCompareProfitsHandlers.length - index,
          sharpe: 0,
          profit: 0,
        }
      );
      result.sharpe /= countValidSharpe;
      return result;
    });
  };

  return {
    handleCompareProfitsHandlerResults,
    nbOfCompareProfitsHandler,
    getCombinedResults,
  };
};

module.exports = { CompareProfitsHandler, AllCompareProfitsHandlers };
