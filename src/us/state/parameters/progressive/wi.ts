import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Wisconsin individual income tax parameters.
 *
 * Separate filers have their own thresholds (10,080 / 34,630 / 221,820), not half of the
 * joint ones, and head of household shares the single schedule but takes the 18,030 deduction.
 *
 * Math: four progressive bands per filing status (3.5 / 4.4 / 5.3 / 7.65%) over the standard
 * deduction and a 700 exemption per person. The document phases the deduction out above
 * 20,119 / 29,039 / 13,779 at 12% (single), 19.778% (joint and separate) and 22.515% then 12%
 * (head of household), and adds 250 at 65+, none of which this table models.
 * Units: major dollars in the definition; `defineState` emits bracket bounds in integer cents.
 * Throws: TaxValidationError when a threshold is not representable as safe integer cents.
 *
 * @statute Wis. Stat. § 71.06
 */
export const US_2026_STATE_WI: UsStateParameters = defineState({
	code: "WI",
	name: "Wisconsin",
	verification: "partial",
	type: "progressive",
	single: [
		[0, 0.035],
		[15_110, 0.044],
		[51_950, 0.053],
		[332_720, 0.0765],
	],
	mfj: [
		[0, 0.035],
		[20_150, 0.044],
		[69_260, 0.053],
		[443_630, 0.0765],
	],
	mfs: [
		[0, 0.035],
		[10_080, 0.044],
		[34_630, 0.053],
		[221_820, 0.0765],
	],
	std: [13_960, 25_840, 18_030],
	stdMfs: 12_280,
	personalExemption: [700, 1400],
	dependentExemption: 700,
})
