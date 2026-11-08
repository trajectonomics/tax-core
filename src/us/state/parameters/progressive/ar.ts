import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Arkansas individual income tax parameters.
 *
 * Brackets from the DFA 2026 withholding formula (0% to $5,599, then 2%, 3%, 3.4%); the top rate is
 * 3.7% after H.B. 1001 (retroactive to 2026-01-01), as reported by EY and Bloomberg Tax. The DFA
 * formula still served on 2026-11-08 prints 3.90%, so the top rate is recorded as unconfirmed.
 *
 * @statute Ark. Code Ann. § 26-51-201
 */
export const US_2026_STATE_AR: UsStateParameters = defineState({
	code: "AR",
	name: "Arkansas",
	verification: "unconfirmed",
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
