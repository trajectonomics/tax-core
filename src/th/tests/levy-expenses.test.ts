import { describe, expect, it } from "bun:test"
import { calculateThTax } from "../calculate"
import { addExpenseMeasures } from "../levy/expenses"
import { ThLevyGraph } from "../levy/graph"
import { ThLevyIncomeLabel } from "../levy/labels"
import type { ThLevyExpenseElections, ThLevyProfile } from "../levy/profile-types"
import { addThLevyTallies } from "../levy/tallies"
import { TH_2026_PARAMETERS } from "../parameters"
import { toSatang } from "../units"
import { thTaxInputFor } from "./levy-input"
import type { ThSatangTotals } from "./levy-satang"
import { satangOf } from "./levy-satang"
import { levyValues, simTallies } from "./levy-sim"

function expenseSatang(profile: ThLevyProfile, income: ThSatangTotals): number {
	const graph = new ThLevyGraph()
	const tallies = addThLevyTallies(graph)
	const total = addExpenseMeasures(graph, tallies, profile.expenses)
	const levy = graph.build("t", { month: 1, day: 1 }, { month: 3, day: 31 }, total)
	const value = levyValues(levy, simTallies(income)).get(total)
	return value ?? Number.NaN
}

function calculatorExpense(profile: ThLevyProfile, income: ThSatangTotals): number {
	return satangOf(calculateThTax(thTaxInputFor(profile, income)).breakdown.expenseDeductions.total)
}

function incomeOf(entries: Array<[ThLevyIncomeLabel, number]>): ThSatangTotals {
	return new Map(entries)
}

const salary = ThLevyIncomeLabel.Section40_1

describe("TH 2026 Levy expense measures", () => {
	it("caps the shared Section 40(1)/(2) 50% expense at 100,000 THB", () => {
		const atCap = incomeOf([[salary, toSatang(400_000)]])
		const below = incomeOf([[salary, toSatang(100_001)]])
		expect(expenseSatang({}, atCap)).toBe(toSatang(100_000))
		expect(expenseSatang({}, below)).toBe(toSatang(50_000))
	})

	it("matches the calculator for every standard expense class", () => {
		const income = incomeOf([
			[ThLevyIncomeLabel.Section40_2, toSatang(120_000)],
			[ThLevyIncomeLabel.Section40_3, toSatang(130_000)],
			[ThLevyIncomeLabel.Section40_5Building, toSatang(110_000)],
			[ThLevyIncomeLabel.Section40_5AgriculturalLand, toSatang(90_000)],
			[ThLevyIncomeLabel.Section40_5NonAgriculturalLand, toSatang(70_000)],
			[ThLevyIncomeLabel.Section40_5Vehicles, toSatang(50_000)],
			[ThLevyIncomeLabel.Section40_5Other, toSatang(30_000)],
			[ThLevyIncomeLabel.Section40_6Medical, toSatang(80_000)],
			[ThLevyIncomeLabel.Section40_6Law, toSatang(60_000)],
			[ThLevyIncomeLabel.Section40_7, toSatang(40_000)],
			[ThLevyIncomeLabel.Section40_8General, toSatang(20_000)],
			[ThLevyIncomeLabel.Section40_8Entertainer, toSatang(500_000)],
		])
		expect(expenseSatang({}, income)).toBe(calculatorExpense({}, income))
		expect(expenseSatang({}, income)).toBe(
			toSatang(
				60_000 +
					65_000 +
					33_000 +
					18_000 +
					10_500 +
					15_000 +
					3_000 +
					48_000 +
					18_000 +
					24_000 +
					12_000 +
					260_000,
			),
		)
	})

	it("caps entertainer income at the 600,000 THB ceiling", () => {
		const income = incomeOf([[ThLevyIncomeLabel.Section40_8Entertainer, toSatang(2_000_000)]])
		expect(expenseSatang({}, income)).toBe(toSatang(600_000))
		expect(expenseSatang({}, income)).toBe(calculatorExpense({}, income))
	})

	it("uses actual expenses capped at the item income", () => {
		const income = incomeOf([
			[ThLevyIncomeLabel.Section40_3, toSatang(60_000)],
			[ThLevyIncomeLabel.Section40_5Building, toSatang(40_000)],
			[ThLevyIncomeLabel.Section40_6Medical, toSatang(20_000)],
			[ThLevyIncomeLabel.Section40_7, toSatang(10_000)],
			[ThLevyIncomeLabel.Section40_8General, toSatang(5_000)],
			[ThLevyIncomeLabel.Section40_8Entertainer, toSatang(70_000)],
		])
		const actual = { election: "actual" as const, actualExpense: 55_000 }
		const profile: ThLevyProfile = {
			expenses: {
				section40_3: actual,
				section40_5: { building: { election: "actual", actualExpense: 50_000 } },
				section40_6: { medical: { election: "actual", actualExpense: 1_000 } },
				section40_7: actual,
				section40_8: {
					general: { election: "actual", actualExpense: 1_000 },
					entertainer: { election: "actual", actualExpense: 100_000 },
				},
			},
		}
		expect(expenseSatang(profile, income)).toBe(
			toSatang(40_000 + 55_000 + 1_000 + 10_000 + 1_000 + 70_000),
		)
		expect(expenseSatang(profile, income)).toBe(calculatorExpense(profile, income))
	})

	it("treats an explicit standard election as the standard deduction", () => {
		const income = incomeOf([[salary, toSatang(200_000)]])
		const elections: ThLevyExpenseElections = {
			section40_3: { election: "standard", actualExpense: 1 },
		}
		const profile: ThLevyProfile = { expenses: elections }
		expect(expenseSatang(profile, income)).toBe(
			toSatang(TH_2026_PARAMETERS.expenses.section40_1_2.ceiling),
		)
	})

	it("stays within one baht below the statutory expense caps", () => {
		const belowCap = incomeOf([[salary, toSatang(199_999)]])
		const profile: ThLevyProfile = {}
		expect(expenseSatang(profile, belowCap)).toBe(calculatorExpense(profile, belowCap))
	})
})
