require("./helpers/array_prototype");
const DataHelper = require("./helpers/data_helper");
const BacktestHelper = require("./backtest/backtest_helper");
const {
  CompareProfitsHandler,
  AllCompareProfitsHandlers,
} = require("./portfolio/compare_profits_handler");
const getBacktestData = require("./services/getBacktestData");
const strategies = require("./strategies");
const math = require("mathjs");
const market_data_configs = require("./backtest/market_data_configs");

const FORCED_CHOSEN_TIMESERIE = market_data_configs.btc.dayone;
const STRATEGY_TO_TEST = strategies.playground;
const NUM_WFO_CYCLES = 3;
const LOOKBACK_LENGTH = 100;
const GRID_OPTIMISATION_PARAMETERS_RANGES = [
  math.range(15, 51, 5, true).toArray(),
  math.range(5, 20, 1, true).toArray(),
  math.range(5, 20, 1, true).toArray(),
];
const GRID_OPTIMISATION_PARAMETERS_FORCED = [
  [25, 30],
  [13, 15],
  [13, 15],
];
const GRID_OPTIMISATION_PARAMETERS = GRID_OPTIMISATION_PARAMETERS_RANGES;

const backtest = async (CHOSEN_TIMESERIE = FORCED_CHOSEN_TIMESERIE) => {
  const {
    SYMBOL_TO_TEST,
    SERVICE,
    TIMESTAMP_TARGET,
    TIMESTAMP_END_TARGET,
  } = CHOSEN_TIMESERIE;

  const data = await getBacktestData(
    SERVICE,
    SYMBOL_TO_TEST,
    STRATEGY_TO_TEST().RECOMMENDED_INTERVAL,
    TIMESTAMP_TARGET,
    TIMESTAMP_END_TARGET
  );

  BacktestHelper.log(`Backtest for ${SYMBOL_TO_TEST}`);

  const wfoChunks = DataHelper.getWFOSets(data, NUM_WFO_CYCLES);
  const combinaisons = BacktestHelper.createGridOptimisationCombinaisons(
    GRID_OPTIMISATION_PARAMETERS
  );
  BacktestHelper.log(`${combinaisons.length} combinaisons tested`);
  let allTestingProfitsHandlers = AllCompareProfitsHandlers(3);
  for (let wfoIndex = 0; wfoIndex < wfoChunks.length; wfoIndex++) {
    const wfoChunk = wfoChunks[wfoIndex];
    BacktestHelper.log(`WFO Iteration #${wfoIndex}`);
    const trainingProfitsHandler = CompareProfitsHandler();
    // 1st step : Training
    for (
      let combinaisonIndex = 0;
      combinaisonIndex < combinaisons.length;
      combinaisonIndex++
    ) {
      await BacktestHelper.handleSet({
        parameters: combinaisons[combinaisonIndex],
        strategy_to_test: STRATEGY_TO_TEST,
        currentSet: wfoChunk.trainingSet,
        lookback_length: LOOKBACK_LENGTH,
        compareProfitsHandler: trainingProfitsHandler,
      });
    }
    BacktestHelper.log(`Training results: `);
    const bestResults = trainingProfitsHandler.getXBestSharpeProfits(
      allTestingProfitsHandlers.nbOfCompareProfitsHandler
    );
    BacktestHelper.log(bestResults);
    // 2nd step: Testing
    const testingProfitsHandler = CompareProfitsHandler();
    for (
      let bestResultsIndex = 0;
      bestResultsIndex < bestResults.length;
      bestResultsIndex++
    ) {
      await BacktestHelper.handleSet({
        parameters: bestResults[bestResultsIndex].parameters,
        strategy_to_test: STRATEGY_TO_TEST,
        currentSet: wfoChunk.testingSet,
        lookback_length: LOOKBACK_LENGTH,
        compareProfitsHandler: testingProfitsHandler,
      });
    }
    // 3st step : Print results
    BacktestHelper.log(`Testing results: `);
    allTestingProfitsHandlers.handleCompareProfitsHandlerResults(
      testingProfitsHandler.getSharpeProfits()
    );
    BacktestHelper.log(
      testingProfitsHandler.getXBestSharpeProfits(
        allTestingProfitsHandlers.nbOfCompareProfitsHandler
      )
    );
    BacktestHelper.log("=============\n");
  }
  BacktestHelper.log("******************");
  BacktestHelper.log("Combined results: ");
  BacktestHelper.log(allTestingProfitsHandlers.getCombinedResults());
  BacktestHelper.log("*************\n*************\n*************\n\n");

  //portfolio.printAll("1d");
  //return portfolio;
};

backtest(); /* 

const testVariousSymbols = async () => {
  const symbols = [
    market_data_configs.btc.dayone,
    market_data_configs.stock.tiingo.aapl,
    market_data_configs.stock.tiingo.tsla,
    market_data_configs.eth.dayone,
    market_data_configs.stock.tiingo.adbe,
    market_data_configs.stock.tiingo.amd,
    market_data_configs.stock.tiingo.amzn,
    market_data_configs.stock.tiingo.baba,
    market_data_configs.stock.tiingo.dis,
    market_data_configs.stock.tiingo.fb,
    market_data_configs.stock.tiingo.goog,
    market_data_configs.stock.tiingo.nvda,
  ];
  for (let i = 0; i < symbols.length; i++) {
    await backtest(symbols[i]);
  }
};

testVariousSymbols(); */
