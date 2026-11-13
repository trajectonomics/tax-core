import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Delaware individual income tax parameters.
 *
 * Math: six progressive bands from 2.2% to 6.6% over an untaxed first 2,000, plus a flat 110
 * personal credit per federal exemption.
 * Units: major dollars in the definition; `defineState` emits bracket bounds in integer cents.
 * Throws: TaxValidationError when a threshold is not representable as safe integer cents.
 *
 * @statute Del. Code Ann. tit. 30, § 1102
 */
export const US_2026_STATE_DE: UsStateParameters = defineState({
	code: "DE",
	name: "Delaware",
	verification: "official",
	type: "progressive",
	single: [
		[2_000, 0.022],
		[5_000, 0.039],
		[10_000, 0.048],
		[20_000, 0.052],
		[25_000, 0.0555],
		[60_000, 0.066],
	],
	mfj: [
		[2_000, 0.022],
		[5_000, 0.039],
		[10_000, 0.048],
		[20_000, 0.052],
		[25_000, 0.0555],
		[60_000, 0.066],
	],
	std: [3250, 6500, 3250],
	personalCredit: [110, 220],
	dependentCredit: 110,
})
