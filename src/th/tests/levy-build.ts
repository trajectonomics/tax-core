import { calculateThTax } from "../calculate"
import { ThLevyGraph } from "../levy/graph"
import type { ThLevy } from "../levy/graph-types"
import type { ThLevyProfile } from "../levy/profile-types"
import { addThLevyTallies, type ThLevyTallies } from "../levy/tallies"
import type { ThBreakdown } from "../types"
import { toSatang } from "../units"
import { thTaxInputFor } from "./levy-input"
import type { ThSatangTotals } from "./levy-satang"
import { levyValues, simTallies } from "./levy-sim"

const EMPTY = { gross: new Map<string, number>(), funded: new Map<string, number>() }

/** One evaluated Levy: every Measure value plus the due Measure's value. */
export interface ThLevyRun {
	/** Measure values by id, in integer satang. */
	readonly values: ReadonlyMap<string, number>
	/** Value of the Measure the builder returned. */
	readonly due: number
}

/** Applies one measure emitter to a single const amount and evaluates the result. */
export function measureOf(
	apply: (graph: ThLevyGraph, input: string) => string,
	amount: number,
): number {
	const graph = new ThLevyGraph()
	const input = graph.constant(toSatang(amount))
	const output = apply(graph, input)
	const levy = graph.build("t", { month: 1, day: 1 }, { month: 3, day: 31 }, output)
	const value = levyValues(levy, EMPTY).get(output)
	if (value === undefined) throw new Error(`Missing measure ${output}`)
	return value
}

/**
 * Runs one measure emitter against Flow tallies and evaluates the resulting Levy.
 *
 * Purpose: Gives each rule test the same graph/tally/evaluate plumbing.
 * Units: Totals and returned values are integer satang.
 * @statute Jurisdiction-neutral test helper; no statutory citation.
 */
export function runLevy(
	income: ThSatangTotals,
	contributions: ThSatangTotals,
	build: (graph: ThLevyGraph, tallies: ThLevyTallies) => string,
): ThLevyRun {
	const graph = new ThLevyGraph()
	const tallies = addThLevyTallies(graph)
	const due = build(graph, tallies)
	const levy = graph.build("t", { month: 1, day: 1 }, { month: 3, day: 31 }, due)
	const values = levyValues(levy, simTallies(income, contributions))
	const value = values.get(due)
	if (value === undefined) throw new Error(`Missing measure ${due}`)
	return { values, due: value }
}

/** Runs the calculator on the same profile and tallies. */
export function breakdownOf(
	profile: ThLevyProfile,
	income: ThSatangTotals,
	contributions: ThSatangTotals = new Map(),
): ThBreakdown {
	return calculateThTax(thTaxInputFor(profile, income, contributions)).breakdown
}

/** Reads one Measure from an already-built Levy evaluated with no Flows. */
export function measureValue(levy: ThLevy, id: string): number {
	const value = levyValues(levy, EMPTY).get(id)
	if (value === undefined) throw new Error(`Missing measure ${id}`)
	return value
}
