/**
 * One import declaration found in a README example.
 */
export interface ReadmeImport {
	/** Module specifier exactly as written. */
	readonly specifier: string
	/** Names the declaration imports; `default` for a default import, none for a namespace. */
	readonly names: readonly string[]
	/** 1-based line number within the example source. */
	readonly line: number
}

const WITH_BINDINGS = /^import\s+([^'"]*?)\s*from\s*["']([^"']+)["']/gm
const BARE = /^import\s*["']([^"']+)["']/gm

/**
 * Purpose: Reads an example's import declarations, so each imported name can be
 * checked against the entry point the example resolves through.
 * Math: One pass for `import ... from "specifier"` and one for the bare
 * `import "specifier"` form; a clause contributes `default` when it names a
 * default binding, and the source name of each named binding (`a as b` imports `a`).
 * Units: `line` is 1-based within `source`.
 * Throws: Never.
 */
export function parseExampleImports(source: string): readonly ReadmeImport[] {
	const found: ReadmeImport[] = []
	for (const match of source.matchAll(WITH_BINDINGS)) {
		const clause = match[1] ?? ""
		const specifier = match[2] ?? ""
		found.push({ specifier, names: bindingNames(clause), line: lineOf(source, match.index) })
	}
	for (const match of source.matchAll(BARE)) {
		found.push({ specifier: match[1] ?? "", names: [], line: lineOf(source, match.index) })
	}
	return found.sort((left, right) => left.line - right.line)
}

function lineOf(source: string, index: number): number {
	return source.slice(0, index).split("\n").length
}

function bindingNames(clause: string): readonly string[] {
	const trimmed = clause.trim().replace(/^type\s+/, "")
	const brace = trimmed.indexOf("{")
	const head = brace === -1 ? trimmed : trimmed.slice(0, brace)
	const defaultName = head.replace(/,$/, "").trim()
	const names: string[] = []
	if (defaultName !== "" && !defaultName.startsWith("*")) names.push("default")
	if (brace !== -1) names.push(...namedNames(trimmed.slice(brace + 1, trimmed.lastIndexOf("}"))))
	return names
}

function namedNames(list: string): readonly string[] {
	return list
		.split(",")
		.map((entry) => entry.trim().replace(/^type\s+/, ""))
		.filter((entry) => entry !== "")
		.map((entry) => (entry.split(/\s+as\s+/)[0] ?? "").trim())
}
