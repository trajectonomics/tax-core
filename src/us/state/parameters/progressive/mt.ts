import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Montana individual income tax parameters.
 *
 * @statute Mont. Code Ann. § 15-30-2103
 */
export const US_2026_STATE_MT: UsStateParameters = defineState({
	code: "MT",
	name: "Montana",
	verification: "partial",
	type: "progressive",
	single: [
		[0, 0.047],
		[47_500, 0.0565],
	],
	mfj: [
		[0, 0.047],
		[95_000, 0.0565],
	],
	std: [16100, 32200],
})
