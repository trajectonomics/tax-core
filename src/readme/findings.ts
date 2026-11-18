import { extractReadmeClaims } from "./claims"
import type { ReadmeFence } from "./fences"
import { parseReadmeFences } from "./fences"
import { parseExampleImports, type ReadmeImport } from "./imports"
import { findReadmeMarkerIssues } from "./markers"

/**
 * The names each entry point of the built package exports.
 */
export interface ReadmeExports {
	readonly root: ReadonlySet<string>
	readonly th: ReadonlySet<string>
	readonly us: ReadonlySet<string>
}

/**
 * One place the README no longer tells the truth about the package.
 */
export interface ReadmeFinding {
	/** 1-based line number in `README.md`. */
	readonly line: number
	/** What is wrong, phrased for a maintainer reading the check's output. */
	readonly message: string
}

const ENTRY_POINTS: ReadonlyMap<string, keyof ReadmeExports> = new Map([
	["@trajectonomics/tax", "root"],
	["@trajectonomics/tax/th", "th"],
	["@trajectonomics/tax/us", "us"],
])

/**
 * Purpose: Decides, from the README text and the built declaration files, every way the page
 * has drifted from the package: a promised API name that is absent, an example importing a
 * name its subpath does not export, or a release marker that breaks ADR 0005's form.
 * Math: Set membership over the three entry points; no AST and no type system here.
 * Units: Line numbers are 1-based; findings are sorted by line.
 * Throws: Never.
 */
export function findReadmeDrift(readme: string, exports: ReadmeExports): readonly ReadmeFinding[] {
	const findings: ReadmeFinding[] = [
		...claimFindings(readme, exports),
		...importFindings(readme, exports),
		...findReadmeMarkerIssues(readme),
	]
	return findings.sort((left, right) => left.line - right.line)
}

function claimFindings(readme: string, exports: ReadmeExports): readonly ReadmeFinding[] {
	const exported = new Set([...exports.root, ...exports.th, ...exports.us])
	return extractReadmeClaims(readme)
		.filter((claim) => !exported.has(claim.name))
		.map((claim) => ({
			line: claim.line,
			message: `\`${claim.name}\` is not exported by any entry point`,
		}))
}

function importFindings(readme: string, exports: ReadmeExports): readonly ReadmeFinding[] {
	return parseReadmeFences(readme)
		.filter((fence) => fence.language === "ts")
		.flatMap((fence) => fenceFindings(fence, exports))
}

function fenceFindings(fence: ReadmeFence, exports: ReadmeExports): readonly ReadmeFinding[] {
	return parseExampleImports(fence.content).flatMap((imported) =>
		importDiff(fence, imported, exports),
	)
}

function importDiff(
	fence: ReadmeFence,
	imported: ReadmeImport,
	exports: ReadmeExports,
): readonly ReadmeFinding[] {
	const entry = ENTRY_POINTS.get(imported.specifier)
	if (entry === undefined) return []
	return imported.names
		.filter((name) => !exports[entry].has(name))
		.map((name) => ({
			line: fence.line + imported.line,
			message: `\`${name}\` is not exported by "${imported.specifier}"`,
		}))
}
