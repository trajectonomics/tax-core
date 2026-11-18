/**
 * A fenced code block found in a Markdown document.
 */
export interface ReadmeFence {
	/** Info string after the opening run, trimmed; empty when the fence names no language. */
	readonly language: string
	/** 1-based line number of the opening fence. */
	readonly line: number
	/** Fence body, with the opener's indentation removed, lines joined with `\n`. */
	readonly content: string
}

interface OpenedFence {
	readonly indent: string
	readonly marker: string
	readonly language: string
}

const OPEN = /^(\s*)(`{3,}|~{3,})(.*)$/
const CLOSE = /^\s*(`{3,}|~{3,})\s*$/

/**
 * Purpose: Splits a Markdown document into its fenced code blocks, so a README
 * example can be typechecked, executed and compared with the fence beside it.
 * Math: Linear scan; a fence opens on a run of three or more backticks or tildes
 * outside a blockquote and closes on the next run of the same character at least
 * as long. An unterminated fence runs to the end of the document.
 * Units: Line numbers are 1-based; `content` is raw text, never evaluated here.
 * Throws: Never.
 */
export function parseReadmeFences(markdown: string): readonly ReadmeFence[] {
	const lines = markdown.split("\n")
	const fences: ReadmeFence[] = []
	let index = 0
	while (index < lines.length) {
		const opened = openFence(lines[index] ?? "")
		if (opened === null) {
			index += 1
			continue
		}
		const start = index
		const body: string[] = []
		index += 1
		while (index < lines.length && !closes(lines[index] ?? "", opened.marker)) {
			body.push(stripIndent(lines[index] ?? "", opened.indent))
			index += 1
		}
		fences.push({ language: opened.language, line: start + 1, content: body.join("\n") })
		index += 1
	}
	return fences
}

function openFence(line: string): OpenedFence | null {
	if (line.trimStart().startsWith(">")) return null
	const match = OPEN.exec(line)
	if (match === null) return null
	return {
		indent: match[1] ?? "",
		marker: match[2] ?? "",
		language: (match[3] ?? "").trim(),
	}
}

function closes(line: string, marker: string): boolean {
	const match = CLOSE.exec(line)
	if (match === null) return false
	const candidate = match[1] ?? ""
	return candidate[0] === marker[0] && candidate.length >= marker.length
}

function stripIndent(line: string, indent: string): string {
	return indent !== "" && line.startsWith(indent) ? line.slice(indent.length) : line
}
