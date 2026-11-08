import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Missouri individual income tax parameters.
 *
 * @statute Mo. Rev. Stat. § 143.011
 */
export const US_2026_STATE_MO: UsStateParameters = defineState({
	code: "MO",
	name: "Missouri",
	verification: "official",
	type: "progressive",
	single: [
		[1_348, 0.02],
		[2_696, 0.025],
		[4_044, 0.03],
		[5_392, 0.035],
		[6_740, 0.04],
		[8_088, 0.045],
		[9_436, 0.047],
	],
	// Combined returns tax each spouse's half separately, i.e. the single thresholds doubled.
	mfj: [
		[2_696, 0.02],
		[5_392, 0.025],
		[8_088, 0.03],
		[10_784, 0.035],
		[13_480, 0.04],
		[16_176, 0.045],
		[18_872, 0.047],
	],
	std: [16100, 32200],
})
