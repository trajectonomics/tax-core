import { describe, expect, it } from "bun:test"
import { calculateUsTax } from "../index"
import type { UsFilingStatus, UsStateCode } from "../types"

/**
 * Hand-computed worked examples (single filer, W-2 wages only, no FICA) derived directly
 * from the published 2026 state bracket tables, independent of the engine's arithmetic.
 */
interface WorkedExample {
	readonly state: UsStateCode
	readonly wages: number
	readonly expectedTax: number
	readonly label: string
	readonly filingStatus?: UsFilingStatus
	readonly dependents?: number
	/** Decimal places for toBeCloseTo; 1 for half-cent rounding ties in the hand computation. */
	readonly precision?: number
}

const EXTENDED_EXAMPLES: readonly WorkedExample[] = [
	{
		// Georgia joint: 4.99% x (100,000 - 30,000 deduction - 2 x 5,000 dependent allowance).
		state: "GA",
		wages: 100_000,
		expectedTax: 2994,
		label: "GA joint return with two dependents",
		filingStatus: "married_filing_jointly",
		dependents: 2,
	},
	{
		// Massachusetts: 5% x 1,195,600 + 4% x (1,195,600 - 1,107,750) after the 4,400 exemption.
		state: "MA",
		wages: 1_200_000,
		expectedTax: 63_294,
		label: "MA millionaire surtax",
	},
	{
		// New Jersey head of household uses the joint schedule: 99,000 taxable after 1,000 exemption.
		// 280 + 525 + 490 + 350 + 19,000 x 5.525%.
		state: "NJ",
		wages: 100_000,
		expectedTax: 2694.75,
		label: "NJ head of household on the joint rate table",
		filingStatus: "head_of_household",
	},
]

const FILING_STATUS_EXAMPLES: readonly WorkedExample[] = [
	{
		// Connecticut HoH schedule: 81,000 taxable after the 19,000 exemption.
		// 16,000 x 2% + 64,000 x 4.5% + 1,000 x 5.5%.
		state: "CT",
		wages: 100_000,
		expectedTax: 3255,
		label: "CT head of household schedule",
		filingStatus: "head_of_household",
	},
	{
		// Connecticut separate filers: 12,000 exemption, 88,000 taxable on the single schedule.
		state: "CT",
		wages: 100_000,
		expectedTax: 4090,
		label: "CT separate return exemption",
		filingStatus: "married_filing_separately",
	},
	{
		// Maryland HoH uses the joint schedule and 6,800 deduction: 90,000 taxable after 3,200.
		state: "MD",
		wages: 100_000,
		expectedTax: 4222.5,
		label: "MD head of household on the joint schedule",
		filingStatus: "head_of_household",
	},
	{
		// New Mexico MFS: half the joint thresholds, 83,900 taxable after the 16,100 deduction.
		state: "NM",
		wages: 100_000,
		expectedTax: 3705.6,
		label: "NM separate return on half-joint thresholds",
		filingStatus: "married_filing_separately",
	},
	{
		// North Dakota HoH table: 75,850 taxable; 1.95% x (75,850 - 64,950).
		state: "ND",
		wages: 100_000,
		expectedTax: 212.55,
		label: "ND head of household table",
		filingStatus: "head_of_household",
	},
	{
		// West Virginia MFS (SB 392): 98,000 taxable; 975.25 + 4.58% x (98,000 - 30,000).
		state: "WV",
		wages: 100_000,
		expectedTax: 4089.65,
		label: "WV separate return on half thresholds",
		filingStatus: "married_filing_separately",
	},
	{
		// Vermont MFS thresholds are half the 2026 joint amounts (42,350 / 102,375):
		// 87,050 taxable, 42,350 x 3.35% + 44,700 x 6.6% = 1,418.725 + 2,950.20.
		state: "VT",
		wages: 100_000,
		expectedTax: 4368.925,
		label: "VT separate return on half-joint thresholds",
		filingStatus: "married_filing_separately",
		precision: 1,
	},
	{
		// Utah dependents add 6% x 2,111 = 126.66 each to the credit: 4.45% x 100,000 - 966 - 126.66.
		state: "UT",
		wages: 100_000,
		expectedTax: 3357.34,
		label: "UT dependent credit base",
		dependents: 1,
	},
	{
		// Missouri combined return taxes each spouse's half separately: doubled thresholds.
		// 17,800 taxable: 53.92 + 67.40 + 80.88 + 94.36 + 107.84 + 4.5% x 1,624.
		state: "MO",
		wages: 50_000,
		expectedTax: 477.48,
		label: "MO joint return on doubled thresholds",
		filingStatus: "married_filing_jointly",
	},
	{
		// Minnesota MFS thresholds are half the joint table: 84,700 taxable after 15,300 deduction.
		// 24,350 x 5.35% + 60,350 x 6.8%.
		state: "MN",
		wages: 100_000,
		expectedTax: 5406.525,
		label: "MN separate return on half-joint thresholds",
		filingStatus: "married_filing_separately",
		precision: 1,
	},
	{
		// Wisconsin 2026 MFS has its own table (10,080 / 34,630 / 221,820) and a 12,280
		// deduction, where the engine used to halve the joint thresholds and the joint
		// deduction. 100,000 - 12,280 - 700 = 87,020 taxable: 352.80 + 4.4% x 24,550
		// + 5.3% x 52,390. The 2026 instructions phase the deduction out above 13,779,
		// which the engine does not model.
		state: "WI",
		wages: 100_000,
		expectedTax: 4209.67,
		label: "WI separate return on its own 2026 thresholds",
		filingStatus: "married_filing_separately",
		precision: 1,
	},
	{
		// Minnesota head of household: 77,000 taxable after the 23,000 deduction.
		// 41,010 x 5.35% + 35,990 x 6.8%.
		state: "MN",
		wages: 100_000,
		expectedTax: 4641.355,
		label: "MN head of household table",
		filingStatus: "head_of_household",
		precision: 1,
	},
	{
		// Utah has no deduction; the credit is 6% of the federal standard deduction (24,150 HoH): 4.45% x 100,000 - 1,449.
		state: "UT",
		wages: 100_000,
		expectedTax: 3001,
		label: "UT head of household credit",
		filingStatus: "head_of_household",
	},
	{
		// Utah single: 4.45% x 100,000 less the 966 credit.
		state: "UT",
		wages: 100_000,
		expectedTax: 3484,
		label: "UT single credit",
	},
	{
		// New York separate filers use the single 8,000 deduction: 92,000 taxable.
		state: "NY",
		wages: 100_000,
		expectedTax: 4859.75,
		label: "NY separate return deduction",
		filingStatus: "married_filing_separately",
	},
]

