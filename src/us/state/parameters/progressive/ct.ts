import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Connecticut individual income tax parameters.
 *
 * @statute Conn. Gen. Stat. § 12-700
 */
export const US_2026_STATE_CT: UsStateParameters = defineState({
	code: "CT",
	name: "Connecticut",
	verification: "official",
	type: "progressive",
	single: [
		[0, 0.02],
		[10_000, 0.045],
		[50_000, 0.055],
		[100_000, 0.06],
		[200_000, 0.065],
		[250_000, 0.069],
		[500_000, 0.0699],
	],
	mfj: [
		[0, 0.02],
		[20_000, 0.045],
		[100_000, 0.055],
		[200_000, 0.06],
		[400_000, 0.065],
		[500_000, 0.069],
		[1_000_000, 0.0699],
	],
	hoh: [
		[0, 0.02],
		[16_000, 0.045],
		[80_000, 0.055],
		[160_000, 0.06],
		[320_000, 0.065],
		[400_000, 0.069],
		[800_000, 0.0699],
	],
	std: [0, 0],
	personalExemptionMfs: 12_000,
	personalExemption: [15000, 24000, 19000],
})
