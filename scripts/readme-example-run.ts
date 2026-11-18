import { spawnSync } from "node:child_process"
import { join } from "node:path"
import type { ReadmeFence } from "../src/readme/fences"
import type { ReadmeFinding } from "../src/readme/findings"

const ROOT = join(import.meta.dir, "..")
const TSC = join(ROOT, "node_modules", ".bin", "tsc")

/** One `ts` example, and its position in the README's fence list. */
export interface Example {
	/** Index among all README fences, so the fence that follows may hold its stdout. */
	readonly index: number
	readonly fence: ReadmeFence
}

/**
 * Purpose: Names the file a README example is written to in the scratch directory.
 * Math: The fence index.
 * Units: None.
 * Throws: Never.
 */
export function exampleFileName(index: number): string {
	return `example-${index}.ts`
}

/**
 * Purpose: Builds the scratch `tsconfig.json` the typecheck runs with: ES2022 syntax, bundler
 * resolution through the package's real `exports` map, strict checks, and Bun's globals.
 * Math: None.
 * Units: None.
 * Throws: Never.
 */
export function exampleTsconfig(examples: readonly Example[]): string {
	return JSON.stringify({
		compilerOptions: {
			target: "ES2022",
			lib: ["ES2022"],
			module: "ESNext",
			moduleResolution: "Bundler",
			strict: true,
			noEmit: true,
			types: ["bun"],
		},
		files: examples.map((example) => exampleFileName(example.index)),
	})
}

/**
 * Purpose: Typechecks every README example against the built declarations in one `tsc` run.
 * Math: Each `example-<n>.ts(line,col)` diagnostic maps back to its fence's line plus the
 * diagnostic's line, so the finding points into README.md.
 * Units: 1-based README line numbers.
 * Throws: Never; a build error with no file diagnostic is reported as a finding.
 */
export function typecheckExamples(
	scratch: string,
	examples: readonly Example[],
): readonly ReadmeFinding[] {
	const result = spawnSync(TSC, ["-p", join(scratch, "tsconfig.json")], { encoding: "utf8" })
	const output = `${result.stderr ?? ""}${result.stdout ?? ""}`
	const findings: ReadmeFinding[] = []
	for (const match of output.matchAll(/example-(\d+)\.ts\((\d+),\d+\): (error TS\d+: .*)/g)) {
		const example = examples.find((candidate) => candidate.index === Number(match[1]))
		if (example === undefined) continue
		findings.push({
			line: example.fence.line + Number(match[2]),
			message: `does not typecheck: ${match[3] ?? ""}`,
		})
	}
	if (findings.length === 0 && result.status !== 0) {
		findings.push({
			line: examples[0]?.fence.line ?? 1,
			message: `typecheck failed: ${output.trim()}`,
		})
	}
	return findings
}

/**
 * Purpose: Runs each example with `bun` against the built runtime and compares its stdout with
 * the `text` fence that follows it in the README.
 * Math: Exit code must be zero; stdout with trailing newlines trimmed must equal the text
 * fence's content, so a parameter change that moves a figure fails here.
 * Units: 1-based README line numbers.
 * Throws: Never.
 */
export function executeExamples(
	scratch: string,
	examples: readonly Example[],
	fences: readonly ReadmeFence[],
): readonly ReadmeFinding[] {
	const findings: ReadmeFinding[] = []
	for (const example of examples) {
		const result = spawnSync("bun", ["run", join(scratch, exampleFileName(example.index))], {
			cwd: scratch,
			encoding: "utf8",
		})
		if (result.status !== 0) {
			findings.push({
				line: example.fence.line,
				message: `example exited ${String(result.status)}: ${(result.stderr ?? "").trim()}`,
			})
			continue
		}
		const expected = fences[example.index + 1]
		if (expected?.language !== "text") continue
		const stdout = trimTrailingNewlines(result.stdout ?? "")
		if (stdout !== trimTrailingNewlines(expected.content)) {
			findings.push({
				line: expected.line,
				message: `text fence does not match the example's stdout: ${JSON.stringify(stdout)}`,
			})
		}
	}
	return findings
}

function trimTrailingNewlines(text: string): string {
	return text.replace(/\n+$/, "")
}
