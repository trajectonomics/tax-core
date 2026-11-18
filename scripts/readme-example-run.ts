import { spawnSync } from "node:child_process"
import { join } from "node:path"
import type { ReadmeExample } from "../src/readme/examples"
import { runFindings, typecheckFindings } from "../src/readme/examples"
import type { ReadmeFence } from "../src/readme/fences"
import type { ReadmeFinding } from "../src/readme/findings"

const ROOT = join(import.meta.dir, "..")
const TSC = join(ROOT, "node_modules", ".bin", "tsc")

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
export function exampleTsconfig(examples: readonly ReadmeExample[]): string {
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
 * Math: Spawns `tsc` once over the scratch project and hands its output to the pure
 * `typecheckFindings`.
 * Units: None here; findings carry README line numbers.
 * Throws: Never; a build error is a finding.
 */
export function typecheckExamples(
	scratch: string,
	examples: readonly ReadmeExample[],
): readonly ReadmeFinding[] {
	const result = spawnSync(TSC, ["--pretty", "false", "-p", join(scratch, "tsconfig.json")], {
		encoding: "utf8",
	})
	const output = `${result.stderr ?? ""}${result.stdout ?? ""}`
	return typecheckFindings(output, examples, result.status)
}

/**
 * Purpose: Runs each example with `bun` against the built runtime and hands each result to the
 * pure `runFindings`, which compares it with the `text` fence that follows.
 * Math: One process per example, in the scratch directory.
 * Units: None here; findings carry README line numbers.
 * Throws: Never; a non-zero exit is a finding.
 */
export function executeExamples(
	scratch: string,
	examples: readonly ReadmeExample[],
	fences: readonly ReadmeFence[],
): readonly ReadmeFinding[] {
	const findings: ReadmeFinding[] = []
	for (const example of examples) {
		const result = spawnSync(
			process.execPath,
			["run", join(scratch, exampleFileName(example.index))],
			{
				cwd: scratch,
				encoding: "utf8",
			},
		)
		findings.push(
			...runFindings(
				{
					example,
					status: result.status,
					stdout: result.stdout ?? "",
					stderr: result.stderr ?? "",
				},
				fences[example.index + 1],
			),
		)
	}
	return findings
}
