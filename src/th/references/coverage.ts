import type { ThSourceManifestRow } from "./manifest"

/** Why a path and the manifest disagree. */
export type ThSourceCoverageReason =
	| "missing-row"
	| "extra-row"
	| "duplicate-row"
	| "stale-exemption"

/** One disagreement between the parameters, the exemption list and the manifest. */
export interface ThSourceCoverageFinding {
	/** Collapsed parameter path, or the row's path when it names none. */
	readonly path: string
	readonly reason: ThSourceCoverageReason
}

/**
 * Purpose: Compares the parameter paths, the exempt paths and the manifest rows both ways, so a
 * new parameter cannot be added without a source row and a deleted parameter cannot leave one.
 * Math: required = parameter paths minus exempt paths; each required path needs exactly one row,
 * and each row must name a required path. An exempt path that no longer exists is stale.
 * Units: None.
 * Throws: Never.
 */
export function compareThSourceCoverage(
	parameterPaths: readonly string[],
	exemptPaths: readonly string[],
	rows: readonly ThSourceManifestRow[],
): readonly ThSourceCoverageFinding[] {
	const required = new Set(parameterPaths.filter((path) => !exemptPaths.includes(path)))
	const seen = new Set<string>()
	return [
		...scanRows(required, rows, seen),
		...missingRows(required, seen),
		...staleExemptions(parameterPaths, exemptPaths),
	]
}

function scanRows(
	required: ReadonlySet<string>,
	rows: readonly ThSourceManifestRow[],
	seen: Set<string>,
): readonly ThSourceCoverageFinding[] {
	const findings: ThSourceCoverageFinding[] = []
	for (const row of rows) {
		if (!required.has(row.path)) findings.push({ path: row.path, reason: "extra-row" })
		if (seen.has(row.path)) findings.push({ path: row.path, reason: "duplicate-row" })
		seen.add(row.path)
	}
	return findings
}

function missingRows(
	required: ReadonlySet<string>,
	seen: ReadonlySet<string>,
): readonly ThSourceCoverageFinding[] {
	return [...required]
		.filter((path) => !seen.has(path))
		.map((path) => ({ path, reason: "missing-row" }))
}

function staleExemptions(
	parameterPaths: readonly string[],
	exemptPaths: readonly string[],
): readonly ThSourceCoverageFinding[] {
	return exemptPaths
		.filter((path) => !parameterPaths.includes(path))
		.map((path) => ({ path, reason: "stale-exemption" }))
}
