import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Kansas individual income tax parameters.
 *
 * @statute Kan. Stat. Ann. § 79-32,110
 */
export const US_2026_STATE_KS: UsStateParameters = defineState({
	code: "KS",
	name: "Kansas",
	verification: "unconfirmed",
	type: "progressive",
	single: [
		[0, 0.052],
		[23_000, 0.0558],
	],
	mfj: [
		[0, 0.052],
		[46_000, 0.0558],
	],
	std: [3605, 8240, 6180],
	personalExemption: [9160, 18320],
	dependentExemption: 2_320,
})
