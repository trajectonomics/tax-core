import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Wisconsin individual income tax parameters.
 *
 * @statute Wis. Stat. § 71.06
 */
export const US_2026_STATE_WI: UsStateParameters = defineState({
	code: "WI",
	name: "Wisconsin",
	verification: "unconfirmed",
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
	mfs: "half-mfj",
	std: [13960, 25840, 17_950],
	personalExemption: [700, 1400],
	dependentExemption: 700,
})
