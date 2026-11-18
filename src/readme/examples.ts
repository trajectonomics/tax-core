import type { ReadmeFence } from "./fences"
import type { ReadmeFinding } from "./findings"

/**
 * A `ts` fence in the README, with its position among all the README's fences.
 */
export interface ReadmeExample {
	/** Index among all README fences, so the fence that follows may hold its stdout. */
	readonly index: number
	readonly fence: ReadmeFence
}

/**
 * The outcome of running one README example with `bun`.
 */
export interface ExampleRun {
	readonly example: ReadmeExample
	/** Process exit code, or null when the process could not start. */
	readonly status: number | null
	readonly stdout: string
	readonly stderr: string
}

const DIAGNOSTIC = /example-(\d+)\.ts\((\d+),\d+\): (error TS\d+: .*)/g

/**
 * Purpose: Lists the README examples a check must typecheck and run.
 * Math: Filters the fences on the `ts` language, keeping each fence's document index.
 * Units: None.
 * Throws: Never.
 */
export function readmeExamples(fences: readonly ReadmeFence[]): readonly ReadmeExample[] {
	return fences
		.map((fence, index) => ({ index, fence }))
		.filter((example) => example.fence.language === "ts")
}

/**
 * Purpose: Turns `tsc` output into findings, so an example that no longer compiles fails the
 * README check at the line a reader would edit.
 * Math: Each `example-<n>.ts(line,col)` diagnostic maps to its fence's README line plus the
 * diagnostic's own line; a failure with no file diagnostic is reported once, at the first
 * example, because only the build itself can explain it.
 * Units: 1-based README line numbers.
 * Throws: Never.
 */
export function typecheckFindings(
	output: string,
	examples: readonly ReadmeExample[],
	status: number | null,
): readonly ReadmeFinding[] {
	const findings: ReadmeFinding[] = []
	for (const match of output.matchAll(DIAGNOSTIC)) {
		const example = examples.find((candidate) => candidate.index === Number(match[1]))
		if (example === undefined) continue
		findings.push({
			line: example.fence.line + Number(match[2]),
			message: `does not typecheck: ${match[3] ?? ""}`,
		})
	}
	if (status === 0 || findings.length > 0) return findings
	return [{ line: examples[0]?.fence.line ?? 1, message: `typecheck failed: ${output.trim()}` }]
}

/**
 * Purpose: Turns one example's run into findings: a non-zero exit, or a printed line that
 * disagrees with the `text` fence beside it.
 * Math: Exit code must be zero; otherwise stdout with trailing newlines trimmed must equal the
 * next fence's content when that fence is a `text` fence.
 * Units: 1-based README line numbers; stdout is compared as raw text, never formatted.
 * Throws: Never.
 */
export function runFindings(
	run: ExampleRun,
	next: ReadmeFence | undefined,
): readonly ReadmeFinding[] {
	if (run.status !== 0) {
		return [
			{
				line: run.example.fence.line,
				message: `example exited ${String(run.status)}: ${run.stderr.trim()}`,
			},
		]
	}
	if (next?.language !== "text") return []
	const stdout = trimTrailingNewlines(run.stdout)
	if (stdout === trimTrailingNewlines(next.content)) return []
	return [
		{
			line: next.line,
			message: `text fence does not match the example's stdout: ${JSON.stringify(stdout)}`,
		},
	]
}

function trimTrailingNewlines(text: string): string {
	return text.replace(/\n+$/, "")
}
