import type { Tallies } from "@trajectonomics/sim"
import { evaluateMeasures } from "@trajectonomics/sim"
import type { ThLevy } from "../levy/graph-types"

/**
 * Evaluates an emitted Levy against satang tallies with sim-core's own evaluator.
 *
 * Purpose: The golden corpus must observe the Levy exactly as sim-core will.
 * Math: Delegates to `evaluateMeasures` with the 2026 settlement date (no growth Measures exist).
 * Units: Tallies are integer satang; returned Measure values are integer satang.
 * Throws: Error if sim-core reports a problem instead of values.
 * @statute Jurisdiction-neutral test harness; no statutory citation.
 */
export function levyValues(levy: ThLevy, tallies: Tallies): ReadonlyMap<string, number> {
	const result = evaluateMeasures(levy, tallies, { date: "2026-12-31", inflation: 0 })
	if (!result.ok) {
		throw new Error(`Levy evaluation failed: ${JSON.stringify(result.problem)}`)
	}
	return result.values
}

/**
 * Builds sim-core tallies from the same satang totals the producer labels its Flows with.
 *
 * Units: Totals and the resulting maps are integer satang.
 * @statute Jurisdiction-neutral test harness; no statutory citation.
 */
export function simTallies(
	incomeTotals: ReadonlyMap<string, number>,
	contributions: ReadonlyMap<string, number> = new Map(),
): Tallies {
	return { gross: new Map(incomeTotals), funded: new Map(contributions) }
}
