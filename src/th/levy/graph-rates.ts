import { rateFraction } from "../../core/money/ratio"
import type { ThLevyGraph } from "./graph"
import { ThLevyRounding } from "./graph-types"

/**
 * Emits a satang sum of Measure ids; an empty list becomes a zero const.
 *
 * Purpose: Keeps statutory totals readable without a fold at every call site.
 * Math: Left-associative `add`; empty input yields `const 0`. When `name` is given, a final
 * zero addition exposes the running total under an audited id (sim-core has no rename op).
 * Units: Integer satang in and out.
 * Throws: TaxValidationError if the graph rejects an id or constant.
 * @statute Jurisdiction-neutral graph helper; no statutory citation.
 */
export function sumMeasures(graph: ThLevyGraph, ids: readonly string[], name?: string): string {
	const [first, ...rest] = ids
	let total = first ?? graph.constant(0)
	for (const id of rest) total = graph.add(total, id)
	return name === undefined ? total : graph.add(total, graph.constant(0), name)
}

/**
 * Emits `of` rounded down to a whole baht while keeping satang units.
 *
 * Purpose: Reproduces the calculator's whole-baht `Math.floor` steps exactly.
 * Math: `100 * floor(x / 100)` via two integer scales.
 * Units: Integer satang in and out.
 * Throws: Nothing; `of` must name an emitted Measure.
 * @statute Thailand Revenue Code Section 42 bis (whole-baht expense rounding).
 */
export function flooredToBaht(graph: ThLevyGraph, of: string): string {
	return graph.scale(graph.scale(of, 1, 100, ThLevyRounding.Floor), 100, 1, ThLevyRounding.Floor)
}

/**
 * Emits `floor(income * rate)`, rounded down to a whole baht.
 *
 * Purpose: Mirrors the calculator's `Math.floor(major * rate)` expense deduction.
 * Math: `100 * floor(x * num / (den * 100))`.
 * Units: Integer satang in and out; `rate` is dimensionless.
 * Throws: TaxValidationError if `rate` is outside [0, 1].
 * @statute Thailand Revenue Code Sections 42 bis, 42 ter, 43–46.
 */
export function rateFlooredToBaht(graph: ThLevyGraph, of: string, rate: number): string {
	const { num, den } = rateFraction(rate)
	return flooredToBaht(graph, graph.scale(of, num, den, ThLevyRounding.Floor))
}

/**
 * Emits `min(of, ceiling)`, the shape `clampCap` uses for an absolute statutory ceiling.
 *
 * Purpose: Reproduces the absolute-ceiling branch of `clampCap`.
 * Math: `min(x, ceiling)`.
 * Units: Integer satang in and out.
 * Throws: TaxValidationError if the ceiling is not safe integer satang.
 * @statute Thailand Revenue Code Section 47 (allowance ceilings).
 */
export function capAt(graph: ThLevyGraph, of: string, ceilingSatang: number): string {
	return graph.min(of, graph.constant(ceilingSatang))
}

/**
 * Emits `min(of * rate, ceiling)` with half-up satang rounding, the shape `resolveCap` computes.
 *
 * Purpose: Percentage-of-income retirement caps round to the nearest satang, not to a baht.
 * Math: `min(round_half_up(x * num / den), ceiling)`.
 * Units: Integer satang in and out; `rate` is dimensionless.
 * Throws: TaxValidationError if `rate` is outside [0, 1] or the ceiling is invalid.
 * @statute Thailand Revenue Code Section 47; Ministerial Regulations No. 126, 390.
 */
export function rateCapAt(
	graph: ThLevyGraph,
	of: string,
	rate: number,
	ceilingSatang: number,
): string {
	const { num, den } = rateFraction(rate)
	return capAt(graph, graph.scale(of, num, den, ThLevyRounding.HalfUp), ceilingSatang)
}
