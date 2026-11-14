import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Vermont individual income tax parameters.
 *
 * The 2026 thresholds are about 2.7% above the 2025 ones; head of household keeps its own
 * schedule and separate filers use half the joint thresholds.
 *
 * Math: four progressive bands per filing status (3.35 / 6.6 / 7.6 / 8.75%); the
 * head-of-household deduction (11,475) and exemption (5,300) are 1.5x and 1x the single
 * amounts, which the 2026 IN-114 instructions do not print.
 * Units: major dollars in the definition; `defineState` emits bracket bounds in integer cents.
 * Throws: TaxValidationError when a threshold is not representable as safe integer cents.
 *
 * @statute Vt. Stat. Ann. tit. 32, § 5822
 */
export const US_2026_STATE_VT: UsStateParameters = defineState({
	code: "VT",
	name: "Vermont",
	verification: "partial",
	type: "progressive",
	single: [
		[0, 0.0335],
		[50_750, 0.066],
		[122_850, 0.076],
		[256_300, 0.0875],
	],
	mfj: [
		[0, 0.0335],
		[84_700, 0.066],
		[204_750, 0.076],
		[312_050, 0.0875],
	],
	hoh: [
		[0, 0.0335],
		[68_000, 0.066],
		[175_500, 0.076],
		[284_150, 0.0875],
	],
	mfs: "half-mfj",
	std: [7_650, 15_300, 11_475],
	personalExemption: [5_300, 10_600, 5_300],
	dependentExemption: 5_300,
})
