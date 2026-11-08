import { TH_2026_PARAMETERS } from "../parameters"
import { ThExpenseField } from "../types"
import { addExpenseLines } from "./expense-item"
import type { ThLevyGraph } from "./graph"
import { ThLevyIncomeLabel } from "./labels"
import type { ThLevyExpenseElections } from "./profile-types"
import type { ThLevyTallies } from "./tallies"

/**
 * Emits the Section 40(6) liberal profession expense: 60% for medical, 30% for every other
 * profession; actual expenses cap at their class income.
 *
 * Math: Per class, `floor(income * rate)` with medical 60% and the rest 30%.
 * Units: Integer satang Measures.
 * Throws: TaxValidationError if an elected actual expense is invalid.
 * @statute Thailand Royal Decree No. 11 Section 6.
 */
export function addSection40_6Expense(
	graph: ThLevyGraph,
	tallies: ThLevyTallies,
	choice: ThLevyExpenseElections["section40_6"],
): string {
	const income = tallies.income
	const rates = TH_2026_PARAMETERS.expenses.section40_6
	return addExpenseLines(graph, [
		{
			tally: income[ThLevyIncomeLabel.Section40_6Medical],
			choice: choice?.medical,
			rate: rates.medical,
			field: ThExpenseField.Section40_6_Medical,
		},
		{
			tally: income[ThLevyIncomeLabel.Section40_6Law],
			choice: choice?.law,
			rate: rates.other,
			field: ThExpenseField.Section40_6_Law,
		},
		{
			tally: income[ThLevyIncomeLabel.Section40_6Engineering],
			choice: choice?.engineering,
			rate: rates.other,
			field: ThExpenseField.Section40_6_Engineering,
		},
		{
			tally: income[ThLevyIncomeLabel.Section40_6Architecture],
			choice: choice?.architecture,
			rate: rates.other,
			field: ThExpenseField.Section40_6_Architecture,
		},
		{
			tally: income[ThLevyIncomeLabel.Section40_6Accounting],
			choice: choice?.accounting,
			rate: rates.other,
			field: ThExpenseField.Section40_6_Accounting,
		},
		{
			tally: income[ThLevyIncomeLabel.Section40_6FineArts],
			choice: choice?.fineArts,
			rate: rates.other,
			field: ThExpenseField.Section40_6_FineArts,
		},
		{
			tally: income[ThLevyIncomeLabel.Section40_6Other],
			choice: choice?.other,
			rate: rates.other,
			field: ThExpenseField.Section40_6_Other,
		},
	])
}
