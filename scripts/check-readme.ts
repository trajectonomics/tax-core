import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { parseDeclarationExports } from "../src/readme/declarations"
import { parseReadmeFences } from "../src/readme/fences"
import type { ReadmeExports, ReadmeFinding } from "../src/readme/findings"
import { findReadmeDrift } from "../src/readme/findings"
import { checkReadmeExamples } from "./readme-examples"

const ROOT = join(import.meta.dir, "..")
const README_PATH = join(ROOT, "README.md")
const DECLARATIONS: Readonly<Record<keyof ReadmeExports, string>> = {
	root: join(ROOT, "dist", "index.d.mts"),
	th: join(ROOT, "dist", "th", "index.d.mts"),
	us: join(ROOT, "dist", "us", "index.d.mts"),
}

/**
 * Purpose: Enters the README check that `bun run check` runs after the build.
 * Math: Reads README.md and the three built declaration files, asks `findReadmeDrift` what
 * has drifted and `checkReadmeExamples` whether each example typechecks, runs and prints
 * what the page says, then prints one line per finding and exits non-zero on any.
 * Units: Line numbers are 1-based. No network access.
 * Throws: Never; a missing build is reported as a finding-shaped failure.
 */
function main(): number {
	const sources = readDeclarations()
	if (sources === null) {
		console.error("README: dist declarations are missing; run `bun run build` first.")
		console.error("\nFAILURE: the README check needs a build.")
		return 1
	}
	const readme = readFileSync(README_PATH, "utf-8")
	const fences = parseReadmeFences(readme)
	const findings: ReadmeFinding[] = [
		...findReadmeDrift(readme, asExports(sources)),
		...checkReadmeExamples(fences),
	].sort((left, right) => left.line - right.line)
	for (const finding of findings) console.error(`README ${finding.line}: ${finding.message}`)
	if (findings.length > 0) {
		console.error(`\nFAILURE: ${findings.length} README finding(s).`)
		return 1
	}
	console.log(`PASS: ${fences.length} README fence(s) agree with the built package.\n`)
	return 0
}

function readDeclarations(): Record<keyof ReadmeExports, string> | null {
	for (const entry of ["root", "th", "us"] as const) {
		if (!existsSync(DECLARATIONS[entry])) return null
	}
	return {
		root: readFileSync(DECLARATIONS.root, "utf-8"),
		th: readFileSync(DECLARATIONS.th, "utf-8"),
		us: readFileSync(DECLARATIONS.us, "utf-8"),
	}
}

function asExports(sources: Readonly<Record<keyof ReadmeExports, string>>): ReadmeExports {
	return {
		root: new Set(parseDeclarationExports(sources.root)),
		th: new Set(parseDeclarationExports(sources.th)),
		us: new Set(parseDeclarationExports(sources.us)),
	}
}

process.exit(main())
