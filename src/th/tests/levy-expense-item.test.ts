import { describe, expect, it } from "bun:test"
import { TaxValidationError } from "../../core/money"
import type { ThLevyExpenseLine } from "../levy/expense-item"
import { addActualExpense, addExpenseLines, addItemExpense } from "../levy/expense-item"
import { ThLevyIncomeLabel } from "../levy/labels"
import { ThExpenseField } from "../types"
import { toSatang } from "../units"
import { runLevy } from "./levy-build"

const S1 = ThLevyIncomeLabel.Section40_1

function lineValue(incomeSatang: number, line: Omit<ThLevyExpenseLine, "tally">): number {
	return runLevy(new Map([[S1, incomeSatang]]), new Map(), (graph, tallies) =>
		addItemExpense(graph, { ...line, tally: tallies.income[S1] }),
	).due
}

describe("TH 2026 Levy expense item helper", () => {
	it("applies the standard percentage and an optional ceiling", () => {
		const line = { rate: 0.5, field: ThExpenseField.Section40_1_2 }
		expect(lineValue(toSatang(100_000), line)).toBe(toSatang(50_000))
		expect(lineValue(toSatang(400_000), { ...line, capSatang: toSatang(100_000) })).toBe(
			toSatang(100_000),
		)
	})

	it("caps the actual expense at the item income", () => {
		const line = {
			rate: 0.5,
			field: ThExpenseField.Section40_1_2,
			choice: { election: "actual" as const, actualExpense: 80_000 },
		}
		expect(lineValue(toSatang(50_000), line)).toBe(toSatang(50_000))
		expect(lineValue(toSatang(100_000), line)).toBe(toSatang(80_000))
	})

	it("ignores the actual amount under an explicit standard election", () => {
		const line = {
			rate: 0.5,
			field: ThExpenseField.Section40_1_2,
			choice: { election: "standard" as const, actualExpense: 80_000 },
		}
		expect(lineValue(toSatang(100_000), line)).toBe(toSatang(50_000))
	})

	it("sums several expense lines", () => {
		const value = runLevy(new Map([[S1, toSatang(100_000)]]), new Map(), (graph, tallies) =>
			addExpenseLines(graph, [
				{ tally: tallies.income[S1], rate: 0.6, field: ThExpenseField.Section40_8_General },
				{ tally: tallies.income[S1], rate: 0.1, field: ThExpenseField.Section40_8_Entertainer },
			]),
		).due
		expect(value).toBe(toSatang(70_000))
	})

	it("rejects a negative actual expense", () => {
		expect(() =>
			runLevy(new Map([[S1, toSatang(100_000)]]), new Map(), (graph, tallies) =>
				addActualExpense(
					graph,
					tallies.income[S1],
					{ actualExpense: -1 },
					ThExpenseField.Section40_3,
				),
			),
		).toThrow(TaxValidationError)
	})
})
