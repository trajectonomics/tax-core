import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { ReadmeFence } from "../src/readme/fences"
import type { ReadmeFinding } from "../src/readme/findings"
import {
	type Example,
	exampleFileName,
	exampleTsconfig,
	executeExamples,
	typecheckExamples,
} from "./readme-example-run"

const ROOT = join(import.meta.dir, "..")

/**
 * Purpose: Runs every `ts` example in README.md against the built package: typechecks it
 * against the built declarations, executes it with `bun`, and compares its stdout with the
 * `text` fence that follows it.
 * Math: One `tsc` invocation over all examples, then one `bun run` per example. Scratch work
 * happens in a unique temporary directory that is removed in a `finally`; nothing is
 * installed and no network is used.
 * Units: Findings carry 1-based README line numbers.
 * Throws: Only an unexpected filesystem or spawn error; a finding is returned, not thrown.
 */
export function checkReadmeExamples(fences: readonly ReadmeFence[]): readonly ReadmeFinding[] {
	const examples: readonly Example[] = fences
		.map((fence, index) => ({ index, fence }))
		.filter((example) => example.fence.language === "ts")
	if (examples.length === 0) return []
	const scratch = mkdtempSync(join(tmpdir(), "tax-readme-"))
	try {
		prepare(scratch)
		for (const example of examples) {
			writeFileSync(join(scratch, exampleFileName(example.index)), `${example.fence.content}\n`)
		}
		writeFileSync(join(scratch, "tsconfig.json"), exampleTsconfig(examples))
		return [...typecheckExamples(scratch, examples), ...executeExamples(scratch, examples, fences)]
	} finally {
		rmSync(scratch, { recursive: true, force: true })
	}
}

function prepare(scratch: string): void {
	mkdirSync(join(scratch, "node_modules", "@trajectonomics"), { recursive: true })
	symlinkSync(ROOT, join(scratch, "node_modules", "@trajectonomics", "tax"), "dir")
	symlinkSync(join(ROOT, "node_modules", "@types"), join(scratch, "node_modules", "@types"), "dir")
}
