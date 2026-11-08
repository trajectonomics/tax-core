import { validateMonetaryAmount } from "../../core/money"
import type { ThExpenseField } from "../types"
import { toSatang } from "../units"
import type { ThLevyGraph } from "./graph"
import { capAt, rateFlooredToBaht, sumMeasures } from "./graph-rates"
import type { ThLevyExpenseChoice } from "./profile-types"

/**
 * One electable expense deduction: its income tally, election, standard rate, and optional cap.
 *
 * Purpose: Describes a single Section 40 expense item for {@link addItemExpense}.
 * Math: No arithmetic; carries the inputs of one standard-or-actual computation.
 * Units: `tally` is a Measure id over integer satang; `rate` is dimensionless; `capSatang` is satang.
 * Throws: Nothing at construction; the emitter validates `actualExpense`.
 * @statute Thailand Revenue Code Sections 42 bis, 42 ter, 43–46.
 */
export interface ThLevyExpenseLine {
	/** Tally Measure holding the item's assessable income in satang. */
	readonly tally: string
	/** Standard-versus-actual election fixed at emit time; omitted means standard. */
	readonly choice?: ThLevyExpenseChoice | undefined
	/** Standard statutory rate ratio (e.g. `0.5` for 50%). */
	readonly rate: number
	/** Diagnostic field reported when the actual expense is invalid. */
	readonly field: ThExpenseField
	/** Optional absolute ceiling in satang. */
	readonly capSatang?: number
}

/**
 * Emits the actual-expense branch: `min(actual, income)`, matching `clampCap(actual, income)`.
 *
 * Math: `min(tally, actualExpense)` in satang.
 * Units: Actual expense is THB major units in, satang Measures out.
 * Throws: TaxValidationError if the actual expense is negative, NaN, or non-finite.
 *
 * @param graph Measure graph being built.
 * @param tally Tally Measure of the item's income.
 * @param choice Election carrying the actual expense.
 * @param field Diagnostic field name.
 * @statute Thailand Revenue Code Sections 42 ter, 43–46; Royal Decree No. 11.
 */
export function addActualExpense(
	graph: ThLevyGraph,
	tally: string,
	choice: ThLevyExpenseChoice | undefined,
	field: ThExpenseField,
): string {
	const actual = choice?.actualExpense ?? 0
	validateMonetaryAmount(actual, field)
	return graph.min(tally, graph.constant(toSatang(actual, field)))
}

/**
 * Emits one Section 40 expense deduction, either actual-capped-at-income or the standard percentage.
 *
 * Math: Actual election gives `min(actual, income)`; otherwise `min(floor(income * rate), cap)`
 * expressed in whole baht, reproducing the calculator's `Math.floor(major * rate)` step.
 * Units: Measures are integer satang; `rate` is dimensionless.
 * Throws: TaxValidationError if the actual expense is invalid.
 *
 * @param graph Measure graph being built.
 * @param line Expense line specification.
 * @statute Thailand Revenue Code Sections 42 bis, 42 ter, 43–46; Royal Decree No. 11.
 */
export function addItemExpense(graph: ThLevyGraph, line: ThLevyExpenseLine): string {
	if (line.choice?.election === "actual") {
		return addActualExpense(graph, line.tally, line.choice, line.field)
	}
	const standard = rateFlooredToBaht(graph, line.tally, line.rate)
	return line.capSatang === undefined ? standard : capAt(graph, standard, line.capSatang)
}

/**
 * Emits and sums a list of expense lines, one per Section 40 item or sub-category.
 *
 * Math: `sum(addItemExpense(line))`; an empty list is zero.
 * Units: Integer satang Measures.
 * Throws: TaxValidationError if an elected actual expense is invalid.
 *
 * @param graph Measure graph being built.
 * @param lines Expense lines for one Section 40 category.
 * @statute Thailand Revenue Code Sections 42 bis, 42 ter, 43–46; Royal Decree No. 11.
 */
export function addExpenseLines(graph: ThLevyGraph, lines: readonly ThLevyExpenseLine[]): string {
	return sumMeasures(
		graph,
		lines.map((line) => addItemExpense(graph, line)),
	)
}
