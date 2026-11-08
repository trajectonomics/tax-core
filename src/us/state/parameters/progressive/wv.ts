import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 West Virginia individual income tax parameters.
 *
 * Rates 2.11% to 4.58% per W. Va. Code § 11-21-4j (S.B. 392, taxable years from 2026-01-01).
 *
 * @statute W. Va. Code § 11-21-4
 */
export const US_2026_STATE_WV: UsStateParameters = defineState({
	code: "WV",
	name: "West Virginia",
	verification: "official",
	type: "progressive",
	single: [
		[0, 0.0211],
		[10_000, 0.0281],
		[25_000, 0.0316],
		[40_000, 0.0422],
		[60_000, 0.0458],
	],
	mfj: [
		[0, 0.0211],
		[10_000, 0.0281],
		[25_000, 0.0316],
		[40_000, 0.0422],
		[60_000, 0.0458],
	],
	mfs: "half-mfj",
	std: [0, 0],
	personalExemption: [2000, 4000],
	dependentExemption: 2_000,
})
