import { describe, expect, it } from "bun:test"
import { addSection40_5Expense } from "../levy/expenses-rental"
import { ThLevyIncomeLabel } from "../levy/labels"
import type { ThLevyExpenseElections } from "../levy/profile-types"
import { toSatang } from "../units"
import { breakdownOf, runLevy } from "./levy-build"
import { satangOf } from "./levy-satang"

const LABELS = [
	ThLevyIncomeLabel.Section40_5Building,
	ThLevyIncomeLabel.Section40_5AgriculturalLand,
	ThLevyIncomeLabel.Section40_5NonAgriculturalLand,
	ThLevyIncomeLabel.Section40_5Vehicles,
	ThLevyIncomeLabel.Section40_5Other,
]

function rentalExpense(
	income: ReadonlyMap<string, number>,
	choice: ThLevyExpenseElections["section40_5"],
): number {
	return runLevy(income, new Map(), (graph, tallies) =>
		addSection40_5Expense(graph, tallies, choice),
	).due
}

describe("TH 2026 Levy Section 40(5) expense", () => {
	it("applies each property class's standard percentage", () => {
		const income = new Map(LABELS.map((label) => [label, toSatang(100_000)] as const))
		expect(rentalExpense(income, undefined)).toBe(
			toSatang(30_000 + 20_000 + 15_000 + 30_000 + 10_000),
		)
		expect(rentalExpense(income, undefined)).toBe(
			satangOf(breakdownOf({}, income).expenseDeductions.section40_5.allowed),
		)
	})

	it("caps an actual expense at its class income", () => {
		const income = new Map([[ThLevyIncomeLabel.Section40_5Building, toSatang(40_000)]])
		const choice = { building: { election: "actual" as const, actualExpense: 50_000 } }
		expect(rentalExpense(income, choice)).toBe(toSatang(40_000))
		expect(rentalExpense(income, choice)).toBe(
			satangOf(
				breakdownOf({ expenses: { section40_5: choice } }, income).expenseDeductions.section40_5
					.allowed,
			),
		)
	})
})
