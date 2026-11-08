import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 North Dakota individual income tax parameters.
 *
 * @statute N.D. Cent. Code § 57-38-30.3
 */
export const US_2026_STATE_ND: UsStateParameters = defineState({
	code: "ND",
	name: "North Dakota",
	verification: "unconfirmed",
	type: "progressive",
	single: [
		[48_475, 0.0195],
		[244_825, 0.025],
	],
	mfj: [
		[80_975, 0.0195],
		[298_075, 0.025],
	],
	mfs: [
		[40_475, 0.0195],
		[149_025, 0.025],
	],
	hoh: [
		[64_950, 0.0195],
		[271_450, 0.025],
	],
	std: [16100, 32200],
})
