import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Rhode Island individual income tax parameters.
 *
 * @statute R.I. Gen. Laws § 44-30-2.6
 */
export const US_2026_STATE_RI: UsStateParameters = defineState({
	code: "RI",
	name: "Rhode Island",
	verification: "unconfirmed",
	type: "progressive",
	single: [
		[0, 0.0375],
		[82_050, 0.0475],
		[186_450, 0.0599],
	],
	mfj: [
		[0, 0.0375],
		[82_050, 0.0475],
		[186_450, 0.0599],
	],
	std: [11200, 22400],
	personalExemption: [5250, 10500],
	dependentExemption: 5_250,
})
