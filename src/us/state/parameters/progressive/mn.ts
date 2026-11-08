import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Minnesota individual income tax parameters.
 *
 * Standard deduction reduced by 3% of AGI over $244,400 plus 10% over $337,800 (halved for
 * separate filers), capped at 80% of the deduction; the dependent exemption is disallowed 2%
 * per $2,500 (separate: $1,250) of AGI over the threshold. Amounts are the 2026 values published
 * by the Minnesota Department of Revenue. The statutory 80% cut-off above $1,107,750 is always
 * reached earlier through the 80% cap and is not modeled separately.
 *
 * @statute Minn. Stat. §§ 290.06, 290.0121 subd. 2, 290.0123 subd. 5
 */
export const US_2026_STATE_MN: UsStateParameters = defineState({
	code: "MN",
	name: "Minnesota",
	verification: "official",
	type: "progressive",
	single: [
		[0, 0.0535],
		[33_310, 0.068],
		[109_430, 0.0785],
		[203_150, 0.0985],
	],
	mfj: [
		[0, 0.0535],
		[48_700, 0.068],
		[193_480, 0.0785],
		[337_930, 0.0985],
	],
	hoh: [
		[0, 0.0535],
		[41_010, 0.068],
		[164_800, 0.0785],
		[270_060, 0.0985],
	],
	std: [15300, 30600, 23000],
	mfs: "half-mfj",
	dependentExemption: 5_300,
	standardDeductionPhaseOut: {
		kind: "tiered",
		start: {
			single: 244_400,
			married_filing_jointly: 244_400,
			married_filing_separately: 122_200,
			head_of_household: 244_400,
		},
		second: {
			single: 337_800,
			married_filing_jointly: 337_800,
			married_filing_separately: 168_900,
			head_of_household: 337_800,
		},
		rate: 0.03,
		secondRate: 0.1,
		maxShare: 0.8,
	},
	dependentExemptionPhaseOut: {
		kind: "stepped",
		start: {
			single: 244_500,
			married_filing_jointly: 366_700,
			married_filing_separately: 183_350,
			head_of_household: 305_600,
		},
		step: {
			single: 2_500,
			married_filing_jointly: 2_500,
			married_filing_separately: 1_250,
			head_of_household: 2_500,
		},
		ratePerStep: 0.02,
	},
})
