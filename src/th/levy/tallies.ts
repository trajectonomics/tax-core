import type { ThLevyGraph } from "./graph"
import { ThLevyTallyBasis } from "./graph-types"
import {
	TH_LEVY_CONTRIBUTION_LABELS,
	TH_LEVY_INCOME_LABELS,
	type ThLevyContributionLabel,
	type ThLevyIncomeLabel,
} from "./labels"

/** Measure ids of every tally a TH 2026 Levy reads, keyed by the label the caller must use. */
export interface ThLevyTallies {
	/** One `gross` tally per assessable income label. */
	readonly income: Readonly<Record<ThLevyIncomeLabel, string>>
	/** One `funded` tally per contribution-driven allowance label. */
	readonly contributions: Readonly<Record<ThLevyContributionLabel, string>>
}

function tallyRecord<K extends string>(
	graph: ThLevyGraph,
	labels: readonly K[],
	basis: ThLevyTallyBasis,
): Readonly<Record<K, string>> {
	const record = {} as Record<K, string>
	for (const label of labels) record[label] = graph.tally(label, basis)
	return record
}

/**
 * Emits one tally Measure per exported label, so a caller can label any subset of Flows.
 *
 * Purpose: Fixes the caller-facing contract before any statutory arithmetic depends on it.
 * Math: No arithmetic; each Measure only reads its label from the matching sim-core tally map.
 * Units: Tallied amounts are integer satang supplied by the caller.
 * Throws: Nothing; the graph validates ids only.
 *
 * @param graph Measure graph being built.
 * @statute Thailand Revenue Code Sections 40(1)–(8), 47.
 */
export function addThLevyTallies(graph: ThLevyGraph): ThLevyTallies {
	return {
		income: tallyRecord(graph, TH_LEVY_INCOME_LABELS, ThLevyTallyBasis.Gross),
		contributions: tallyRecord(graph, TH_LEVY_CONTRIBUTION_LABELS, ThLevyTallyBasis.Funded),
	}
}
