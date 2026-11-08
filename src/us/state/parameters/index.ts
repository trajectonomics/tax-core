import type { UsStateCode } from "../../types"
import { FLAT_STATES } from "./flat"
import { indexStates } from "./helpers"
import { NO_TAX_STATES } from "./none"
import { PROGRESSIVE_STATES } from "./progressive"
import type { UsStateParameters } from "./types"

/**
 * Consolidated statutory parameter table for all 50 US states and the District of Columbia
 * for Tax Year 2026.
 *
 * @statute State individual income tax statutes; 2026 schedules as published by the
 * state revenue departments and compiled by the Tax Foundation (February 2026).
 */
export const US_2026_STATE_PARAMETERS: Record<UsStateCode, UsStateParameters> = indexStates([
	...NO_TAX_STATES,
	...FLAT_STATES,
	...PROGRESSIVE_STATES,
])

export type { UsStateParameters, UsStateSurtax } from "./types"
export {
	US_STATE_VERIFICATION_LEVELS,
	type UsStateVerification,
} from "./verification"
