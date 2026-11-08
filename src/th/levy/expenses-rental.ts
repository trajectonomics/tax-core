import { TH_2026_PARAMETERS } from "../parameters"
import { ThExpenseField } from "../types"
import { addExpenseLines } from "./expense-item"
import type { ThLevyGraph } from "./graph"
import { ThLevyIncomeLabel } from "./labels"
import type { ThLevyExpenseElections } from "./profile-types"
import type { ThLevyTallies } from "./tallies"

/**
 * Emits the Section 40(5) rental expense across the five property classes.
 *
 * Math: Per class, `floor(income * rate)` with building 30%, agricultural land 20%,
 * non-agricultural land 15%, vehicles 30%, other 10%; actual expenses cap at their class income.
 * Units: Integer satang Measures.
 * Throws: TaxValidationError if an elected actual expense is invalid.
 * @statute Thailand Royal Decree No. 11 Section 5.
 */
export function addSection40_5Expense(
	graph: ThLevyGraph,
	tallies: ThLevyTallies,
	choice: ThLevyExpenseElections["section40_5"],
): string {
	const income = tallies.income
	const rates = TH_2026_PARAMETERS.expenses.section40_5
	return addExpenseLines(graph, [
		{
			tally: income[ThLevyIncomeLabel.Section40_5Building],
			choice: choice?.building,
			rate: rates.building,
			field: ThExpenseField.Section40_5_Building,
		},
		{
			tally: income[ThLevyIncomeLabel.Section40_5AgriculturalLand],
			choice: choice?.agriculturalLand,
			rate: rates.agriculturalLand,
			field: ThExpenseField.Section40_5_AgriculturalLand,
		},
		{
			tally: income[ThLevyIncomeLabel.Section40_5NonAgriculturalLand],
			choice: choice?.nonAgriculturalLand,
			rate: rates.nonAgriculturalLand,
			field: ThExpenseField.Section40_5_NonAgriculturalLand,
		},
		{
			tally: income[ThLevyIncomeLabel.Section40_5Vehicles],
			choice: choice?.vehicles,
			rate: rates.vehicles,
			field: ThExpenseField.Section40_5_Vehicles,
		},
		{
			tally: income[ThLevyIncomeLabel.Section40_5Other],
			choice: choice?.other,
			rate: rates.other,
			field: ThExpenseField.Section40_5_Other,
		},
	])
}
