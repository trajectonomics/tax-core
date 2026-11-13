import { US_2026_STANDARD_DEDUCTION as FEDERAL_STD } from "../../../parameters/constants"
import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 District of Columbia individual income tax parameters.
 *
 * Math: seven progressive bands from 4% to 10.75%, the same schedule for every filing status.
 * Units: major dollars in the definition; `defineState` emits bracket bounds in integer cents.
 * Throws: TaxValidationError when a threshold is not representable as safe integer cents.
 *
 * @statute D.C. Code § 47-1806.03
 */
export const US_2026_STATE_DC: UsStateParameters = defineState({
	code: "DC",
	name: "District of Columbia",
	verification: "partial",
	type: "progressive",
	single: [
		[0, 0.04],
		[10_000, 0.06],
		[40_000, 0.065],
		[60_000, 0.085],
		[250_000, 0.0925],
		[500_000, 0.0975],
		[1_000_000, 0.1075],
	],
	mfj: [
		[0, 0.04],
		[10_000, 0.06],
		[40_000, 0.065],
		[60_000, 0.085],
		[250_000, 0.0925],
		[500_000, 0.0975],
		[1_000_000, 0.1075],
	],
	std: [FEDERAL_STD.single, FEDERAL_STD.married_filing_jointly, FEDERAL_STD.head_of_household],
})
