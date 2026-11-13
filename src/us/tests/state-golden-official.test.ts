import { describe, expect, it } from "bun:test"
import { calculateUsTax } from "../index"
import type { UsFilingStatus, UsStateCode } from "../types"

/**
 * Hand-computed worked examples for values corrected against official 2026 state documents
 * (see references/SOURCES.md): the DFA Arkansas formula, Hawaii Announcement 2024-03,
 * Louisiana RIB 26-005, South Carolina Act 110 of 2026 (H.4216), Utah S.B. 60, the 2026
 * Delaware PIT-EST instructions, the 2026 Montana Publication 1 and the 2026 Vermont
 * Form IN-114 instructions.
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
	{
		// Delaware 2026 PIT-EST instructions: 6.6% above 60,000. 96,750 taxable after the
		// 3,250 standard deduction: 66 + 195 + 480 + 260 + 5.55% x 35,000 + 6.6% x 36,750
		// = 5,369.00, less the 110 personal credit. The department prints a 2,943.00 base at
		// 60,000 where the bands sum to 2,943.50, so the engine is 0.50 higher.
		state: "DE",
		wages: 100_000,
		expectedTax: 5259,
		label: "DE six-band schedule above the 60,000 band",
	},
	{
		// Montana Publication 1 (2026) head of household: 4.7% to 71,250 (not the single
		// 47,500), then 5.65%. 100,000 less the 24,150 federal standard deduction the
		// publication adopts by reference but does not print = 75,850 taxable:
		// 4.7% x 71,250 + 5.65% x 4,600 = 3,348.75 + 259.90.
		state: "MT",
		wages: 100_000,
		expectedTax: 3608.65,
		label: "MT head-of-household 71,250 threshold",
		filingStatus: "head_of_household",
	},
	{
		// Vermont 2026 IN-114 rates: 3.35% to 50,750, then 6.6%. 100,000 less the 7,650
		// standard deduction and 5,300 exemption carried by the parameter table (the
		// document does not print them) = 87,050 taxable: 1,700.125 + 6.6% x 36,300 =
		// 4,095.925. The schedule prints a 1,700.00 base at 50,750 where 3.35% gives
		// 1,700.125 and rounds each base to whole dollars.
		state: "VT",
		wages: 100_000,
		expectedTax: 4095.93,
		label: "VT 2026 single thresholds",
	},
	{
		// Vermont 2026 IN-114 joint schedule: 3.35% to 84,700, 6.6% to 204,750, then 7.6%.
		// The 15,300 deduction and 10,600 exemption are not printed in the document. 250,000
		// less them = 224,100 taxable: 2,837.45 + 6.6% x 120,050 + 7.6% x 19,350. The printed
		// 2,837.00 base at 84,700 makes the department's own table 0.45 lower.
		state: "VT",
		wages: 250_000,
		expectedTax: 12231.35,
		label: "VT 2026 joint thresholds into the 7.6% band",
		filingStatus: "married_filing_jointly",
	},
	{
		// Vermont 2026 IN-114 head-of-household schedule: 3.35% to 68,000, then 6.6% to
		// 175,500. The 83,225 taxable is 100,000 less the 11,475 head-of-household standard
		// deduction carried as data next to the 7,650 single amount (the document does not
		// print either) and the 5,300 exemption: 3.35% x 68,000 + 6.6% x 15,225 = 2,278 +
		// 1,004.85.
		state: "VT",
		wages: 100_000,
		expectedTax: 3282.85,
		label: "VT 2026 head-of-household schedule",
		filingStatus: "head_of_household",
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
