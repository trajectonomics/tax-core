import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Montana individual income tax parameters.
 *
 * House Bill 337 raised the 2026 bracket thresholds and kept the 4.7% / 5.65% rates; the
 * standard deduction follows the federal amount. Head of household has its own threshold of
 * 71,250, not the single one.
 *
 * @statute Mont. Code Ann. § 15-30-2103
 */
export const US_2026_STATE_MT: UsStateParameters = defineState({
	code: "MT",
	name: "Montana",
	verification: "official",
	type: "progressive",
	single: [
		[0, 0.047],
		[47_500, 0.0565],
	],
	mfj: [
		[0, 0.047],
		[95_000, 0.0565],
	],
	hoh: [
		[0, 0.047],
		[71_250, 0.0565],
	],
	std: [16100, 32200],
})
