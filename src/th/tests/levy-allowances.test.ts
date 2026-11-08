import { describe, expect, it } from "bun:test"
import { addAllowanceMeasures } from "../levy/allowances"
import { addAssessableMeasures } from "../levy/assessable"
import { addExpenseMeasures } from "../levy/expenses"
import { ThLevyIncomeLabel } from "../levy/labels"
import { ThLevyMeasureId } from "../levy/measure-ids"
import type { ThLevyProfile } from "../levy/profile-types"
import { addSection40_4 } from "../levy/regimes"
import { toSatang } from "../units"
import { breakdownOf, runLevy } from "./levy-build"
import { satangOf } from "./levy-satang"

const S1 = ThLevyIncomeLabel.Section40_1

function allowances(
	profile: ThLevyProfile,
	income: ReadonlyMap<string, number>,
	contributions: ReadonlyMap<string, number> = new Map(),
): { total: number; netTaxable: number } {
	const values = runLevy(income, contributions, (graph, tallies) => {
		const section40_4 = addSection40_4(graph, tallies, profile.section40_4)
		const assessable = addAssessableMeasures(graph, tallies, section40_4)
		const expenses = addExpenseMeasures(graph, tallies, profile.expenses)
		return addAllowanceMeasures(graph, tallies, profile, assessable.total, expenses).netTaxable
	}).values
	return {
		total: values.get(ThLevyMeasureId.AllowancesTotal) ?? Number.NaN,
		netTaxable: values.get(ThLevyMeasureId.NetTaxableIncome) ?? Number.NaN,
	}
}

function expected(profile: ThLevyProfile, income: ReadonlyMap<string, number>) {
	const breakdown = breakdownOf(profile, income)
	return {
		total: satangOf(breakdown.allowances.total),
		netTaxable: satangOf(breakdown.netTaxableIncome),
	}
}

describe("TH 2026 Levy allowance total", () => {
	it("derives net taxable income after expenses, allowances, and donations", () => {
		const income = new Map([[S1, toSatang(1_000_000)]])
		const profile: ThLevyProfile = { allowances: { donation2x: 50_000, donation1x: 100_000 } }
		expect(allowances(profile, income)).toEqual({
			total: toSatang(60_000 + 84_000 + 75_600),
			netTaxable: toSatang(680_400),
		})
		expect(allowances(profile, income)).toEqual(expected(profile, income))
	})

	it("never reports negative net taxable income", () => {
		const income = new Map([[S1, toSatang(80_000)]])
		const profile: ThLevyProfile = { allowances: { donation1x: 50_000 } }
		expect(allowances(profile, income).netTaxable).toBe(0)
		expect(allowances(profile, income)).toEqual(expected(profile, income))
	})
})
