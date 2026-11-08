import { describe, expect, it } from "bun:test"
import { addExpenseMeasures } from "../levy/expenses"
import { ThLevyIncomeLabel } from "../levy/labels"
import { toSatang } from "../units"
import { breakdownOf, runLevy } from "./levy-build"
import { satangOf } from "./levy-satang"

function total(income: ReadonlyMap<string, number>): number {
	return runLevy(income, new Map(), (graph, tallies) => addExpenseMeasures(graph, tallies)).due
}

describe("TH 2026 Levy expense total", () => {
	it("sums every Section 40 expense bucket", () => {
		const income = new Map([
			[ThLevyIncomeLabel.Section40_1, toSatang(400_000)],
			[ThLevyIncomeLabel.Section40_5Building, toSatang(100_000)],
			[ThLevyIncomeLabel.Section40_6Medical, toSatang(100_000)],
			[ThLevyIncomeLabel.Section40_7, toSatang(100_000)],
			[ThLevyIncomeLabel.Section40_8Entertainer, toSatang(500_000)],
		])
		expect(total(income)).toBe(toSatang(100_000 + 30_000 + 60_000 + 60_000 + 260_000))
		expect(total(income)).toBe(satangOf(breakdownOf({}, income).expenseDeductions.total))
	})

	it("stays at zero when no income is tallied", () => {
		expect(total(new Map())).toBe(0)
	})
})