const WORKED_EXAMPLES: ReadonlyArray<readonly [UsStateCode, number, number, string]> = [
	// Missouri: 83,900 taxable; 262.86 across the lower tiers + 4.7% x 74,464.
	["MO", 100_000, 3762.67, "MO progressive after the $1,348 zero tier"],
	// Pennsylvania: 3.07% x 100,000, no standard deduction.
	["PA", 100_000, 3070, "PA flat without deduction"],
	// Colorado: 4.4% x (100,000 - 16,100).
	["CO", 100_000, 3691.6, "CO flat after federal-linked standard deduction"],
	// Ohio: 2.75% x (97,642 - 26,050) after the $2,400 exemption and zero bracket.
	["OH", 100_042, 1968.78, "OH flat above the zero bracket"],
	// California 2026: 5,068.86 bracket tax on 94,100 taxable (5,900 deduction) less the $158 credit.
	["CA", 100_000, 4910.86, "CA nine-tier schedule less personal credit"],
	// Arizona: 2.5% x (100,000 - 16,100 federal-conforming standard deduction).
	["AZ", 100_000, 2097.5, "AZ flat after federal-conforming standard deduction"],
	// South Carolina Act 110: the 15,000 SCIAD is fully phased out at this income, so
	// 1.99% x 30,000 + 5.21% x 70,000 = 597 + 3,647.
	["SC", 100_000, 4244, "SC two-rate schedule after the phased-out SCIAD"],
	// Maine: 40,000 taxable (15,700 deduction, 5,300 exemption): 1,589.20 + 850.50.
	["ME", 61_000, 2439.7, "ME two-tier schedule after official 2026 deduction"],
	// New York: 4,859.75 bracket tax on 92,000 taxable.
	["NY", 100_000, 4859.75, "NY graduated schedule"],
]

describe("US state tax worked examples", () => {
	for (const [state, wages, expectedTax, label] of WORKED_EXAMPLES) {
		it(`matches the hand-computed ${label}`, () => {
			const result = calculateUsTax({
				filingStatus: "single",
				income: { w2Wages: wages },
				includeFica: false,
				state,
			})
			expect(result.breakdown.state?.totalTax).toBeCloseTo(expectedTax, 2)
		})
	}
})

describe("US state tax extended worked examples", () => {
	for (const example of [...EXTENDED_EXAMPLES, ...FILING_STATUS_EXAMPLES]) {
		it(`matches the hand-computed ${example.label}`, () => {
			const result = calculateUsTax({
				filingStatus: example.filingStatus ?? "single",
				income: { w2Wages: example.wages },
				includeFica: false,
				state: example.state,
				...(example.dependents === undefined ? {} : { stateDependents: example.dependents }),
			})
			expect(result.breakdown.state?.totalTax).toBeCloseTo(
				example.expectedTax,
				example.precision ?? 2,
			)
		})
	}

	it("adds the state marginal rate to the top-level marginal rate", () => {
		const federal = calculateUsTax({
			filingStatus: "single",
			income: { w2Wages: 100_000 },
			includeFica: false,
		})
		const withState = calculateUsTax({
			filingStatus: "single",
			income: { w2Wages: 100_000 },
			includeFica: false,
			state: "PA",
		})
		expect(withState.marginalRate).toBeCloseTo(federal.marginalRate + 0.0307, 6)
	})
})
