import {
	type ParsedManifestRow,
	parseManifestRow,
	type ThSourceManifestIssue,
	type ThSourceManifestRow,
} from "./manifest-row"

export type { ThSourceManifestIssue, ThSourceManifestRow } from "./manifest-row"

/** Parsed manifest: the rows the check compares, plus everything it rejected. */
export interface ThSourceManifest {
	readonly rows: readonly ThSourceManifestRow[]
	readonly issues: readonly ThSourceManifestIssue[]
}

/** Line that opens the rows table, so preamble tables are never parsed as rows. */
export const TH_SOURCE_MARKER = "<!-- factory:th-source-rows v1 -->"

const SEPARATOR_PATTERN = /^:?-{3,}:?$/

/**
 * Purpose: Parses the manifest rows that follow {@link TH_SOURCE_MARKER}, validating each row and
 * reporting the ones it rejects instead of dropping them silently.
 * Math: Reads the table between the marker and the next heading or the first non-table line.
 * Units: None.
 * Throws: Never; a malformed file comes back as an issue.
 */
export function parseThSourceManifest(markdown: string): ThSourceManifest {
	const located = locateRows(markdown)
	if (located === undefined) {
		return { rows: [], issues: [{ line: 0, message: `missing marker ${TH_SOURCE_MARKER}` }] }
	}
	return collectRows(located)
}

interface LocatedRows {
	readonly lines: readonly string[]
	readonly start: number
}

interface TableLine {
	readonly cells: readonly string[]
	readonly line: number
}

function locateRows(markdown: string): LocatedRows | undefined {
	const lines = markdown.split("\n")
	const start = lines.indexOf(TH_SOURCE_MARKER)
	return start < 0 ? undefined : { lines, start: start + 1 }
}

function collectRows(located: LocatedRows): ThSourceManifest {
	const rows: ThSourceManifestRow[] = []
	const issues: ThSourceManifestIssue[] = []
	for (const entry of tableLines(located)) {
		const parsed: ParsedManifestRow = parseManifestRow(entry.cells, entry.line)
		if ("issue" in parsed) issues.push(parsed.issue)
		else rows.push(parsed.row)
	}
	return { rows, issues }
}

function tableLines(located: LocatedRows): readonly TableLine[] {
	const table: TableLine[] = []
	for (let index = located.start; index < located.lines.length; index++) {
		const text = located.lines[index] ?? ""
		if (endsTable(text, table.length)) break
		const cells = tableRowCells(text)
		if (cells !== undefined) table.push({ cells, line: index + 1 })
	}
	return table
}

function endsTable(text: string, count: number): boolean {
	if (text.startsWith("## ")) return true
	return count > 0 && !text.startsWith("|")
}

function tableRowCells(text: string): readonly string[] | undefined {
	if (!text.startsWith("|")) return undefined
	const cells = splitCells(text)
	return isHeader(cells) || isSeparator(cells) ? undefined : cells
}

function splitCells(line: string): readonly string[] {
	return line
		.trim()
		.replace(/^\|/, "")
		.replace(/\|$/, "")
		.split("|")
		.map((cell) => cell.trim())
}

function isHeader(cells: readonly string[]): boolean {
	return cells[0] === "Parameter path"
}

function isSeparator(cells: readonly string[]): boolean {
	return cells.every((cell) => SEPARATOR_PATTERN.test(cell))
}
