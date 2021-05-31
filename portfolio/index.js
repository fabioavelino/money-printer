const cryptoCurrenciesForTrading = [
  {
    name: "BTC",
    minValueForTrading: 0.001,
  },
];
const fiatCurrencyForTrading = {
  name: "USDT",
  minValueForTrading: 1,
};

const main = async () => {
  /* try {
    await cancelOpenOrders("BTCUSDT");
  } catch (error) {} */
  const balances = await getBalances();
  const fiatBalance = balances.find(
    (balance) => balance.asset === fiatCurrencyForTrading.name
  );
  const cryptoBalances = cryptoCurrenciesForTrading.map((cryptoCurrency) =>
    balances.find((balance) => balance.asset === cryptoCurrency.name)
  );
  if (fiatBalance) {
    const fiatAvailable = Number.parseFloat(fiatBalance.free);
    if (fiatAvailable >= fiatCurrencyForTrading.minValueForTrading) {
      //
      // DETERMINE IF BUY OR NOT !
      //
      // example for buying:
      /* await createNewMarketOrder("BTCUSDT", "BUY", {
        quoteOrderQty: fiatAvailable,
      }); */
      console.log(fiatBalance);
    }
  }
  cryptoBalances.forEach((cryptoBalance, index) => {
    if (cryptoBalance) {
      const cryptoAvailable = Number.parseFloat(cryptoBalance.free);
      if (
        cryptoAvailable >= cryptoCurrenciesForTrading[index].minValueForTrading
      ) {
        //
        // DETERMINE IF SELL OR NOT !
        //
        // example for buying:
        //createNewMarketOrder("BTCUSDT", "SELL", {quantity: btcToTrade});
        console.log(cryptoBalance);
      }
    }
  });
};
