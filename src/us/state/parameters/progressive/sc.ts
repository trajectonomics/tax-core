import { defineState } from "../helpers"
import type { UsStateBracketTiers, UsStateParameters } from "../types"

/**
 * 2026 South Carolina individual income tax parameters.
 *
 * Act 110 of 2026 (H.4216, ratified R 117, signed 2026-03-30) replaces the 0% / 3% / 6%
 * schedule with a 1.99% band to $30,000 and 5.21% above, expressed in the act as "5.21% times
 * the amount minus $966" (5.21% x 30,000 - 1.99% x 30,000 = 966, so the two bands meet at
 * $597). It also replaces the federal standard deduction with the South Carolina Income
 * Adjusted Deduction (SCIAD) of $15,000 single and separate, $22,500 head of household,
 * $30,000 joint, reduced by (federal AGI - start) / width and floored to $10.
 *
 * The $30,000 bracket is indexed under § 12-6-520 and the $4,930 dependent exemption is a
 * 2026 indexed amount; neither is published, so the table is recorded as partial. The act also
 * raised the earned income tax credit to 125% of the federal credit capped at $200; no state
 * EITC is modelled in this engine.
 *
 * @statute S.C. Code §§ 12-6-510(C) (as amended by Act 110 of 2026), 12-6-1140(15)
 */
/** Both filing-status axes share one table: the act taxes South Carolina taxable income the same way. */
const SC_TIERS: UsStateBracketTiers = [
	[0, 0.0199],
	[30_000, 0.0521],
]

export const US_2026_STATE_SC: UsStateParameters = defineState({
	code: "SC",
	name: "South Carolina",
	verification: "partial",
	type: "progressive",
	single: SC_TIERS,
	mfj: SC_TIERS,
	std: [15_000, 30_000, 22_500],
	dependentExemption: 4_930,
	standardDeductionPhaseOut: {
		kind: "linear",
		start: {
			single: 40_000,
			married_filing_jointly: 80_000,
			married_filing_separately: 40_000,
			head_of_household: 60_000,
		},
		width: {
			single: 55_000,
			married_filing_jointly: 110_000,
			married_filing_separately: 55_000,
			head_of_household: 82_500,
		},
		reductionStep: 10,
	},
})
