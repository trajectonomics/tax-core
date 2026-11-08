import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Alabama individual income tax parameters.
 *
 * @statute Ala. Code § 40-18-5
 */
export const US_2026_STATE_AL: UsStateParameters = defineState({
	code: "AL",
	name: "Alabama",
	verification: "unconfirmed",
	type: "progressive",
	single: [
		[0, 0.02],
		[500, 0.04],
		[3_000, 0.05],
	],
	mfj: [
		[0, 0.02],
		[1_000, 0.04],
		[6_000, 0.05],
	],
	std: [3000, 8500, 5_200],
	personalExemption: [1500, 3000, 3000],
	dependentExemption: 1_000,
})
