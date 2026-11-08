import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 New Mexico individual income tax parameters.
 *
 * @statute N.M. Stat. Ann. § 7-2-7
 */
export const US_2026_STATE_NM: UsStateParameters = defineState({
	code: "NM",
	name: "New Mexico",
	verification: "unconfirmed",
	type: "progressive",
	single: [
		[0, 0.015],
		[5_500, 0.032],
		[16_500, 0.043],
		[33_500, 0.047],
		[66_500, 0.049],
		[210_000, 0.059],
	],
	mfj: [
		[0, 0.015],
		[8_000, 0.032],
		[25_000, 0.043],
		[50_000, 0.047],
		[100_000, 0.049],
		[315_000, 0.059],
	],
	mfs: "half-mfj",
	hoh: "mfj",
	std: [16100, 32200],
	dependentExemption: 4_000,
})
