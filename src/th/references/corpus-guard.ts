/** Modules a transcribed corpus file may import: the test runner, the harness and money helpers. */
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
	readonly file: string
	/** 1-based line number of the import. */
	readonly line: number
	/** The specifier that is not allowlisted. */
	readonly specifier: string
}

const CORPUS_FILE_PATTERN = /(?:^|\/)corpus-[a-z0-9-]+\.test\.ts$/
const IMPORT_FROM_PATTERN = /^\s*(?:import|export)\b[^"'`]*?\bfrom\s*["']([^"']+)["']/
const IMPORT_BARE_PATTERN = /^\s*import\s*["']([^"']+)["']/

/** True for `corpus-<family>.test.ts`, the only files the guard reads. */
export function isThCorpusFile(file: string): boolean {
	return CORPUS_FILE_PATTERN.test(file)
}

/**
 * Purpose: Keeps a transcribed corpus independent of the package under test. A corpus file may
 * reach `calculateThTax` only through the shared harness, so it cannot compute its own
 * expectations; every other import is a violation.
 * Math: Line scan of each corpus file for `import`/`export ... from "<specifier>"`; a specifier
 * must be in {@link TH_CORPUS_IMPORT_ALLOWLIST}.
 * Units: None.
 * Throws: Never.
 */
export function findThCorpusImportViolations(
	files: readonly ThCorpusFile[],
): readonly ThCorpusImportFinding[] {
	const findings: ThCorpusImportFinding[] = []
	for (const file of files) {
		if (!isThCorpusFile(file.file)) continue
		file.source.split("\n").forEach((text, index) => {
			const specifier = importSpecifier(text)
			if (specifier !== undefined && !TH_CORPUS_IMPORT_ALLOWLIST.includes(specifier)) {
				findings.push({ file: file.file, line: index + 1, specifier })
			}
		})
	}
	return findings
}

function importSpecifier(line: string): string | undefined {
	const from = IMPORT_FROM_PATTERN.exec(line)
	if (from !== null) return from[1]
	const bare = IMPORT_BARE_PATTERN.exec(line)
	return bare?.[1]
}
