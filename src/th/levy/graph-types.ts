/** Tally bases sim-core's `tally` Measure reads. Units: dimensionless discriminator. */
export const ThLevyTallyBasis = {
	/** Sums income Flows. */
	Gross: "gross",
	/** Sums contribution Flows. */
	Funded: "funded",
} as const

/** Union of {@link ThLevyTallyBasis} values. */
export type ThLevyTallyBasis = (typeof ThLevyTallyBasis)[keyof typeof ThLevyTallyBasis]

/** Rounding modes sim-core's `scale` Measure accepts; `HalfUp` ties go away from zero. */
export const ThLevyRounding = {
	Floor: "floor",
	HalfUp: "halfUp",
	Ceil: "ceil",
} as const

/** Union of {@link ThLevyRounding} values. */
export type ThLevyRounding = (typeof ThLevyRounding)[keyof typeof ThLevyRounding]

/** Recurring calendar date without a year, as sim-core's `MonthDay`. Never February 29. */
export interface ThLevyMonthDay {
	/** Month number, 1 to 12. */
	readonly month: number
	/** Day number within the month. */
	readonly day: number
}

/**
 * One node of the emitted rule graph, restricted to the operation set sim-core evaluates.
 * Units: `value` and Measure totals are integer satang; `num`/`den` are dimensionless.
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
