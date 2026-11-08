import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Nebraska individual income tax parameters.
 *
 * @statute Neb. Rev. Stat. § 77-2715.03
 */
export const US_2026_STATE_NE: UsStateParameters = defineState({
	code: "NE",
	name: "Nebraska",
	verification: "unconfirmed",
	type: "progressive",
	single: [
		[0, 0.0246],
		[4_130, 0.0351],
		[24_760, 0.0455],
	],
	mfj: [
		[0, 0.0246],
		[8_250, 0.0351],
		[49_530, 0.0455],
	],
	std: [8850, 17700],
	personalCredit: [176, 352],
	dependentCredit: 176,
})
