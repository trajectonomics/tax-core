import { TH_2026_PARAMETERS } from "../parameters"
import { ThExpenseField } from "../types"
import { toSatang } from "../units"
import { addActualExpense, addItemExpense } from "./expense-item"
import type { ThLevyGraph } from "./graph"
import { capAt, rateFlooredToBaht, sumMeasures } from "./graph-rates"
import { ThLevyIncomeLabel } from "./labels"
import type { ThLevyExpenseElections } from "./profile-types"
import type { ThLevyTallies } from "./tallies"

function addEntertainerExpense(
	graph: ThLevyGraph,
	tally: string,
	choice: ThLevyExpenseElections["section40_8"],
): string {
	const entertainer = choice?.entertainer
	const field = ThExpenseField.Section40_8_Entertainer
	if (entertainer?.election === "actual") {
		return addActualExpense(graph, tally, entertainer, field)
	}
	const p = TH_2026_PARAMETERS.expenses.section40_8
	const threshold = toSatang(p.entertainerFirstTierThreshold, field)
	const firstTier = graph.min(tally, graph.constant(threshold))
	const secondTier = graph.max(graph.sub(tally, graph.constant(threshold)), graph.constant(0))
	const computed = graph.add(
		rateFlooredToBaht(graph, firstTier, p.entertainerFirstTierRate),
		rateFlooredToBaht(graph, secondTier, p.entertainerSecondTierRate),
	)
	return capAt(graph, computed, toSatang(p.entertainerCeiling, field))
}

/**
 * Emits the Section 40(8) business expense: general income at 60%, entertainer income on the
 * 60%/40% two-tier schedule capped at 600,000 THB; actual expenses cap at their income.
 *
 * Purpose: Mirrors both Section 40(8) expense schedules and their actual-expense elections.
 * Math: General `floor(income * 0.6)`. Entertainer
 * `min(floor(min(income, 300000) * 0.6) + floor(max(income - 300000, 0) * 0.4), 600000)`.
 * Units: Integer satang Measures.
 * Throws: TaxValidationError if an elected actual expense is invalid.
 * @statute Thailand Royal Decree No. 11 Section 8.
 */
export function addSection40_8Expense(
	graph: ThLevyGraph,
	tallies: ThLevyTallies,
	choice: ThLevyExpenseElections["section40_8"],
): string {
	const rates = TH_2026_PARAMETERS.expenses.section40_8
	const income = tallies.income
	const general = addItemExpense(graph, {
		tally: income[ThLevyIncomeLabel.Section40_8General],
		choice: choice?.general,
		rate: rates.generalRate,
		field: ThExpenseField.Section40_8_General,
	})
	const entertainer = addEntertainerExpense(
		graph,
		income[ThLevyIncomeLabel.Section40_8Entertainer],
		choice,
	)
	return sumMeasures(graph, [general, entertainer])
}
