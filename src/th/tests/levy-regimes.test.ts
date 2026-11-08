import { describe, expect, it } from "bun:test"
import { TaxValidationError } from "../../core/money"
import { calculateThTax } from "../calculate"
import { addAssessableMeasures } from "../levy/assessable"
import { ThLevyGraph } from "../levy/graph"
import { ThLevyIncomeLabel } from "../levy/labels"
import type { ThLevyProfile } from "../levy/profile-types"
import { addSection40_4 } from "../levy/regimes"
import { addThLevyTallies } from "../levy/tallies"
import { toSatang } from "../units"
import { thTaxInputFor } from "./levy-input"
import { satangOf } from "./levy-satang"
import { levyValues, simTallies } from "./levy-sim"

type Totals = ReadonlyMap<string, number>

function run(profile: ThLevyProfile, income: Totals) {
	const graph = new ThLevyGraph()
	const tallies = addThLevyTallies(graph)
	const section40_4 = addSection40_4(graph, tallies, profile.section40_4)
	const assessable = addAssessableMeasures(graph, tallies, section40_4)
	const levy = graph.build("t", { month: 1, day: 1 }, { month: 3, day: 31 }, assessable.total)
	const values = levyValues(levy, simTallies(income))
	return {
		assessable: values.get(section40_4.assessable) ?? Number.NaN,
		finalTax: values.get(section40_4.finalWithholdingTax) ?? Number.NaN,
		credit: values.get(section40_4.dividendCredit) ?? Number.NaN,
	}
}

function calculator(profile: ThLevyProfile, income: Totals) {
	const breakdown = calculateThTax(thTaxInputFor(profile, income)).breakdown
	return {
		assessable: satangOf(breakdown.assessableIncome.section40_4),
		finalTax: satangOf(breakdown.finalWithholding.totalTax),
		credit: satangOf(breakdown.dividendTaxCredit.credit),
	}
}

const all = new Map([
	[ThLevyIncomeLabel.Section40_4Other, toSatang(100_000)],
	[ThLevyIncomeLabel.Section40_4Interest, toSatang(50_000)],
	[ThLevyIncomeLabel.Section40_4Dividends, toSatang(20_000)],
	[ThLevyIncomeLabel.Section40_4DigitalAssets, toSatang(30_000)],
])

describe("TH 2026 Levy Section 40(4) measures", () => {
	it("includes every source by default with no withholding or credit", () => {
		expect(run({}, all)).toEqual({ assessable: toSatang(200_000), finalTax: 0, credit: 0 })
		expect(run({}, all)).toEqual(calculator({}, all))
	})

	it("grosses included dividends up by the Section 47 bis credit", () => {
		const profile: ThLevyProfile = { section40_4: { dividendCorpTaxRate: 0.2 } }
		expect(run(profile, all)).toEqual({
			assessable: toSatang(205_000),
			finalTax: 0,
			credit: toSatang(5_000),
		})
		expect(run(profile, all)).toEqual(calculator(profile, all))
	})

	it("withholds a final-elected source and keeps it out of assessable income", () => {
		const profile: ThLevyProfile = { section40_4: { interest: "final" } }
		expect(run(profile, all)).toEqual({
			assessable: toSatang(150_000),
			finalTax: toSatang(7_500),
			credit: 0,
		})
		expect(run(profile, all)).toEqual(calculator(profile, all))
	})

	it("gives no credit when dividends are elected final, even with a corporate rate", () => {
		const profile: ThLevyProfile = {
			section40_4: { dividends: "final", dividendCorpTaxRate: 0.2 },
		}
		expect(run(profile, all)).toEqual({
			assessable: toSatang(180_000),
			finalTax: toSatang(2_000),
			credit: 0,
		})
		expect(run(profile, all)).toEqual(calculator(profile, all))
	})

	it("withholds digital asset income at the interest rate", () => {
		const profile: ThLevyProfile = { section40_4: { digitalAssets: "final" } }
		expect(run(profile, all)).toEqual({
			assessable: toSatang(170_000),
			finalTax: toSatang(4_500),
			credit: 0,
		})
		expect(run(profile, all)).toEqual(calculator(profile, all))
	})

	it("rounds withholding at a half-satang tie away from zero", () => {
		const profile: ThLevyProfile = { section40_4: { interest: "final" } }
		const income = new Map([[ThLevyIncomeLabel.Section40_4Interest, 1010]])
		expect(run(profile, income).finalTax).toBe(152)
		expect(run(profile, income)).toEqual(calculator(profile, income))
	})

	it("rejects a corporate tax rate that is not below 1", () => {
		const profile: ThLevyProfile = { section40_4: { dividendCorpTaxRate: 1 } }
		expect(() => run(profile, all)).toThrow(TaxValidationError)
	})
})
