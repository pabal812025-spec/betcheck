import unittest

from bot import Candle, backtest, rsi, sma


class IndicatorTests(unittest.TestCase):
    def test_sma(self):
        self.assertEqual(sma([1, 2, 3, 4], 3, 3), 3.0)

    def test_rsi_no_losses(self):
        self.assertEqual(rsi([float(i) for i in range(20)], 14, 19), 100.0)

    def test_backtest_rejects_bad_periods(self):
        candles = [Candle(i * 3_600_000, 100.0 + i) for i in range(60)]
        with self.assertRaises(ValueError):
            backtest(candles, fast_period=21, slow_period=9)

    def test_backtest_returns_finite_equity(self):
        candles = [
            Candle(i * 3_600_000, 100.0 + (i % 12) * 2.0 + i * 0.1)
            for i in range(100)
        ]
        result = backtest(candles)
        self.assertGreater(result.final_equity, 0)
        self.assertTrue(result.return_pct > -100)


if __name__ == "__main__":
    unittest.main()
