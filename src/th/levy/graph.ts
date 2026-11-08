import { TaxValidationError } from "../../core/money"
import type {
	ThLevy,
	ThLevyMeasure,
	ThLevyMonthDay,
	ThLevyRounding,
	ThLevyTallyBasis,
} from "./graph-types"
import { ThLevyField } from "./measure-ids"

/** Auto-generated Measure id prefix; explicit audited ids never start with it. */
const AUTO_ID = "auto"

/**
 * Builder for a sim-core `Levy` rule graph.
 *
 * Purpose: The only place that constructs Measures, so the emitted operation set is closed by
 * the {@link ThLevyMeasure} union and every id is unique.
 * Math: Each method appends one Measure; arithmetic is deferred to sim-core's exact evaluator.
 * Units: `const` values are integer satang; `num`/`den` of `scale` are dimensionless integers.
 * Throws: TaxValidationError for a duplicate id, non-safe const, or invalid scale fraction.
 *
 * @statute Thailand Revenue Code Sections 40, 42 bis, 47, 47 bis, 48(1)–(2).
 */
export class ThLevyGraph {
	private readonly list: ThLevyMeasure[] = []
	private readonly ids = new Set<string>()
	private serial = 0

	/** Appends a fixed satang amount; `id` names an audited Measure. */
	constant(value: number, id?: string): string {
		if (!Number.isSafeInteger(value)) {
			throw new TaxValidationError(
				ThLevyField.ConstValue,
				value,
				"Const must be safe integer satang",
			)
		}
		return this.append({ id: this.claim(id), op: "const", value })
	}

	/** Appends a tally over one label and basis. */
	tally(label: string, basis: ThLevyTallyBasis, id?: string): string {
		return this.append({ id: this.claim(id), op: "tally", label, basis })
	}

	/** Appends `a + b`. */
	add(a: string, b: string, id?: string): string {
		return this.append({ id: this.claim(id), op: "add", a, b })
	}

	/** Appends `a - b`. */
	sub(a: string, b: string, id?: string): string {
		return this.append({ id: this.claim(id), op: "sub", a, b })
	}

	/** Appends `min(a, b)`. */
	min(a: string, b: string, id?: string): string {
		return this.append({ id: this.claim(id), op: "min", a, b })
	}

	/** Appends `max(a, b)`. */
	max(a: string, b: string, id?: string): string {
		return this.append({ id: this.claim(id), op: "max", a, b })
	}

	/** Appends `of * num / den`, rounded as `rounding` says. */
	scale(of: string, num: number, den: number, rounding: ThLevyRounding, id?: string): string {
		if (!Number.isSafeInteger(num)) {
			throw new TaxValidationError(ThLevyField.ScaleNum, num, "Scale numerator must be an integer")
		}
		if (!Number.isSafeInteger(den) || den < 1) {
			throw new TaxValidationError(ThLevyField.ScaleDen, den, "Scale denominator must be >= 1")
		}
		return this.append({ id: this.claim(id), op: "scale", of, num, den, rounding })
	}

	/** Appends `then` when `a > b`, otherwise `otherwise`. */
	pick(a: string, b: string, then: string, otherwise: string, id?: string): string {
		return this.append({ id: this.claim(id), op: "pick", a, b, then, else: otherwise })
	}

	/** Finishes the graph as a Levy, checking that every operand and the due id exist. */
	build(id: string, period: ThLevyMonthDay, settlement: ThLevyMonthDay, due: string): ThLevy {
		if (!this.ids.has(due)) {
			throw new TaxValidationError(ThLevyField.MeasureDue, due, "Due must name an emitted Measure")
		}
		for (const measure of this.list) {
			for (const operand of operandsOf(measure)) {
				if (!this.ids.has(operand)) {
					throw new TaxValidationError(
						ThLevyField.MeasureId,
						operand,
						"Operand must name an emitted Measure",
					)
				}
			}
		}
		return { id, period, settlement, measures: [...this.list], due }
	}

	private append(measure: ThLevyMeasure): string {
		this.list.push(measure)
		return measure.id
	}

	private claim(id?: string): string {
		const resolved = id ?? `${AUTO_ID}.${this.serial++}`
		if (this.ids.has(resolved)) {
			throw new TaxValidationError(ThLevyField.MeasureId, resolved, "Duplicate Measure id")
		}
		this.ids.add(resolved)
		return resolved
	}
}

function operandsOf(measure: ThLevyMeasure): readonly string[] {
	switch (measure.op) {
		case "const":
		case "tally":
			return []
		case "scale":
			return [measure.of]
		case "pick":
			return [measure.a, measure.b, measure.then, measure.else]
		default:
			return [measure.a, measure.b]
	}
}
