import { addAllowanceMeasures } from "./allowances"
import { addAssessableMeasures } from "./assessable"
import { addMinimumGrossTax, addProgressiveTax, addRegularTax } from "./brackets"
import { addExpenseMeasures } from "./expenses"
import { ThLevyGraph } from "./graph"
import type { ThLevy, ThLevyMonthDay } from "./graph-types"
import { ThLevyMeasureId } from "./measure-ids"
import type { ThLevyProfile } from "./profile-types"
import { addSection40_4 } from "./regimes"
import { addThLevyTallies } from "./tallies"

/** Default Levy id: Thailand Personal Income Tax for the 2026 tax year. */
const DEFAULT_ID = "th-2026-pit"

/** Default period start: the calendar tax year. */
const DEFAULT_PERIOD: ThLevyMonthDay = { month: 1, day: 1 }

/** Default Settlement: the annual return date following the tax year (Revenue Code Section 56). */
const DEFAULT_SETTLEMENT: ThLevyMonthDay = { month: 3, day: 31 }

/**
 * Emits a Thailand 2026 Personal Income Tax rule set as sim-core Levy data.
 *
 * Purpose: Lets sim-core charge the annual PIT assessment from Flow tallies without importing
 * this package. The profile, elections, and 2026 statutory parameters are frozen at emit time;
 * income and contribution amounts arrive as Flow tallies under the exported labels.
 * Math: `due = max(progressive, minimum gross tax) + final withholding tax
 * - final withholding tax - Section 47 bis credit`, which is the calculator's `netTaxPayable`
 * when no separate sheet, real estate, or other withholding is supplied.
 * Units: Every monetary Measure is integer satang.
 * Throws: TaxValidationError for an invalid profile allowance, donation, actual expense, or rate.
 *
 * @param profile Taxpayer profile and elections fixed at emit time.
 * @statute Thailand Revenue Code Sections 40, 42 bis, 47, 47 bis, 48(1)–(2), 50(2)(g), 56.
 */
export function emitThLevy(profile: ThLevyProfile = {}): ThLevy {
	const graph = new ThLevyGraph()
	const tallies = addThLevyTallies(graph)
	const section40_4 = addSection40_4(graph, tallies, profile.section40_4)
	const assessable = addAssessableMeasures(graph, tallies, section40_4)
	const expenses = addExpenseMeasures(graph, tallies, profile.expenses)
	const allowances = addAllowanceMeasures(graph, tallies, profile, assessable.total, expenses)
	const progressive = addProgressiveTax(graph, allowances.netTaxable)
	const minimum = addMinimumGrossTax(graph, assessable.grossNonEmployment)
	const regular = addRegularTax(graph, progressive, minimum.applicable)
	const total = graph.add(regular, section40_4.finalWithholdingTax, ThLevyMeasureId.TotalTax)
	const credits = graph.add(section40_4.finalWithholdingTax, section40_4.dividendCredit)
	const netPayable = graph.sub(total, credits, ThLevyMeasureId.NetTaxPayable)
	return graph.build(
		profile.levy?.id ?? DEFAULT_ID,
		profile.levy?.period ?? DEFAULT_PERIOD,
		profile.levy?.settlement ?? DEFAULT_SETTLEMENT,
		netPayable,
	)
}
