import type { TaxBracket } from "../core/brackets"

/**
 * Section 48(1) progressive net-income brackets for Tax Year 2026 (THB major units, rates as ratios).
 *
 * @statute Thailand Revenue Code Section 48(1); Royal Decree No. 650.
 */
export const TH_2026_BRACKETS: readonly TaxBracket[] = [
	{ upTo: 150_000, rate: 0.0 },
	{ upTo: 300_000, rate: 0.05 },
	{ upTo: 500_000, rate: 0.1 },
	{ upTo: 750_000, rate: 0.15 },
	{ upTo: 1_000_000, rate: 0.2 },
	{ upTo: 2_000_000, rate: 0.25 },
	{ upTo: 5_000_000, rate: 0.3 },
	{ upTo: null, rate: 0.35 },
]
