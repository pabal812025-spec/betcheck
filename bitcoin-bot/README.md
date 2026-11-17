# Bitcoin Paper Trader (prototype)

This folder is an isolated prototype on the `bitcoin-bot-paper` branch. It does not change the MatchIA production branch.

## What it does
- Reads public BTC/USDT hourly candles from Binance's public market-data endpoint.
- Runs a simple SMA(9)/SMA(21) crossover strategy with an RSI filter.
- Simulates trades with a virtual balance and configurable trading fees.
- Prints the trade log and final result.

## What it does NOT do
- It does not place real orders.
- It does not need a Binance API key.
- It cannot withdraw funds because it has no account credentials.
- It does not promise or imply profitability.

## Run locally
Requires Python 3.10+ and internet access.

```bash
python bot.py --symbol BTCUSDT --interval 1h --limit 500 --cash 10000 --fee 0.001
```

Run tests:

```bash
python -m unittest -v
```

## Important
This is an educational paper-trading prototype, not investment advice. A moving-average strategy can lose money. Before any real-money feature is considered, the strategy needs robust historical testing, out-of-sample validation, realistic fees/slippage, risk limits, and explicit user approval. Never store exchange secrets in source code.
