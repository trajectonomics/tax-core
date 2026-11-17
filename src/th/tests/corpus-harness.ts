import type { TaxResult } from "../../core/system"
import { calculateThTax } from "../calculate"
import type { ThBreakdown, ThTaxInput } from "../types"

/** The full result a transcribed corpus case asserts against, in THB major units. */
export type ThCorpusResult = TaxResult<"THB", ThBreakdown>

/**
 * Purpose: The one seam between a transcribed corpus case and the engine. A corpus test supplies
 * only an input and literal expected figures; it never computes an expectation from the package,
 * so a failure means the engine diverged from the statute rather than from itself.
 * Math: Delegates to `calculateThTax` once per case.
 * Units: Inputs and outputs in THB major units, as {@link ThTaxInput} documents.
 * Throws: Whatever `calculateThTax` throws for an invalid input; a corpus case uses valid input.
 */
export function runThaiCorpusCase(input: ThTaxInput): ThCorpusResult {
	return calculateThTax(input)
}
