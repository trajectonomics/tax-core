import { describe, expect, it } from "bun:test"
import { addAssessableMeasures } from "../levy/assessable"
import { ThLevyIncomeLabel } from "../levy/labels"
import { ThLevyMeasureId } from "../levy/measure-ids"
import type { ThLevyProfile } from "../levy/profile-types"
import { addSection40_4 } from "../levy/regimes"
import { toSatang } from "../units"
import { breakdownOf, runLevy } from "./levy-build"
import { satangOf } from "./levy-satang"

const LABELS = [
	ThLevyIncomeLabel.Section40_1,
	ThLevyIncomeLabel.Section40_2,
	ThLevyIncomeLabel.Section40_3,
	ThLevyIncomeLabel.Section40_4Dividends,
	ThLevyIncomeLabel.Section40_5Building,
	ThLevyIncomeLabel.Section40_6Medical,
	ThLevyIncomeLabel.Section40_7,
	ThLevyIncomeLabel.Section40_8General,
]

function assessable(profile: ThLevyProfile, income: ReadonlyMap<string, number>) {
	const values = runLevy(income, new Map(), (graph, tallies) => {
		const section40_4 = addSection40_4(graph, tallies, profile.section40_4)
		return addAssessableMeasures(graph, tallies, section40_4).total
	}).values
	return {
		total: values.get(ThLevyMeasureId.AssessableTotal) ?? Number.NaN,
		grossNonEmployment: values.get(ThLevyMeasureId.GrossNonEmployment) ?? Number.NaN,
	}
}

function expected(profile: ThLevyProfile, income: ReadonlyMap<string, number>) {
	const breakdown = breakdownOf(profile, income).assessableIncome
	return {
		total: satangOf(breakdown.total),
		grossNonEmployment: satangOf(breakdown.grossNonEmploymentIncome),
	}
}

describe("TH 2026 Levy assessable income", () => {
	it("sums every Section 40 class and excludes employment from the minimum-tax base", () => {
		const income = new Map(LABELS.map((label) => [label, toSatang(100_000)] as const))
		expect(assessable({}, income)).toEqual({
			total: toSatang(800_000),
			grossNonEmployment: toSatang(700_000),
		})
		expect(assessable({}, income)).toEqual(expected({}, income))
	})

	it("adds the Section 47 bis gross-up to Section 40(4) assessable income", () => {
		const income = new Map([[ThLevyIncomeLabel.Section40_4Dividends, toSatang(100_000)]])
		const profile: ThLevyProfile = { section40_4: { dividendCorpTaxRate: 0.2 } }
		expect(assessable(profile, income)).toEqual({
			total: toSatang(125_000),
			grossNonEmployment: toSatang(125_000),
		})
		expect(assessable(profile, income)).toEqual(expected(profile, income))
	})

	it("excludes a final-elected Section 40(4) source from assessable income", () => {
		const income = new Map([[ThLevyIncomeLabel.Section40_4Interest, toSatang(100_000)]])
		const profile: ThLevyProfile = { section40_4: { interest: "final" } }
		expect(assessable(profile, income)).toEqual({ total: 0, grossNonEmployment: 0 })
		expect(assessable(profile, income)).toEqual(expected(profile, income))
	})
})
