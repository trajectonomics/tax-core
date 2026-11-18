import { parseReadmeFences } from "./fences"

/**
 * A backticked identifier in the README that promises a public API name.
 */
export interface ReadmeClaim {
	/** Identifier token as written inside the backticks. */
	readonly name: string
	/** 1-based line number of the prose line that carries it. */
	readonly line: number
}

const CLAIM_PATTERNS: readonly RegExp[] = [
	/^(?:Th|Us)[A-Z][A-Za-z0-9]*$/,
	/^(?:TH|US)_[A-Z0-9_]+$/,
	/^(?:calculate|emit)[A-Z][A-Za-z0-9]*$/,
	/^Tax[A-Z][A-Za-z0-9]*$/,
]

const IDENTIFIER = /[A-Za-z_][A-Za-z0-9_]*/g
const BACKTICK_RUN = /`+/g

/**
 * Purpose: Collects the public-API names a README's prose promises, so a rename or
 * a removal is caught in the pull request that makes it.
 * Math: Each line outside a fence and outside a blockquote is split into backticked
 * spans, each span into identifier tokens, and a token is a claim when the whole
 * token matches one of four anchored naming patterns.
 * Units: `line` is 1-based; `name` is an identifier, never a field name.
 * Throws: Never.
 */
export function extractReadmeClaims(markdown: string): readonly ReadmeClaim[] {
	const inFence = fenceLines(markdown)
	const claims: ReadmeClaim[] = []
	for (const [index, line] of markdown.split("\n").entries()) {
		if (isProse(line, index + 1, inFence)) claims.push(...lineClaims(line, index + 1))
	}
	return claims
}

function isProse(line: string, lineNumber: number, inFence: ReadonlySet<number>): boolean {
	return !inFence.has(lineNumber) && !line.trimStart().startsWith(">")
}

function lineClaims(line: string, lineNumber: number): readonly ReadmeClaim[] {
	const claims: ReadmeClaim[] = []
	for (const span of backtickedSpans(line)) {
		for (const token of span.match(IDENTIFIER) ?? []) {
			if (CLAIM_PATTERNS.some((pattern) => pattern.test(token))) {
				claims.push({ name: token, line: lineNumber })
			}
		}
	}
	return claims
}

function fenceLines(markdown: string): ReadonlySet<number> {
	const lines = new Set<number>()
	for (const fence of parseReadmeFences(markdown)) {
		const bodyLines = fence.content === "" ? 0 : fence.content.split("\n").length
		for (let line = fence.line; line <= fence.line + bodyLines + 1; line += 1) lines.add(line)
	}
	return lines
}

interface Span {
	readonly text: string
	readonly next: number
}

function backtickedSpans(line: string): readonly string[] {
	const runs = [...line.matchAll(BACKTICK_RUN)]
	const spans: string[] = []
	let index = 0
	while (index < runs.length) {
		const span = spanAt(line, runs, index)
		if (span === null) break
		spans.push(span.text)
		index = span.next
	}
	return spans
}

function spanAt(line: string, runs: readonly RegExpExecArray[], index: number): Span | null {
	const open = runs[index]?.[0] ?? ""
	const close = runs.findIndex((run, candidate) => candidate > index && run[0] === open)
	if (close === -1) return null
	const start = (runs[index]?.index ?? 0) + open.length
	return { text: line.slice(start, runs[close]?.index ?? 0), next: close + 1 }
}
