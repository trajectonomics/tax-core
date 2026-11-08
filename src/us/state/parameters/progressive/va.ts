import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Virginia individual income tax parameters.
 *
 * @statute Va. Code Ann. § 58.1-320
 */
export const US_2026_STATE_VA: UsStateParameters = defineState({
	code: "VA",
	name: "Virginia",
	verification: "reported",
	type: "progressive",
	single: [
		[0, 0.02],
		[3_000, 0.03],
		[5_000, 0.05],
		[17_000, 0.0575],
	],
	mfj: [
		[0, 0.02],
		[3_000, 0.03],
		[5_000, 0.05],
		[17_000, 0.0575],
	],
	std: [8750, 17500, 8_750],
	personalExemption: [930, 1860],
	dependentExemption: 930,
})
