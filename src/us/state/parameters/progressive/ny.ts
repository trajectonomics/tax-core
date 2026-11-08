import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 New York individual income tax parameters.
 *
 * @statute N.Y. Tax Law § 601
 */
export const US_2026_STATE_NY: UsStateParameters = defineState({
	code: "NY",
	name: "New York",
	verification: "partial",
	type: "progressive",
	single: [
		[0, 0.039],
		[8_500, 0.044],
		[11_700, 0.0515],
		[13_900, 0.054],
		[80_650, 0.059],
		[215_400, 0.0685],
		[1_077_550, 0.0965],
		[5_000_000, 0.103],
		[25_000_000, 0.109],
	],
	mfj: [
		[0, 0.039],
		[17_150, 0.044],
		[23_600, 0.0515],
		[27_900, 0.054],
		[161_550, 0.059],
		[323_200, 0.0685],
		[2_155_350, 0.0965],
		[5_000_000, 0.103],
		[25_000_000, 0.109],
	],
	hoh: [
		[0, 0.039],
		[12_800, 0.044],
		[17_650, 0.0515],
		[20_900, 0.054],
		[107_650, 0.059],
		[269_300, 0.0685],
		[1_616_450, 0.0965],
		[5_000_000, 0.103],
		[25_000_000, 0.109],
	],
	std: [8000, 16050, 11200],
	stdMfs: 8000,
	dependentExemption: 1_000,
})
