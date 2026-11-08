/**
 * Tally bases sim-core's `tally` Measure reads.
 *
 * Purpose: Distinguishes income Flows from contribution Flows at the tally.
 * Math: No arithmetic; a discriminator only.
 * Units: Dimensionless.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Sections 40(1)–(8) (gross) and 47 (funded).
 */
export const ThLevyTallyBasis = {
	/** Sums income Flows. */
	Gross: "gross",
	/** Sums contribution Flows. */
	Funded: "funded",
} as const

/** Union of {@link ThLevyTallyBasis} values. */
export type ThLevyTallyBasis = (typeof ThLevyTallyBasis)[keyof typeof ThLevyTallyBasis]

/**
 * Rounding modes sim-core's `scale` Measure accepts.
 *
 * Purpose: Names the three rounding policies embedded in emitted Measures.
 * Math: `Floor` rounds down, `Ceil` up, and `HalfUp` sends ties away from zero.
 * Units: Dimensionless.
 * Throws: Nothing.
 * @statute Thailand Revenue Code Sections 47 bis, 48(1), 48(2).
 */
export const ThLevyRounding = {
	Floor: "floor",
	HalfUp: "halfUp",
	Ceil: "ceil",
} as const

/** Union of {@link ThLevyRounding} values. */
export type ThLevyRounding = (typeof ThLevyRounding)[keyof typeof ThLevyRounding]

/**
 * Recurring calendar date without a year, as sim-core's `MonthDay`.
 *
 * Purpose: Fixes the Levy period and settlement dates at emit time.
 * Math: No arithmetic; the date recurs every year and is never February 29.
 * Units: Month number 1–12 and day number; not a timestamp.
 * Throws: Nothing; sim-core's `check()` validates the pair.
 * @statute Thailand Revenue Code Section 56 (annual return filing period).
 */
export interface ThLevyMonthDay {
	/** Month number, 1 to 12. */
	readonly month: number
	/** Day number within the month. */
	readonly day: number
}

/**
 * One node of the emitted rule graph, restricted to the operation set sim-core evaluates.
 *
 * Purpose: Closed union that makes any operation outside sim-core's set a type error.
 * Math: `const`, `tally`, binary arithmetic, exact `scale`, and `pick` — nothing else.
 * Units: `value` and Measure totals are integer satang; `num`/`den` are dimensionless.
 * Throws: Nothing at construction; {@link ThLevyGraph.build} checks operands.
 * @statute Thailand Revenue Code Sections 40, 42 bis, 47, 47 bis, 48(1)–(2).
 */
export type ThLevyMeasure =
	| { readonly id: string; readonly op: "const"; readonly value: number }
	| {
			readonly id: string
			readonly op: "tally"
			readonly label: string
			readonly basis: ThLevyTallyBasis
	  }
	| {
			readonly id: string
			readonly op: "add" | "sub" | "min" | "max"
			readonly a: string
			readonly b: string
	  }
	| {
			readonly id: string
			readonly op: "scale"
			readonly of: string
			readonly num: number
			readonly den: number
			readonly rounding: ThLevyRounding
	  }
	| {
			readonly id: string
			readonly op: "pick"
			readonly a: string
			readonly b: string
			readonly then: string
			readonly else: string
	  }

/**
 * A Thailand Personal Income Tax rule set in sim-core's published `Levy` shape.
 *
 * Purpose: The caller hands this to sim-core, which evaluates it from Flow tallies without
 * importing this package. The taxpayer profile, elections, and 2026 statutory parameters are
 * frozen at emit time, so one Levy describes one taxpayer.
 * Math: Every Measure is exact integer satang arithmetic over the closed sim-core operation set.
 * Units: All monetary Measure values are integer satang (THB minor units).
 * @statute Thailand Revenue Code Sections 40, 42 bis, 47, 47 bis, 48(1)–(2).
 */
export interface ThLevy {
	/** Stable Levy id echoed by sim-core's projection report. */
	readonly id: string
	/** Calendar date on which each Settlement period starts. */
	readonly period: ThLevyMonthDay
	/** First such date strictly after the period's last day. */
	readonly settlement: ThLevyMonthDay
	/** Rule graph, in dependency-friendly emit order. */
	readonly measures: readonly ThLevyMeasure[]
	/** Id of the Measure holding the amount owed before Prepayment. */
	readonly due: string
}
