import { describe, expect, it } from "bun:test"
import {
	addSection40_1_2Expense,
	addSection40_3Expense,
	addSection40_4Expense,
} from "../levy/expenses-income"
import { ThLevyIncomeLabel } from "../levy/labels"
import type { ThLevyProfile } from "../levy/profile-types"
import { toSatang } from "../units"
import { breakdownOf, runLevy } from "./levy-build"
import { satangOf } from "./levy-satang"

const S1 = ThLevyIncomeLabel.Section40_1
const S2 = ThLevyIncomeLabel.Section40_2
const S3 = ThLevyIncomeLabel.Section40_3

function sharedExpense(income: ReadonlyMap<string, number>): number {
	return runLevy(income, new Map(), (graph, tallies) => addSection40_1_2Expense(graph, tallies)).due
}

describe("TH 2026 Levy Section 40(1)/(2) expense", () => {
	it("halves the combined income and caps it at 100,000 THB", () => {
		const below = new Map([[S1, toSatang(100_001)]])
		const atCap = new Map([
			[S1, toSatang(200_000)],
			[S2, toSatang(50_000)],
		])
		expect(sharedExpense(below)).toBe(toSatang(50_000))
		expect(sharedExpense(atCap)).toBe(toSatang(100_000))
		expect(sharedExpense(below)).toBe(
			satangOf(breakdownOf({}, below).expenseDeductions.section40_1_2.allowed),
		)
	})
})

describe("TH 2026 Levy Section 40(3) expense", () => {
	it("uses 50% capped at 100,000 THB under the standard election", () => {
		const income = new Map([[S3, toSatang(300_000)]])
		const profile: ThLevyProfile = {}
		const value = runLevy(income, new Map(), (graph, tallies) =>
			addSection40_3Expense(graph, tallies, profile.expenses?.section40_3),
		).due
		expect(value).toBe(toSatang(100_000))
		expect(value).toBe(satangOf(breakdownOf(profile, income).expenseDeductions.section40_3.allowed))
	})

	it("caps an actual expense at the royalty income", () => {
		const income = new Map([[S3, toSatang(60_000)]])
		const profile: ThLevyProfile = {
			expenses: { section40_3: { election: "actual", actualExpense: 70_000 } },
		}
		const value = runLevy(income, new Map(), (graph, tallies) =>
			addSection40_3Expense(graph, tallies, profile.expenses?.section40_3),
		).due
		expect(value).toBe(toSatang(60_000))
		expect(value).toBe(satangOf(breakdownOf(profile, income).expenseDeductions.section40_3.allowed))
	})
})

describe("TH 2026 Levy Section 40(4) expense", () => {
	it("is always zero", () => {
		const value = runLevy(new Map(), new Map(), (graph) => addSection40_4Expense(graph)).due
		expect(value).toBe(0)
	})
})
