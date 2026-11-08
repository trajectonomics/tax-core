import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 California individual income tax parameters.
 *
 * FTB 2026 rate schedules for all three filing statuses. The 2026 standard deduction
 * ($5,900/$11,800) and exemption credits ($158/$316, $491 per dependent) are still the
 * 2025 values x 1.034 because FTB has not published the 2026 index. 1% mental health services
 * surtax above $1,000,000.
 *
 * @statute Cal. Rev. & Tax. Code § 17041
 */
export const US_2026_STATE_CA: UsStateParameters = defineState({
	code: "CA",
	name: "California",
	verification: "partial",
	type: "progressive",
	single: [
		[0, 0.01],
		[11_456, 0.02],
		[27_157, 0.04],
		[42_861, 0.06],
		[59_498, 0.08],
		[75_197, 0.093],
		[384_109, 0.103],
		[460_927, 0.113],
		[768_213, 0.123],
	],
	mfj: [
		[0, 0.01],
		[22_912, 0.02],
		[54_314, 0.04],
		[85_722, 0.06],
		[118_996, 0.08],
		[150_394, 0.093],
		[768_218, 0.103],
		[921_854, 0.113],
		[1_536_426, 0.123],
	],
	hoh: [
		[0, 0.01],
		[22_927, 0.02],
		[54_316, 0.04],
		[70_018, 0.06],
		[86_654, 0.08],
		[102_356, 0.093],
		[522_385, 0.103],
		[626_864, 0.113],
		[1_044_771, 0.123],
	],
	std: [5900, 11800, 11800],
	personalCredit: [158, 316],
	dependentCredit: 491,
	surtax: { threshold: 1_000_000, rate: 0.01 },
})
