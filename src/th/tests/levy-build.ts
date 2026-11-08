import { ThLevyGraph } from "../levy/graph"
import type { ThLevy } from "../levy/graph-types"
import { toSatang } from "../units"
import { levyValues } from "./levy-sim"

const EMPTY = { gross: new Map<string, number>(), funded: new Map<string, number>() }

/** Reads one Measure from an already-built Levy evaluated with no Flows. */
export function measureValue(levy: ThLevy, id: string): number {
	const value = levyValues(levy, EMPTY).get(id)
	if (value === undefined) throw new Error(`Missing measure ${id}`)
	return value
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
	return measureValue(levy, output)
}
