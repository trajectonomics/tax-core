import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Delaware individual income tax parameters.
 *
 * @statute Del. Code Ann. tit. 30, § 1102
 */
export const US_2026_STATE_DE: UsStateParameters = defineState({
	code: "DE",
	name: "Delaware",
	verification: "unconfirmed",
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
