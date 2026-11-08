import type { TaxBracket } from "../../core/brackets"
import { rateFraction } from "../../core/money/ratio"
import { TH_2026_PARAMETERS } from "../parameters"
import { toSatang } from "../units"
import type { ThLevyGraph } from "./graph"
import { sumMeasures } from "./graph-rates"
import { ThLevyRounding } from "./graph-types"
import { ThLevyMeasureId } from "./measure-ids"

/** Section 48(2) minimum gross tax Measures. */
export interface ThMinimumTaxMeasures {
	/** 0.5% of Section 40(2)–(8) income when it reaches 120,000 THB, else zero. */
	readonly calculated: string
	/** The calculated tax when it exceeds 5,000 THB, else zero. */
	readonly applicable: string
}

/**
 * Emits progressive Section 48(1) tax as one slice per bracket tier.
 *
 * Math: For tier `[lo, hi)` at rate `r`, tax += `round_half_up(min(max(x - lo, 0), hi - lo) * r)`;
 * the unbounded top tier omits the upper cap. Slices match `evaluateBrackets` exactly.
 * Units: Taxable income and tax are integer satang Measures; rates are dimensionless.
 *
 * @param graph Measure graph being built.
 * @param taxable Net taxable income Measure.
 * @param brackets Ordered statutory bracket table in THB major units.
 * @statute Thailand Revenue Code Section 48(1); Royal Decree No. 650.
 */
export function addProgressiveTax(
	graph: ThLevyGraph,
	taxable: string,
	brackets: readonly TaxBracket[] = TH_2026_PARAMETERS.brackets,
): string {
	const taxes: string[] = []
	let lower = 0
	for (const bracket of brackets) {
		const upper = bracket.upTo === null ? null : toSatang(bracket.upTo)
		const excess = graph.max(graph.sub(taxable, graph.constant(lower)), graph.constant(0))
		const slice = upper === null ? excess : graph.min(excess, graph.constant(upper - lower))
		const { num, den } = rateFraction(bracket.rate)
		taxes.push(graph.scale(slice, num, den, ThLevyRounding.HalfUp))
		lower = upper ?? lower
	}
	return sumMeasures(graph, taxes, ThLevyMeasureId.ProgressiveTax)
}

/**
 * Emits the Section 48(2) minimum gross tax and its applicability test.
 *
 * Math: `calculated = gross >= 120,000 ? round_half_up(gross * 0.5%) : 0`;
 * `applicable = calculated > 5,000 ? calculated : 0`.
 * Units: Integer satang Measures; the threshold comparison uses satang.
 *
 * @param graph Measure graph being built.
 * @param grossNonEmployment Section 40(2)–(8) gross income Measure.
 * @statute Thailand Revenue Code Section 48(2).
 */
export function addMinimumGrossTax(
	graph: ThLevyGraph,
	grossNonEmployment: string,
): ThMinimumTaxMeasures {
	const p = TH_2026_PARAMETERS.minimumGrossTax
	const { num, den } = rateFraction(p.rate)
	const computed = graph.scale(grossNonEmployment, num, den, ThLevyRounding.HalfUp)
	const calculated = graph.pick(
		grossNonEmployment,
		graph.constant(toSatang(p.incomeThreshold) - 1),
		computed,
		graph.constant(0),
		ThLevyMeasureId.MinimumGrossTax,
	)
	const applicable = graph.pick(
		calculated,
		graph.constant(toSatang(p.taxThreshold)),
		calculated,
		graph.constant(0),
	)
	return { calculated, applicable }
}

/**
 * Emits the regular-schedule tax: the larger of progressive tax and applicable minimum gross tax.
 *
 * Math: `max(progressive, applicableMinimum)`.
 * Units: Integer satang Measures.
 *
 * @param graph Measure graph being built.
 * @param progressive Progressive bracket tax Measure.
 * @param applicableMinimum Minimum gross tax once the 5,000 THB floor applies.
 * @statute Thailand Revenue Code Sections 48(1)–(2).
 */
export function addRegularTax(
	graph: ThLevyGraph,
	progressive: string,
	applicableMinimum: string,
): string {
	return graph.max(progressive, applicableMinimum, ThLevyMeasureId.RegularTax)
}
