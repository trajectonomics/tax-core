import { multiplySafeInteger, validateMonetaryAmount } from "../../core/money"
import { TH_2026_PARAMETERS } from "../parameters"
import { ThAllowanceField } from "../types"
import { toSatang } from "../units"
import type { ThLevyGraph } from "./graph"
import { rateFlooredToBaht } from "./graph-rates"
import { ThLevyMeasureId } from "./measure-ids"

/**
 * Donation allowance total and the net taxable income it leaves.
 *
 * Purpose: Names the donation total and the bracket schedule's input.
 * Math: No arithmetic; ids only.
 * Units: The referenced Measures are integer satang.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Section 47(7); Royal Decrees No. 428, 558.
 */
export interface ThDonationAllowanceMeasures {
	/** Allowed 2x plus 1x donations. */
	readonly total: string
	/** `max(0, net after donations)`, the bracket schedule's input. */
	readonly netTaxable: string
}

/**
 * Emits the Section 47(7) donation allowances against the net income before donations.
 *
 * Purpose: Reproduces the 2x-then-1x donation caps as Measures.
 * Math: 2x donations are doubled, then `min(doubled, floor(net * 10%))`; 1x donations are
 * `min(amount, floor(remaining net * 10%))`. Taxable income is `max(0, remaining - 1x allowed)`.
 * Units: Profile amounts are THB major units; Measures are integer satang.
 * Throws: TaxValidationError if a donation amount is invalid or the doubled amount overflows.
 *
 * @param graph Measure graph being built.
 * @param netBefore `max(0, assessable - expenses - non-donation allowances)` Measure.
 * @param requested2x Requested 2x-qualified donation in THB.
 * @param requested1x Requested general donation in THB.
 * @statute Thailand Revenue Code Section 47(7); Royal Decrees No. 428, 558.
 */
export function addDonationAllowances(
	graph: ThLevyGraph,
	netBefore: string,
	requested2x: number | undefined,
	requested1x: number | undefined,
): ThDonationAllowanceMeasures {
	const p = TH_2026_PARAMETERS.allowances.donations
	const raw2x = requested2x ?? 0
	const raw1x = requested1x ?? 0
	validateMonetaryAmount(raw2x, ThAllowanceField.Donation2x)
	validateMonetaryAmount(raw1x, ThAllowanceField.Donation1x)
	const doubled = multiplySafeInteger(
		toSatang(raw2x, ThAllowanceField.Donation2x),
		p.donation2xMultiplier,
		ThAllowanceField.Donation2x,
	)
	const net = graph.max(netBefore, graph.constant(0))
	const cap2x = rateFlooredToBaht(graph, net, p.donation2xMaxRate)
	const allowed2x = graph.min(graph.constant(doubled), cap2x)
	const remaining = graph.max(graph.sub(net, allowed2x), graph.constant(0))
	const cap1x = rateFlooredToBaht(graph, remaining, p.donation1xMaxRate)
	const allowed1x = graph.min(graph.constant(toSatang(raw1x, ThAllowanceField.Donation1x)), cap1x)
	const total = graph.add(allowed2x, allowed1x, ThLevyMeasureId.Donations)
	const netTaxable = graph.max(
		graph.sub(remaining, allowed1x),
		graph.constant(0),
		ThLevyMeasureId.NetTaxableIncome,
	)
	return { total, netTaxable }
}
