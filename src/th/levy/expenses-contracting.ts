import { TH_2026_PARAMETERS } from "../parameters"
import { ThExpenseField } from "../types"
import { addItemExpense } from "./expense-item"
import type { ThLevyGraph } from "./graph"
import { ThLevyIncomeLabel } from "./labels"
import type { ThLevyExpenseChoice } from "./profile-types"
import type { ThLevyTallies } from "./tallies"

/**
 * Emits the Section 40(7) contracting expense: standard 60%, or actual capped at the income.
 *
 * Math: `floor(s7 * 0.6)` or `min(actual, s7)`.
 * Units: Integer satang Measures.
 * Throws: TaxValidationError if the elected actual expense is invalid.
 * @statute Thailand Royal Decree No. 11 Section 7.
 */
export function addSection40_7Expense(
	graph: ThLevyGraph,
	tallies: ThLevyTallies,
	choice: ThLevyExpenseChoice | undefined,
): string {
	return addItemExpense(graph, {
		tally: tallies.income[ThLevyIncomeLabel.Section40_7],
		choice,
		rate: TH_2026_PARAMETERS.expenses.section40_7.rate,
		field: ThExpenseField.Section40_7,
	})
}
