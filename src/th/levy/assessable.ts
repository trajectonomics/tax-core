import type { ThLevyGraph } from "./graph"
import { sumMeasures } from "./graph-rates"
import { ThLevyIncomeLabel } from "./labels"
import { ThLevyMeasureId } from "./measure-ids"
import type { ThSection40_4Measures } from "./regimes"
import type { ThLevyTallies } from "./tallies"

/** Assessable income Measures: the Section 40 total and the Section 48(2) eligible subtotal. */
export interface ThAssessableMeasures {
	/** Section 40(1)–(8) assessable income after the Section 40(4) split. */
	readonly total: string
	/** Section 40(2)–(8) gross income, the Section 48(2) minimum-tax base. */
	readonly grossNonEmployment: string
}

/**
 * Emits the Section 40 assessable income totals.
 *
 * Math: total = 40(1) + 40(2) + 40(3) + 40(4) assessable + 40(5) + 40(6) + 40(7) + 40(8);
 * gross non-employment = the same sum without Section 40(1).
 * Units: Integer satang Measures.
 *
 * @param graph Measure graph being built.
 * @param tallies Income tally ids.
 * @param section40_4 Resolved Section 40(4) assessable Measure.
 * @statute Thailand Revenue Code Sections 40(1)–(8), 48(2).
 */
export function addAssessableMeasures(
	graph: ThLevyGraph,
	tallies: ThLevyTallies,
	section40_4: ThSection40_4Measures,
): ThAssessableMeasures {
	const income = tallies.income
	const rental = sumMeasures(graph, [
		income[ThLevyIncomeLabel.Section40_5Building],
		income[ThLevyIncomeLabel.Section40_5AgriculturalLand],
		income[ThLevyIncomeLabel.Section40_5NonAgriculturalLand],
		income[ThLevyIncomeLabel.Section40_5Vehicles],
		income[ThLevyIncomeLabel.Section40_5Other],
	])
	const professions = sumMeasures(graph, [
		income[ThLevyIncomeLabel.Section40_6Medical],
		income[ThLevyIncomeLabel.Section40_6Law],
		income[ThLevyIncomeLabel.Section40_6Engineering],
		income[ThLevyIncomeLabel.Section40_6Architecture],
		income[ThLevyIncomeLabel.Section40_6Accounting],
		income[ThLevyIncomeLabel.Section40_6FineArts],
		income[ThLevyIncomeLabel.Section40_6Other],
	])
	const business = sumMeasures(graph, [
		income[ThLevyIncomeLabel.Section40_8General],
		income[ThLevyIncomeLabel.Section40_8Entertainer],
	])
	const employment = income[ThLevyIncomeLabel.Section40_1]
	const nonEmployment = [
		income[ThLevyIncomeLabel.Section40_2],
		income[ThLevyIncomeLabel.Section40_3],
		section40_4.assessable,
		rental,
		professions,
		income[ThLevyIncomeLabel.Section40_7],
		business,
	]
	const total = sumMeasures(graph, [employment, ...nonEmployment], ThLevyMeasureId.AssessableTotal)
	const grossNonEmployment = sumMeasures(graph, nonEmployment, ThLevyMeasureId.GrossNonEmployment)
	return { total, grossNonEmployment }
}
