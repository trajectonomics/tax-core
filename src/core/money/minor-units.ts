import {
	MoneyValidationError,
	fromMinorUnits as sharedFromMinorUnits,
	toMinorUnits as sharedToMinorUnits,
} from "@trajectonomics/money"
import { CURRENCY_PRECISION, type TaxSupportedCurrency } from "./currency"
import { TaxValidationError } from "./errors"
import type { ValidateAmountOptions } from "./validate"

/**
 * Maps a shared-package failure onto this package's public error class.
 *
 * Purpose: `@trajectonomics/money` throws `MoneyValidationError`; callers of `@trajectonomics/tax`
 * are promised `TaxValidationError`. Rebuilding the error from its parts keeps `name`, message
 * shape, `field`, `value` and `reason` identical, so extraction stays invisible to consumers.
 * Math: none; a field-for-field copy.
 * Units: none; the error carries whatever the conversion validated (major units, minor units).
 * Throws: the original error unchanged when it is not a money validation failure.
 */
function toTaxValidationError(error: unknown): TaxValidationError {
	if (error instanceof MoneyValidationError) {
		return new TaxValidationError(error.field, error.value, error.reason)
	}
	throw error
}

/**
 * Converts a major-unit monetary amount to integer minor units (satang/cent).
 *
 * Purpose: Public conversion boundary; delegates the arithmetic and validation to
 * `@trajectonomics/money`, so this package and the ledger share one implementation.
 * Math: Decimal string expansion with round-half-away-from-zero inside the shared package.
 * `CURRENCY_PRECISION[currency]` supplies `digits`; no currency table crosses the dependency edge.
 * Units: Input is major currency unit (e.g. THB, USD); output is integer minor units (e.g. satang, cents).
 *
 * @param amount Amount in major units.
 * @param currency Supported statutory currency (THB or USD).
 * @param field Diagnostic field name.
 * @param options Validation options (e.g. allowNegative for refund balances).
 * @returns Integer minor units.
 * @throws {TaxValidationError} if amount is NaN, infinite, negative without `allowNegative`, or the result leaves the safe integer range.
 * @example toMinorUnits(1.14, "USD") // 114 (114 cents)
 */
export function toMinorUnits(
	amount: number,
	currency: TaxSupportedCurrency,
	field = "amount",
	options?: ValidateAmountOptions,
): number {
	try {
		return sharedToMinorUnits(amount, CURRENCY_PRECISION[currency], field, options)
	} catch (error) {
		throw toTaxValidationError(error)
	}
}

/**
 * Converts an integer minor unit amount back to major currency units.
 *
 * Purpose: Inverse public conversion boundary; delegates the arithmetic and validation to
 * `@trajectonomics/money`, so a value converted here matches one converted in the ledger.
 * Math: Divides by `10 ** digits` in the shared package and fixes the result to that many decimals,
 * which also normalises `-0` to `+0`.
 * Units: Input is integer minor units (e.g. satang, cents); output is major units.
 *
 * @param minorUnits Integer minor units.
 * @param currency Supported statutory currency (THB or USD).
 * @param field Diagnostic field name.
 * @param options Validation options (e.g. allowNegative for refund balances).
 * @returns Amount in major units.
 * @throws {TaxValidationError} if minorUnits is not a safe integer, or is negative without `allowNegative`.
 * @example fromMinorUnits(1055, "THB") // 10.55
 */
export function fromMinorUnits(
	minorUnits: number,
	currency: TaxSupportedCurrency,
	field = "minorUnits",
	options?: ValidateAmountOptions,
): number {
	try {
		return sharedFromMinorUnits(minorUnits, CURRENCY_PRECISION[currency], field, options)
	} catch (error) {
		throw toTaxValidationError(error)
	}
}
