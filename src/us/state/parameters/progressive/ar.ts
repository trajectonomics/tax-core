import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Arkansas individual income tax parameters.
 *
 * Brackets from the DFA 2026 withholding formula as revised 2026-05-30 (0% to $5,599, then 2%,
 * 3%, 3.4% to $26,399 and 3.70% above), with the $2,470 deduction and the $29 per-exemption
 * credit. The formula is a single-employee formula and prints no joint table, so the joint
 * schedule the engine applies to married filers stays unconfirmed.
 *
 * @statute Ark. Code Ann. § 26-51-201
 */
export const US_2026_STATE_AR: UsStateParameters = defineState({
	code: "AR",
	name: "Arkansas",
	verification: "partial",
	type: "progressive",
	single: [
		[5_600, 0.02],
		[11_200, 0.03],
		[16_000, 0.034],
		[26_400, 0.037],
	],
	mfj: [
		[5_600, 0.02],
		[11_200, 0.03],
		[16_000, 0.034],
		[26_400, 0.037],
	],
	std: [2470, 4940],
	personalCredit: [29, 58],
	dependentCredit: 29,
})
