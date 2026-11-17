/**
 * Modules a transcribed corpus file may import: the test runner, the harness and money helpers.
 *
 * The harness is the only file that reaches the package's calculation entry points, so a corpus
 * case cannot compute its own expectation.
 */
export const TH_CORPUS_IMPORT_ALLOWLIST: readonly string[] = [
	"bun:test",
	"./corpus-harness",
	"../../core/money",
]

/** One corpus file's source, as read from disk. */
export interface ThCorpusFile {
	/** Path used in findings. */
	readonly file: string
	/** Full file text. */
	readonly source: string
}

/** An import a corpus file must not have. */
export interface ThCorpusImportFinding {
	/** Path used in findings. */
	readonly file: string
	/** 1-based line number of the import. */
	readonly line: number
	/** The specifier that is not allowlisted. */
	readonly specifier: string
}

const CORPUS_FILE_PATTERN = /(?:^|\/)corpus-[a-z0-9-]+\.test\.ts$/
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g
const LINE_COMMENT = /^[ \t]*\/\/.*$/gm
const TEMPLATE = /`[^`]*`/g
const STATEMENT_START = "(?:^|[\\n;])[ \\t]*(?:import|export)[ \\t]+(?:type[ \\t]+)?"
const FROM_IMPORT = new RegExp(`${STATEMENT_START}[^"';]*?from[ \\t]*["']([^"']+)["']`, "g")
const BARE_IMPORT = /(?:^|[\n;])[ \t]*import[ \t]*["']([^"']+)["']/g
const DYNAMIC_IMPORT = /(?:^|[^\w$.])import[ \t]*\([ \t\n]*["']([^"']+)["']/g
const DYNAMIC_TEMPLATE = /(?:^|[^\w$.])import[ \t]*\([ \t\n]*`([^`]+)`/g
const REQUIRE_CALL = /(?:^|[^\w$.])require[ \t]*\([ \t\n]*["']([^"']+)["']/g

/**
 * Purpose: Recognizes `corpus-<family>.test.ts`, the only files the guard reads.
 * Math: Path pattern. Units: None. Throws: Never.
 */
export function isThCorpusFile(file: string): boolean {
	return CORPUS_FILE_PATTERN.test(file)
}

/**
 * Purpose: Keeps a transcribed corpus independent of the package under test, so no case computes
 * its own expectation. Only {@link TH_CORPUS_IMPORT_ALLOWLIST} may be imported.
 * Math: Comments and template literals are blanked first, keeping every newline so line numbers
 * survive; then a whole-file scan finds `import`/`export ... from` statements (default, named,
 * namespace, wrapped across lines or after a semicolon), bare imports, `require()` and dynamic
 * `import()` calls with a quoted specifier. A template-literal specifier is scanned on the raw text.
 * This is a textual guard, not a parser: a specifier held in a variable, or a string containing
 * `/*` that lets comment blanking run long, can evade it.
 * Units: None. Throws: Never.
 */
export function findThCorpusImportViolations(
	files: readonly ThCorpusFile[],
): readonly ThCorpusImportFinding[] {
	const findings: ThCorpusImportFinding[] = []
	for (const file of files) {
		if (!isThCorpusFile(file.file)) continue
		findings.push(
			...findIn(file.file, blankNonCode(file.source), [
				FROM_IMPORT,
				BARE_IMPORT,
				DYNAMIC_IMPORT,
				REQUIRE_CALL,
			]),
			...findIn(file.file, file.source, [DYNAMIC_TEMPLATE]),
		)
	}
	return findings.sort((left, right) => left.line - right.line)
}

function blankNonCode(source: string): string {
	const blank = (match: string): string => "\n".repeat(match.split("\n").length - 1)
	return source.replace(BLOCK_COMMENT, blank).replace(TEMPLATE, blank).replace(LINE_COMMENT, "")
}

function findIn(
	fileName: string,
	source: string,
	patterns: readonly RegExp[],
): readonly ThCorpusImportFinding[] {
	const findings: ThCorpusImportFinding[] = []
	for (const pattern of patterns) {
		for (const match of source.matchAll(pattern)) {
			const finding = toFinding(fileName, source, match)
			if (finding !== undefined) findings.push(finding)
		}
	}
	return findings
}

function toFinding(
	fileName: string,
	source: string,
	match: RegExpExecArray,
): ThCorpusImportFinding | undefined {
	const specifier = match[1] ?? ""
	if (TH_CORPUS_IMPORT_ALLOWLIST.includes(specifier)) return undefined
	const offset = match.index + (match[0].startsWith("\n") ? 1 : 0)
	return { file: fileName, line: lineAt(source, offset), specifier }
}

function lineAt(source: string, index: number): number {
	return source.slice(0, index).split("\n").length
}
