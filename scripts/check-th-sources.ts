import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { TH_2026_PARAMETERS } from "../src/th/parameters"
import { findThCorpusImportViolations, isThCorpusFile } from "../src/th/references/corpus-guard"
import { compareThSourceCoverage } from "../src/th/references/coverage"
import { TH_SOURCE_EXEMPT_PATHS } from "../src/th/references/exemptions"
import { parseThSourceManifest } from "../src/th/references/manifest"
import { collectParameterPaths } from "../src/th/references/paths"

const HELP = `Usage: bun run check:th-sources [--help]

Checks references/th/SOURCES.md against TH_2026_PARAMETERS and the transcribed corpus.

One line per finding, then a FAILURE line and exit code 1:
  MANIFEST <line>: <what is wrong with the row>
  SOURCES <path>: <missing-row|extra-row|duplicate-row|stale-exemption>
  CORPUS <file>:<line>: forbidden import "<specifier>"

A corpus file may import only bun:test, ./corpus-harness and ../../core/money.`

const MANIFEST_PATH = join(import.meta.dir, "../references/th/SOURCES.md")
const CORPUS_DIR = join(import.meta.dir, "../src/th/tests")

/**
 * Purpose: Enters the Thai source check that `bun run check` runs after the hardcoded-string check.
 * Math: Reads the manifest and the corpus files, calls the pure functions under
 * `src/th/references/`, prints each finding and exits non-zero on any.
 * Units: None.
 * Throws: Never; an unreadable file is a thrown `readFileSync` error and a failed run.
 */
function main(argv: readonly string[]): number {
	if (argv.includes("--help") || argv.includes("-h")) {
		console.log(HELP)
		return 0
	}
	const manifest = parseThSourceManifest(readFileSync(MANIFEST_PATH, "utf-8"))
	const coverage = compareThSourceCoverage(
		collectParameterPaths(TH_2026_PARAMETERS),
		TH_SOURCE_EXEMPT_PATHS,
		manifest.rows,
	)
	const corpus = findThCorpusImportViolations(readCorpusFiles())
	const failures = [
		...manifest.issues.map((issue) => `MANIFEST ${issue.line}: ${issue.message}`),
		...coverage.map((finding) => `SOURCES ${finding.path}: ${finding.reason}`),
		...corpus.map(
			(finding) =>
				`CORPUS ${finding.file}:${finding.line}: forbidden import "${finding.specifier}"`,
		),
	]
	for (const failure of failures) console.error(failure)
	if (failures.length > 0) {
		console.error(`\nFAILURE: ${failures.length} Thai source finding(s).`)
		return 1
	}
	console.log(`PASS: ${manifest.rows.length} Thai source rows cover every parameter path.\n`)
	return 0
}

function readCorpusFiles(): readonly { file: string; source: string }[] {
	return readdirSync(CORPUS_DIR)
		.filter((name) => isThCorpusFile(name))
		.map((name) => ({ file: name, source: readFileSync(join(CORPUS_DIR, name), "utf-8") }))
}

process.exit(main(process.argv.slice(2)))
