/**
 * Purpose: Reads the names a built declaration file exports, so a README example
 * can be checked against what the package actually offers.
 * Math: Three shapes as `tsdown` emits them — `export declare <kind> NAME`,
 * `export type NAME`, and an `export { ... }` clause in which `type` modifiers are
 * dropped and `A as B` contributes `B`.
 * Units: None; names are identifiers.
 * Throws: Never.
 */
export function parseDeclarationExports(source: string): readonly string[] {
	const names = new Set<string>()
	for (const match of source.matchAll(DECLARATION)) names.add(match[1] ?? "")
	for (const match of source.matchAll(TYPE_ALIAS)) names.add(match[1] ?? "")
	for (const match of source.matchAll(EXPORT_CLAUSE)) {
		for (const name of clauseNames(match[1] ?? "")) names.add(name)
	}
	names.delete("")
	return [...names]
}

const DECLARATION =
	/^export declare (?:function|const|let|class|enum|interface|type|namespace) ([A-Za-z_$][A-Za-z0-9_$]*)/gm
const TYPE_ALIAS = /^export type ([A-Za-z_$][A-Za-z0-9_$]*)/gm
const EXPORT_CLAUSE = /^export\s*\{([^}]*)\}/gm

function clauseNames(clause: string): readonly string[] {
	const names: string[] = []
	for (const entry of clause.split(",")) {
		const trimmed = entry.trim().replace(/^type\s+/, "")
		if (trimmed === "") continue
		const parts = trimmed.split(/\s+as\s+/)
		names.push((parts[parts.length - 1] ?? "").trim())
	}
	return names
}
