import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Oklahoma individual income tax parameters.
 *
 * @statute Okla. Stat. tit. 68, § 2355
 */
export const US_2026_STATE_OK: UsStateParameters = defineState({
	code: "OK",
	name: "Oklahoma",
	verification: "unconfirmed",
	type: "progressive",
	single: [
		[3_750, 0.025],
		[4_900, 0.035],
		[7_200, 0.045],
	],
	mfj: [
		[7_500, 0.025],
		[9_800, 0.035],
		[14_400, 0.045],
	],
	hoh: "mfj",
	std: [6350, 12700, 9350],
	personalExemption: [1000, 2000],
	dependentExemption: 1_000,
})
