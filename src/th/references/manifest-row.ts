import { isThSourceResult, type ThSourceResult } from "./results"

/** One parsed manifest row: the parameter path and its result. */
export interface ThSourceManifestRow {
	/** Collapsed parameter path, backticks stripped. */
	readonly path: string
	/** First word of the result column. */
	readonly result: ThSourceResult
	/** 1-based line number in the manifest. */
	readonly line: number
}

/** A row the parser rejected. */
export interface ThSourceManifestIssue {
	/** 1-based line number. */
	readonly line: number
	/** What is wrong with the row. */
	readonly message: string
}

/** A row, or the reason it was rejected. */
export type ParsedManifestRow =
	| { readonly row: ThSourceManifestRow }
	| { readonly issue: ThSourceManifestIssue }

const PATH_PATTERN = /^[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+|\[\*\])+$/
const READ_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const CELL_COUNT = 6

/**
 * Purpose: Validates one manifest table row: six cells, a backticked collapsed parameter path, an
 * ISO read date and a result from the documented vocabulary.
 * Math: Splits the result cell on whitespace and keeps its first word, so a note may follow it.
 * Units: None.
 * Throws: Never; a bad row comes back as an issue with its line number.
 */
export function parseManifestRow(cells: readonly string[], lineNumber: number): ParsedManifestRow {
	if (cells.length !== CELL_COUNT) {
		return {
			issue: {
				line: lineNumber,
				message: `expected ${CELL_COUNT} columns, found ${cells.length}`,
			},
		}
	}
	const rawPath = cells[0] ?? ""
	const path = rawPath.startsWith("`") && rawPath.endsWith("`") ? rawPath.slice(1, -1) : ""
	if (!PATH_PATTERN.test(path)) {
		return { issue: { line: lineNumber, message: `not a collapsed parameter path: ${rawPath}` } }
	}
	const read = cells[4] ?? ""
	if (!READ_PATTERN.test(read)) {
		return { issue: { line: lineNumber, message: `not an ISO read date: ${read}` } }
	}
	const result = (cells[5] ?? "").split(/\s+/)[0] ?? ""
	if (!isThSourceResult(result)) {
		return { issue: { line: lineNumber, message: `unknown result: ${result}` } }
	}
	return { row: { path, result, line: lineNumber } }
}
