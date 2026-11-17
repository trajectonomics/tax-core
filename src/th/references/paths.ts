/**
 * Collapsed path segment standing for every item of a statutory array table, as in
 * `brackets[*].rate`.
 */
export const TH_ARRAY_SEGMENT = "[*]"

/**
 * Purpose: Lists every statutory path in a parameters object, one path per collapsed array field,
 * so a source manifest can be compared with the parameters in both directions.
 * Math: Depth-first walk; an array appends `[*]` once for all its items, so `brackets[0].rate` and
 * `brackets[7].rate` both yield `brackets[*].rate`.
 * Units: None (paths are strings).
 * Throws: Never for the plain parameter constants; a cyclic object would recurse forever.
 */
export function collectParameterPaths(root: unknown): readonly string[] {
	const found = new Set<string>()
	collectInto(root, "", found)
	return [...found].sort()
}

function collectInto(node: unknown, path: string, found: Set<string>): void {
	if (Array.isArray(node)) {
		for (const item of node) collectInto(item, `${path}${TH_ARRAY_SEGMENT}`, found)
		return
	}
	if (isRecord(node)) {
		for (const [key, value] of Object.entries(node)) {
			collectInto(value, path === "" ? key : `${path}.${key}`, found)
		}
		return
	}
	found.add(path)
}

function isRecord(node: unknown): node is Record<string, unknown> {
	return typeof node === "object" && node !== null
}
