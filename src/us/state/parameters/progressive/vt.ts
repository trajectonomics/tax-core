import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Vermont individual income tax parameters.
 *
 * @statute Vt. Stat. Ann. tit. 32, § 5822
 */
export const US_2026_STATE_VT: UsStateParameters = defineState({
	code: "VT",
	name: "Vermont",
	verification: "unconfirmed",
	type: "progressive",
	single: [
		[0, 0.0335],
		[49_400, 0.066],
		[119_700, 0.076],
		[249_700, 0.0875],
	],
	mfj: [
		[0, 0.0335],
		[82_500, 0.066],
		[199_450, 0.076],
		[304_000, 0.0875],
	],
	mfs: "half-mfj",
	std: [7650, 15300],
	personalExemption: [5300, 10600],
	dependentExemption: 5_300,
})
