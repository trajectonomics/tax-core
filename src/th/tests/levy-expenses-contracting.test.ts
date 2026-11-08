import { describe, expect, it } from "bun:test"
import { addSection40_7Expense } from "../levy/expenses-contracting"
import { ThLevyIncomeLabel } from "../levy/labels"
import type { ThLevyExpenseChoice, ThLevyProfile } from "../levy/profile-types"
import { toSatang } from "../units"
import { breakdownOf, runLevy } from "./levy-build"
import { satangOf } from "./levy-satang"

const S7 = ThLevyIncomeLabel.Section40_7

function contractingExpense(
	income: ReadonlyMap<string, number>,
	choice: ThLevyExpenseChoice | undefined,
): number {
	return runLevy(income, new Map(), (graph, tallies) =>
		addSection40_7Expense(graph, tallies, choice),
	).due
}

describe("TH 2026 Levy Section 40(7) expense", () => {
	it("uses 60% of contracting income under the standard election", () => {
		const income = new Map([[S7, toSatang(100_000)]])
		expect(contractingExpense(income, undefined)).toBe(toSatang(60_000))
		expect(contractingExpense(income, undefined)).toBe(
			satangOf(breakdownOf({}, income).expenseDeductions.section40_7.allowed),
		)
	})

	it("caps an actual expense at the contracting income", () => {
		const income = new Map([[S7, toSatang(10_000)]])
		const profile: ThLevyProfile = {
			expenses: { section40_7: { election: "actual", actualExpense: 15_000 } },
		}
		expect(contractingExpense(income, profile.expenses?.section40_7)).toBe(toSatang(10_000))
		expect(contractingExpense(income, profile.expenses?.section40_7)).toBe(
			satangOf(breakdownOf(profile, income).expenseDeductions.section40_7.allowed),
		)
	})
})
