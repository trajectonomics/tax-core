import { describe, expect, it } from "bun:test"
import { addSection40_8Expense } from "../levy/expenses-business"
import { ThLevyIncomeLabel } from "../levy/labels"
import type { ThLevyExpenseElections, ThLevyProfile } from "../levy/profile-types"
import { toSatang } from "../units"
import { breakdownOf, runLevy } from "./levy-build"
import { satangOf } from "./levy-satang"

const GENERAL = ThLevyIncomeLabel.Section40_8General
const ENTERTAINER = ThLevyIncomeLabel.Section40_8Entertainer

function businessExpense(
	income: ReadonlyMap<string, number>,
	choice: ThLevyExpenseElections["section40_8"],
): number {
	return runLevy(income, new Map(), (graph, tallies) =>
		addSection40_8Expense(graph, tallies, choice),
	).due
}

describe("TH 2026 Levy Section 40(8) expense", () => {
	it("uses 60% for general business income", () => {
		const income = new Map([[GENERAL, toSatang(100_000)]])
		expect(businessExpense(income, undefined)).toBe(toSatang(60_000))
		expect(businessExpense(income, undefined)).toBe(
			satangOf(breakdownOf({}, income).expenseDeductions.section40_8.allowed),
		)
	})

	it("applies the 60%/40% entertainer tiers and their 600,000 THB ceiling", () => {
		const tiered = new Map([[ENTERTAINER, toSatang(500_000)]])
		const capped = new Map([[ENTERTAINER, toSatang(2_000_000)]])
		expect(businessExpense(tiered, undefined)).toBe(toSatang(260_000))
		expect(businessExpense(capped, undefined)).toBe(toSatang(600_000))
		expect(businessExpense(capped, undefined)).toBe(
			satangOf(breakdownOf({}, capped).expenseDeductions.section40_8.allowed),
		)
	})

	it("caps an actual entertainer expense at the entertainer income", () => {
		const income = new Map([[ENTERTAINER, toSatang(70_000)]])
		const profile: ThLevyProfile = {
			expenses: { section40_8: { entertainer: { election: "actual", actualExpense: 100_000 } } },
		}
		expect(businessExpense(income, profile.expenses?.section40_8)).toBe(toSatang(70_000))
		expect(businessExpense(income, profile.expenses?.section40_8)).toBe(
			satangOf(breakdownOf(profile, income).expenseDeductions.section40_8.allowed),
		)
	})
})
