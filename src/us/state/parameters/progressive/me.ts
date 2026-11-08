import { defineState } from "../helpers"
import type { UsStateParameters } from "../types"
/**
 * 2026 Maine individual income tax parameters.
 *
 * Standard deduction phased out linearly over $75,000 (single, separate), $112,500 (head of
 * household) and $150,000 (joint) of AGI above $102,250, $153,400 and $204,550; the head of
 * household start is the statutory $120,000 indexed with the single and joint starts.
 * 2% surcharge on Maine taxable income above $1,000,000 (single), $1,500,000 (joint and head
 * of household) and $750,000 (separate), effective for tax years beginning in 2026.
 *
 * @statute Me. Rev. Stat. tit. 36, § 5111, sub-§ 7 (P.L. 2025, c. 650, Pt. DDDD)
 */
export const US_2026_STATE_ME: UsStateParameters = defineState({
	code: "ME",
	name: "Maine",
	verification: "official",
	type: "progressive",
	single: [
		[0, 0.058],
		[27_400, 0.0675],
		[64_850, 0.0715],
	],
	mfj: [
		[0, 0.058],
		[54_850, 0.0675],
		[129_750, 0.0715],
	],
	hoh: [
		[0, 0.058],
		[41_100, 0.0675],
		[97_300, 0.0715],
	],
	std: [15700, 31400, 23550],
	personalExemption: [5300, 10600],
	dependentCredit: 305,
	standardDeductionPhaseOut: {
		kind: "linear",
		start: {
			single: 102_250,
			married_filing_jointly: 204_550,
			married_filing_separately: 102_250,
			head_of_household: 153_400,
		},
		width: {
			single: 75_000,
			married_filing_jointly: 150_000,
			married_filing_separately: 75_000,
			head_of_household: 112_500,
		},
	},
	surtax: {
		threshold: {
			single: 1_000_000,
			married_filing_jointly: 1_500_000,
			married_filing_separately: 750_000,
			head_of_household: 1_500_000,
		},
		rate: 0.02,
	},
})
