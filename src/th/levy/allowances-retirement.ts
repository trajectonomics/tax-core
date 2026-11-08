import { TH_2026_PARAMETERS } from "../parameters"
import { ThAllowanceField } from "../types"
import { toSatang } from "../units"
import type { ThLevyGraph } from "./graph"
import { rateCapAt, sumMeasures } from "./graph-rates"
import { ThLevyContributionLabel, ThLevyIncomeLabel } from "./labels"
import { ThLevyMeasureId } from "./measure-ids"
import type { ThLevyTallies } from "./tallies"

/** Retirement-cluster and ThaiESG allowance Measure ids. */
export interface ThRetirementAllowanceMeasures {
	/** Combined retirement cluster after the 500,000 THB ceiling. */
	readonly cluster: string
	/** ThaiESG allowance after its percentage and ceiling caps. */
	readonly thaiEsg: string
}

/**
 * Emits the Retirement Cluster and ThaiESG allowances from `funded` tallies.
 *
 * Math: RMF/SSF/PVD/GPF and pension life insurance are capped at `min(income * rate, ceiling)`
 * (PVD/GPF on Section 40(1) wage, the rest on assessable income); NSF at its flat ceiling; the
 * six are then capped at the 500,000 THB cluster ceiling. ThaiESG is capped at
 * `min(assessable * 30%, 300,000)`.
 * Units: Integer satang Measures.
 *
 * @param graph Measure graph being built.
 * @param tallies Income and contribution tally ids.
 * @param assessable Assessable income Measure used as the percentage base.
 * @statute Thailand Revenue Code Section 47; Ministerial Regulations No. 126, 390.
 */
export function addRetirementAllowances(
	graph: ThLevyGraph,
	tallies: ThLevyTallies,
	assessable: string,
): ThRetirementAllowanceMeasures {
	const p = TH_2026_PARAMETERS.allowances.retirementCluster
	const income = tallies.income
	const funded = tallies.contributions
	const wage = income[ThLevyIncomeLabel.Section40_1]
	const rmf = graph.min(
		funded[ThLevyContributionLabel.Rmf],
		rateCapAt(graph, assessable, p.rmf.maxRate, toSatang(p.rmf.ceiling, ThAllowanceField.Rmf)),
	)
	const ssf = graph.min(
		funded[ThLevyContributionLabel.Ssf],
		rateCapAt(graph, assessable, p.ssf.maxRate, toSatang(p.ssf.ceiling, ThAllowanceField.Ssf)),
	)
	const pvd = graph.min(
		funded[ThLevyContributionLabel.Pvd],
		rateCapAt(graph, wage, p.pvd.maxRate, toSatang(p.pvd.ceiling, ThAllowanceField.Pvd)),
	)
	const gpf = graph.min(
		funded[ThLevyContributionLabel.Gpf],
		rateCapAt(graph, wage, p.gpf.maxRate, toSatang(p.gpf.ceiling, ThAllowanceField.Gpf)),
	)
	const nsf = graph.min(
		funded[ThLevyContributionLabel.Nsf],
		graph.constant(toSatang(p.nsf.ceiling, ThAllowanceField.Nsf)),
	)
	const pension = graph.min(
		funded[ThLevyContributionLabel.PensionLifeInsurance],
		rateCapAt(
			graph,
			assessable,
			p.pensionLifeInsurance.maxRate,
			toSatang(p.pensionLifeInsurance.ceiling, ThAllowanceField.PensionLife),
		),
	)
	const individual = sumMeasures(graph, [rmf, ssf, pvd, gpf, nsf, pension])
	const cluster = graph.min(
		individual,
		graph.constant(toSatang(p.combinedCeiling, ThAllowanceField.RetirementCluster)),
		ThLevyMeasureId.RetirementCluster,
	)
	const esg = TH_2026_PARAMETERS.allowances.thaiEsg
	const thaiEsg = graph.min(
		funded[ThLevyContributionLabel.ThaiEsg],
		rateCapAt(graph, assessable, esg.maxRate, toSatang(esg.ceiling, ThAllowanceField.ThaiEsg)),
		ThLevyMeasureId.ThaiEsg,
	)
	return { cluster, thaiEsg }
}
