import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Oregon individual income tax parameters.
 *
 * @statute Or. Rev. Stat. § 316.037
 */
export const US_2026_STATE_OR: UsStateParameters = defineState({
	code: "OR",
	name: "Oregon",
	verification: "unconfirmed",
	type: "progressive",
	single: [
		[0, 0.0475],
		[4_550, 0.0675],
		[11_400, 0.0875],
		[125_000, 0.099],
	],
	mfj: [
		[0, 0.0475],
		[9_100, 0.0675],
		[22_800, 0.0875],
		[250_000, 0.099],
	],
	hoh: "mfj",
	std: [2910, 5820, 4_420],
	personalCredit: [256, 512],
	dependentCredit: 256,
})
