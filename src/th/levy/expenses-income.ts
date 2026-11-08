import { TH_2026_PARAMETERS } from "../parameters"
import { ThExpenseField } from "../types"
import { toSatang } from "../units"
import { addItemExpense } from "./expense-item"
import type { ThLevyGraph } from "./graph"
import { ThLevyIncomeLabel } from "./labels"
import type { ThLevyExpenseChoice } from "./profile-types"
import type { ThLevyTallies } from "./tallies"

/**
 * Emits the shared Section 40(1) and 40(2) expense: 50% of their combined income, capped at
 * 100,000 THB.
 *
 * Purpose: Mirrors the shared employment/service expense deduction as Measures.
 * Math: `min(floor((s1 + s2) * 0.5), 100000)` in whole baht, summed before the percentage.
 * Units: Integer satang Measures.
 * Throws: Nothing; both tallies are caller-supplied integer satang.
 * @statute Thailand Revenue Code Section 42 bis.
 */
export function addSection40_1_2Expense(graph: ThLevyGraph, tallies: ThLevyTallies): string {
	const income = tallies.income
	const combined = graph.add(
		income[ThLevyIncomeLabel.Section40_1],
		income[ThLevyIncomeLabel.Section40_2],
	)
	const rate = TH_2026_PARAMETERS.expenses.section40_1_2
	return addItemExpense(graph, {
		tally: combined,
		rate: rate.rate,
		field: ThExpenseField.Section40_1_2,
		capSatang: toSatang(rate.ceiling, ThExpenseField.Section40_1_2),
	})
}

/**
 * Emits the Section 40(3) royalty expense: standard 50% capped at 100,000 THB, or actual capped
 * at the royalty income.
 *
 * Purpose: Mirrors the royalty expense deduction, including its actual-expense election.
 * Math: `min(floor(s3 * 0.5), 100000)` or `min(actual, s3)`.
 * Units: Integer satang Measures.
 * Throws: TaxValidationError if the elected actual expense is invalid.
 * @statute Thailand Revenue Code Section 42 ter; Royal Decree No. 11 Section 4.
 */
export function addSection40_3Expense(
	graph: ThLevyGraph,
	tallies: ThLevyTallies,
	choice: ThLevyExpenseChoice | undefined,
): string {
	const rate = TH_2026_PARAMETERS.expenses.section40_3
	return addItemExpense(graph, {
		tally: tallies.income[ThLevyIncomeLabel.Section40_3],
		choice,
		rate: rate.rate,
		field: ThExpenseField.Section40_3,
		capSatang: toSatang(rate.ceiling, ThExpenseField.Section40_3),
	})
}

/**
 * Emits the Section 40(4) expense, statutorily zero.
 *
 * Purpose: Keeps the expense total's shape identical to the calculator's.
 * Math: `0`.
 * Units: Integer satang.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Section 40(4).
 */
export function addSection40_4Expense(graph: ThLevyGraph): string {
	return graph.constant(0)
}
