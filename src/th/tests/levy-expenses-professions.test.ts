import { describe, expect, it } from "bun:test"
import { addSection40_6Expense } from "../levy/expenses-professions"
import { ThLevyIncomeLabel } from "../levy/labels"
import type { ThLevyExpenseElections } from "../levy/profile-types"
import { toSatang } from "../units"
import { breakdownOf, runLevy } from "./levy-build"
import { satangOf } from "./levy-satang"

const MEDICAL = ThLevyIncomeLabel.Section40_6Medical
const LAW = ThLevyIncomeLabel.Section40_6Law

function professionExpense(
	income: ReadonlyMap<string, number>,
	choice: ThLevyExpenseElections["section40_6"],
): number {
	return runLevy(income, new Map(), (graph, tallies) =>
		addSection40_6Expense(graph, tallies, choice),
	).due
}

describe("TH 2026 Levy Section 40(6) expense", () => {
	it("uses 60% for medical and 30% for other professions", () => {
		const income = new Map([
			[MEDICAL, toSatang(100_000)],
			[LAW, toSatang(100_000)],
		])
		expect(professionExpense(income, undefined)).toBe(toSatang(60_000 + 30_000))
		expect(professionExpense(income, undefined)).toBe(
			satangOf(breakdownOf({}, income).expenseDeductions.section40_6.allowed),
		)
	})

	it("caps an actual medical expense at the profession income", () => {
		const income = new Map([[MEDICAL, toSatang(20_000)]])
		const choice = { medical: { election: "actual" as const, actualExpense: 25_000 } }
		expect(professionExpense(income, choice)).toBe(toSatang(20_000))
		expect(professionExpense(income, choice)).toBe(
			satangOf(
				breakdownOf({ expenses: { section40_6: choice } }, income).expenseDeductions.section40_6
					.allowed,
			),
		)
	})
})
