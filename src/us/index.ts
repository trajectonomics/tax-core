/**
 * @trajectonomics/tax/us — United States Federal Individual Income Tax System
 *
 * Implements 2026 statutory federal tax calculation including AGI computation,
 * Above-the-Line Schedule 1 Adjustments, Standard vs Itemized Schedule A Election,
 * 7 statutory ordinary progressive brackets, preferential stacking for LTCG and qualified
 * dividends, Net Investment Income Tax (NIIT), payroll and self-employment tax, AMT,
 * federal credits, and all 50 state income tax systems plus the District of Columbia.
 *
 * @statute IRC § 1 et seq.; state individual income tax statutes for Tax Year 2026.
 */

export * from "./parameters"
export {
	US_2026_STATE_PARAMETERS,
	US_STATE_VERIFICATION_LEVELS,
	type UsStateParameters,
	type UsStateSurtax,
	type UsStateVerification,
} from "./state/parameters"
export { calculateUsTax, us } from "./system"
export * from "./types"
