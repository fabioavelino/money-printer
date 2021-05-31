# Money Printer: A JS Backtesting Framework for Trading Strategies

## Overview

Money Printer is a custom backtesting framework designed to evaluate the performance of trading strategies. It allows users to test, optimize, and analyze strategies on historical market data across various instruments and time periods.

This project supports:
- Backtesting using historical data.
- Strategy development and optimization.
- Multi-cycle walk-forward optimization (WFO).
- Metrics like Sharpe Ratio, Sortino Ratio, and Maximum Drawdown.

## Features

- **Strategies**: Develop and test strategies using moving averages, machine learning models, and more.
- **Data Sources**: Supports Binance, AlphaVantage, Polygon, Tiingo, and other financial data providers.
- **Metrics**: Includes performance metrics to evaluate and compare strategies.
- **Grid Optimization**: Explore parameter spaces for strategy tuning.
- **Walk-Forward Optimization (WFO)**: Iteratively train and test strategies for optimizing performance.

## Project Structure

```plaintext
├── backtest/               # Backtesting logic and configuration files
├── helpers/                # Utility functions and analytical tools
├── portfolio/              # Portfolio management and performance evaluation
├── services/               # Market data handling
├── signals/                # Trading signals
├── strategies/             # Trading strategies
├── .gitignore              # Files and directories to ignore in version control
└── README.md               # Project documentation (this file)
```

## Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **Dependencies**: Install required Node.js modules using `npm install`.

## Getting Started

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/fabioavelino/money-printer
   cd money-printer
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Data Source**:
   - Update the `backtest/market_data_configs.js` and `services/*` files with your desired configurations and API keys for data providers.

## Example Usage

### Running a Backtest

Edit the `backtest.js` file to specify:
- The strategy you want to test (`STRATEGY_TO_TEST`);
- The financial instrument (`SYMBOL_TO_TEST`).
- The service from where the data are coming (`SERVICE`).
- Other parameters like timestamps start and end and the lookback period.

Then, run:
```bash
node backtest.js
```

### Adding a New Strategy

1. Create a new file in the `strategies/` directory.
2. Implement `isBuyingTime` and `isSellingTime` methods based on your logic.
3. Update the strategy import in `backtest.js`.

## Contributions

Contributions are welcome! Please follow the project's coding standards and ensure tests pass before submitting pull requests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.