import { addDonationAllowances } from "./allowances-donations"
import { addFixedAllowances } from "./allowances-fixed"
import { addRetirementAllowances } from "./allowances-retirement"
import type { ThLevyGraph } from "./graph"
import { sumMeasures } from "./graph-rates"
import { ThLevyMeasureId } from "./measure-ids"
import type { ThLevyProfile } from "./profile-types"
import type { ThLevyTallies } from "./tallies"

/**
 * Allowance total and the net taxable income left for the bracket schedule.
 *
 * Purpose: Names the two audited outputs of the allowance pipeline.
 * Math: No arithmetic; ids only.
 * Units: The referenced Measures are integer satang.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Section 47.
 */
export interface ThAllowanceMeasures {
	/** Fixed + Retirement Cluster + ThaiESG + donations, after every cap. */
	readonly total: string
	/** Net taxable income in satang, never below zero. */
	readonly netTaxable: string
}

/**
 * Emits every Section 47 allowance and derives net taxable income.
 *
 * Purpose: Orders the fixed, retirement, ThaiESG, and donation rules into one pipeline.
 * Math: `netBefore = max(0, assessable - expenses - fixed - cluster - ThaiESG)`, then donations
 * are capped against that net; `netTaxable = max(0, netBefore - allowed donations)`.
 * Units: Integer satang Measures.
 * Throws: TaxValidationError for an invalid profile allowance or donation amount.
 *
 * @param graph Measure graph being built.
 * @param tallies Income and contribution tally ids.
 * @param profile Emit-time filing status and allowances.
 * @param assessable Assessable income Measure used as the percentage base.
 * @param expenses Total expense deduction Measure.
 * @statute Thailand Revenue Code Section 47.
 */
export function addAllowanceMeasures(
	graph: ThLevyGraph,
	tallies: ThLevyTallies,
	profile: ThLevyProfile,
	assessable: string,
	expenses: string,
): ThAllowanceMeasures {
	const fixed = addFixedAllowances(graph, profile.allowances, profile.filingStatus ?? "single")
	const retirement = addRetirementAllowances(graph, tallies, assessable)
	const nonDonation = sumMeasures(graph, [fixed, retirement.cluster, retirement.thaiEsg])
	const netBefore = graph.max(
		graph.sub(graph.sub(assessable, expenses), nonDonation),
		graph.constant(0),
	)
	const donations = addDonationAllowances(
		graph,
		netBefore,
		profile.allowances?.donation2x,
		profile.allowances?.donation1x,
	)
	const total = graph.add(nonDonation, donations.total, ThLevyMeasureId.AllowancesTotal)
	return { total, netTaxable: donations.netTaxable }
}
