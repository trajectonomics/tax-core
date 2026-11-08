import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Maryland individual income tax parameters.
 *
 * @statute Md. Code, Tax-Gen. § 10-105
 */
export const US_2026_STATE_MD: UsStateParameters = defineState({
	code: "MD",
	name: "Maryland",
	verification: "official",
	type: "progressive",
	single: [
		[0, 0.02],
		[1_000, 0.03],
		[2_000, 0.04],
		[3_000, 0.0475],
		[100_000, 0.05],
		[125_000, 0.0525],
		[150_000, 0.055],
		[250_000, 0.0575],
		[500_000, 0.0625],
		[1_000_000, 0.065],
	],
	mfj: [
		[0, 0.02],
		[1_000, 0.03],
		[2_000, 0.04],
		[3_000, 0.0475],
		[150_000, 0.05],
		[175_000, 0.0525],
		[225_000, 0.055],
		[300_000, 0.0575],
		[600_000, 0.0625],
		[1_200_000, 0.065],
	],
	hoh: "mfj",
	std: [3400, 6800, 6800],
	personalExemption: [3200, 6400],
	dependentExemption: 3_200,
})
