#!/usr/bin/env python3
"""Educational BTC/USDT paper trader using public Binance candles only."""

from __future__ import annotations

import argparse
import json
import math
import urllib.parse
import urllib.request
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Iterable


BINANCE_KLINES_URL = "https://api.binance.com/api/v3/klines"


@dataclass
class Candle:
    open_time: int
    close: float


@dataclass
class Trade:
    side: str
    timestamp: str
    price: float
    quantity: float
    fee: float
    reason: str
    realized_pnl: float | None = None


@dataclass
class Result:
    initial_cash: float
    final_equity: float
    return_pct: float
    trades: list[Trade]
    open_quantity: float
    cash: float


def fetch_candles(symbol: str, interval: str, limit: int) -> list[Candle]:
    """Fetch public candles; no API key or account permission is used."""
    params = urllib.parse.urlencode(
        {"symbol": symbol.upper(), "interval": interval, "limit": limit}
    )
    request = urllib.request.Request(
        f"{BINANCE_KLINES_URL}?{params}",
        headers={"User-Agent": "BitcoinPaperTrader/0.1"},
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        payload = json.loads(response.read().decode("utf-8"))

    if not isinstance(payload, list):
        raise RuntimeError(f"Unexpected Binance response: {payload}")

    candles: list[Candle] = []
    for row in payload:
        candles.append(Candle(open_time=int(row[0]), close=float(row[4])))
    if len(candles) < 30:
        raise RuntimeError("Not enough candles returned to calculate indicators.")
    return candles


def sma(values: list[float], period: int, end: int) -> float:
    window = values[end - period + 1 : end + 1]
    if len(window) != period:
        raise ValueError("Not enough values for SMA")
    return sum(window) / period


def rsi(values: list[float], period: int, end: int) -> float:
    """Simple rolling RSI calculation for a transparent first prototype."""
    if end < period:
        raise ValueError("Not enough values for RSI")
    gains = 0.0
    losses = 0.0
    for index in range(end - period + 1, end + 1):
        change = values[index] - values[index - 1]
        if change > 0:
            gains += change
        elif change < 0:
            losses -= change
    if losses == 0:
        return 100.0 if gains > 0 else 50.0
    relative_strength = (gains / period) / (losses / period)
    return 100.0 - (100.0 / (1.0 + relative_strength))


def backtest(
    candles: Iterable[Candle],
    initial_cash: float = 10_000.0,
    fee_rate: float = 0.001,
    fast_period: int = 9,
    slow_period: int = 21,
    stop_loss_pct: float = 0.03,
) -> Result:
    data = list(candles)
    if initial_cash <= 0 or fee_rate < 0 or not 0 < stop_loss_pct < 1:
        raise ValueError("Invalid cash, fee, or stop-loss configuration.")
    if fast_period < 2 or slow_period <= fast_period:
        raise ValueError("Periods must satisfy 2 <= fast_period < slow_period.")
    if len(data) <= slow_period + 1:
        raise ValueError("Not enough candles for the selected periods.")

    closes = [item.close for item in data]
    cash = initial_cash
    quantity = 0.0
    entry_price = 0.0
    entry_cost = 0.0
    trades: list[Trade] = []

    for i in range(slow_period, len(data)):
        price = closes[i]
        fast_now = sma(closes, fast_period, i)
        slow_now = sma(closes, slow_period, i)
        fast_prev = sma(closes, fast_period, i - 1)
        slow_prev = sma(closes, slow_period, i - 1)
        current_rsi = rsi(closes, 14, i)

        crossed_up = fast_prev <= slow_prev and fast_now > slow_now
        crossed_down = fast_prev >= slow_prev and fast_now < slow_now
        timestamp = datetime.fromtimestamp(
            data[i].open_time / 1000, tz=timezone.utc
        ).isoformat()

        if quantity == 0 and crossed_up and current_rsi < 70:
            spend = cash * 0.95
            fee = spend * fee_rate
            quantity = (spend - fee) / price
            cash -= spend
            entry_price = price
            entry_cost = spend
            trades.append(
                Trade("BUY", timestamp, price, quantity, fee, "SMA bullish crossover; RSI < 70")
            )
        elif quantity > 0:
            stop_price = entry_price * (1.0 - stop_loss_pct)
            if price <= stop_price or crossed_down:
                gross = quantity * price
                fee = gross * fee_rate
                proceeds = gross - fee
                pnl = proceeds - entry_cost
                cash += proceeds
                trades.append(
                    Trade(
                        "SELL",
                        timestamp,
                        price,
                        quantity,
                        fee,
                        "Stop loss" if price <= stop_price else "SMA bearish crossover",
                        pnl,
                    )
                )
                quantity = 0.0
                entry_price = 0.0
                entry_cost = 0.0

    final_equity = cash + quantity * closes[-1]
    return Result(
        initial_cash=initial_cash,
        final_equity=final_equity,
        return_pct=(final_equity / initial_cash - 1.0) * 100.0,
        trades=trades,
        open_quantity=quantity,
        cash=cash,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Binance BTC paper-trading prototype")
    parser.add_argument("--symbol", default="BTCUSDT")
    parser.add_argument("--interval", default="1h")
    parser.add_argument("--limit", type=int, default=500)
    parser.add_argument("--cash", type=float, default=10_000.0)
    parser.add_argument("--fee", type=float, default=0.001)
    args = parser.parse_args()

    if not 50 <= args.limit <= 1000:
        parser.error("--limit must be between 50 and 1000")

    candles = fetch_candles(args.symbol, args.interval, args.limit)
    result = backtest(candles, initial_cash=args.cash, fee_rate=args.fee)

    print(f"Symbol: {args.symbol.upper()} | Interval: {args.interval}")
    print(f"Initial virtual cash: {result.initial_cash:.2f} USDT")
    print(f"Final simulated equity: {result.final_equity:.2f} USDT")
    print(f"Simulated return: {result.return_pct:+.2f}%")
    print(f"Completed trade actions: {len(result.trades)}")
    for trade in result.trades:
        pnl = "" if trade.realized_pnl is None else f" | PnL: {trade.realized_pnl:+.2f} USDT"
        print(
            f"{trade.timestamp} {trade.side} {trade.quantity:.8f} "
            f"at {trade.price:.2f} | fee {trade.fee:.2f} | {trade.reason}{pnl}"
        )
    if result.open_quantity > 0:
        print(f"Open virtual position: {result.open_quantity:.8f} BTC")
    print("\nSimulation only. Past results do not predict future performance.")


if __name__ == "__main__":
    main()
