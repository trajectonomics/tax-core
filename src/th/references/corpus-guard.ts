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
const IMPORT_PATTERN =
	/(?:^|\n)[ \t]*(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\bfrom\s*)?["']([^"']+)["']/g
const DYNAMIC_IMPORT_PATTERN = /\bimport\s*\(\s*["']([^"']+)["']/g

/**
 * Purpose: Recognizes `corpus-<family>.test.ts`, the only files the guard reads.
 * Math: Path pattern, never a directory listing.
 * Units: None.
 * Throws: Never.
 */
export function isThCorpusFile(file: string): boolean {
	return CORPUS_FILE_PATTERN.test(file)
}

/**
 * Purpose: Keeps a transcribed corpus independent of the package under test. A corpus file may
 * reach `calculateThTax` only through the shared harness, so it cannot compute its own
 * expectations; every other import is a violation.
 * Math: Whole-text scan for `import`/`export ... from "<specifier>"`, bare side-effect imports and
 * dynamic `import("<specifier>")`; a specifier must be in {@link TH_CORPUS_IMPORT_ALLOWLIST}.
 * The scan runs over the whole file, so a statement Biome wrapped across lines is still found.
 * Units: None.
 * Throws: Never.
 */
export function findThCorpusImportViolations(
	files: readonly ThCorpusFile[],
): readonly ThCorpusImportFinding[] {
	const findings: ThCorpusImportFinding[] = []
	for (const file of files) {
		if (!isThCorpusFile(file.file)) continue
		findings.push(
			...scanImports(file, IMPORT_PATTERN),
			...scanImports(file, DYNAMIC_IMPORT_PATTERN),
		)
	}
	return findings
}

function scanImports(file: ThCorpusFile, pattern: RegExp): readonly ThCorpusImportFinding[] {
	const findings: ThCorpusImportFinding[] = []
	for (const match of file.source.matchAll(pattern)) {
		const specifier = match[1] ?? ""
		if (TH_CORPUS_IMPORT_ALLOWLIST.includes(specifier)) continue
		const offset = match.index + (match[0].startsWith("\n") ? 1 : 0)
		findings.push({ file: file.file, line: lineAt(file.source, offset), specifier })
	}
	return findings
}

function lineAt(source: string, index: number): number {
	return source.slice(0, index).split("\n").length
}
