import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 New Jersey individual income tax parameters.
 *
 * @statute N.J. Stat. Ann. § 54A:2-1
 */
export const US_2026_STATE_NJ: UsStateParameters = defineState({
	code: "NJ",
	name: "New Jersey",
	verification: "unconfirmed",
	type: "progressive",
	single: [
		[0, 0.014],
		[20_000, 0.0175],
		[35_000, 0.035],
		[40_000, 0.05525],
		[75_000, 0.0637],
		[500_000, 0.0897],
		[1_000_000, 0.1075],
	],
	mfj: [
		[0, 0.014],
		[20_000, 0.0175],
		[50_000, 0.0245],
		[70_000, 0.035],
		[80_000, 0.05525],
		[150_000, 0.0637],
		[500_000, 0.0897],
		[1_000_000, 0.1075],
	],
	hoh: "mfj",
	std: [0, 0],
	personalExemption: [1000, 2000],
	dependentExemption: 1_500,
})
