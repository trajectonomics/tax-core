import { describe, expect, it } from "bun:test"
import { calculateUsTax } from "../index"
import type { UsFilingStatus, UsStateCode } from "../types"

/**
 * Hand-computed worked examples for values corrected against official 2026 state documents
 * (see references/SOURCES.md): the DFA Arkansas formula, Hawaii Announcement 2024-03,
 * Louisiana RIB 26-005, South Carolina Act 110 of 2026 (H.4216) and Utah S.B. 60.
 */
interface OfficialExample {
	readonly state: UsStateCode
	readonly wages: number
	readonly expectedTax: number
	readonly label: string
	readonly filingStatus?: UsFilingStatus
}

const EXAMPLES: readonly OfficialExample[] = [
	{
		// Arkansas: 37,530 taxable after 2,470; 2% x 5,600 + 3% x 4,800 + 3.4% x 10,400
		// + 3.7% x 11,130 = 1,021.41, less the 29 personal credit.
		state: "AR",
		wages: 40_000,
		expectedTax: 992.41,
		label: "AR five-step schedule with personal credit",
	},
	{
		// Hawaii HoH: 86,856 taxable after the 12,000 deduction and 1,144 exemption.
		state: "HI",
		wages: 100_000,
		expectedTax: 4937.86,
		label: "HI head of household with the 2026 deduction",
		filingStatus: "head_of_household",
	},
	{
		// Louisiana RIB 26-005: head of household uses the joint 25,750 deduction (not 1.5x
		// single): 3% x (100,000 - 25,750) = 2,227.50.
		state: "LA",
		wages: 100_000,
		expectedTax: 2227.5,
		label: "LA head of household with the joint-size deduction",
		filingStatus: "head_of_household",
	},
	{
		// South Carolina Act 110: 15,000 SCIAD below the 40,000 start, so 1.99% x 25,000.
		state: "SC",
		wages: 40_000,
		expectedTax: 497.5,
		label: "SC 1.99% band with the full SCIAD",
	},
	{
		// South Carolina Act 110: reduction 15,000 x 20,000 / 55,000 = 5,454.55 floored to
		// 5,450, so 60,000 - 9,550 = 50,450 taxable: 1.99% x 30,000 + 5.21% x 20,450.
		state: "SC",
		wages: 60_000,
		expectedTax: 1662.45,
		label: "SC SCIAD phase-out inside the 55,000 band",
	},
	{
		// South Carolina Act 110 joint: reduction 30,000 x 70,000 / 110,000 = 19,090.91 floored
		// to 19,090, so 150,000 - 10,910 = 139,090 taxable: 597 + 5.21% x 109,090.
		state: "SC",
		wages: 150_000,
		expectedTax: 6280.59,
		label: "SC joint SCIAD phase-out",
		filingStatus: "married_filing_jointly",
	},
	{
		// South Carolina Act 110 separate filers use the single band: same 9,550 SCIAD and
		// the same 1.99% / 5.21% split as the single filer.
		state: "SC",
		wages: 60_000,
		expectedTax: 1662.45,
		label: "SC separate filer on the single band",
		filingStatus: "married_filing_separately",
	},
	{
		// South Carolina Act 110 head of household: reduction 22,500 x 40,000 / 82,500 =
		// 10,909.09 floored to 10,900, so 100,000 - 11,600 = 88,400 taxable:
		// 1.99% x 30,000 + 5.21% x 58,400.
		state: "SC",
		wages: 100_000,
		expectedTax: 3639.64,
		label: "SC head of household SCIAD phase-out",
		filingStatus: "head_of_household",
	},
	{
		// Utah S.B. 60 (2026 GS): rate 4.45% (was 4.5%). Single 100,000 wages:
		// 4.45% x 100,000 = 4,450 tax before credit, less 966 personal credit = 3,484.
		state: "UT",
		wages: 100_000,
		expectedTax: 3484,
		label: "UT 4.45% statutory rate with personal credit",
	},
]

describe("US state tax corrected against official documents", () => {
	for (const example of EXAMPLES) {
		it(`matches the hand-computed ${example.label}`, () => {
			const result = calculateUsTax({
				filingStatus: example.filingStatus ?? "single",
				income: { w2Wages: example.wages },
				includeFica: false,
				state: example.state,
			})
			expect(result.breakdown.state?.totalTax).toBeCloseTo(example.expectedTax, 2)
		})
	}
})
