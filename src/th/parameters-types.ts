import type { TaxBracket } from "../core/brackets"

export interface ThParameters {
	readonly taxYear: 2026
	readonly currency: "THB"
	readonly expenses: {
		readonly section40_1_2: { readonly rate: number; readonly ceiling: number }
		readonly section40_3: { readonly rate: number; readonly ceiling: number }
		readonly section40_4: { readonly rate: number }
		readonly section40_5: {
			readonly building: number
			readonly agriculturalLand: number
			readonly nonAgriculturalLand: number
			readonly vehicles: number
			readonly other: number
		}
		readonly section40_6: {
			readonly medical: number
			readonly other: number
		}
		readonly section40_7: { readonly rate: number }
		readonly section40_8: {
			readonly generalRate: number
			readonly entertainerFirstTierRate: number
			readonly entertainerFirstTierThreshold: number
			readonly entertainerSecondTierRate: number
			readonly entertainerCeiling: number
		}
	}
	readonly allowances: {
		readonly personal: number
		readonly spouse: number
		readonly child: {
			readonly basePerChild: number
			readonly bonusSecondPlusBorn2018OrLater: number
			readonly bonusCutoffYear: number
		}
		readonly parent: {
			readonly perPerson: number
			readonly maxCount: number
		}
		readonly disabledPerPerson: number
		readonly socialSecurityFundCeiling: number
		readonly lifeInsurance: {
			readonly combinedCeiling: number
			readonly healthCeiling: number
		}
		readonly parentHealthInsuranceCeiling: number
		readonly spouseLifeInsuranceCeiling: number
		readonly mortgageInterestCeiling: number
		readonly retirementCluster: {
			readonly combinedCeiling: number
			readonly rmf: { readonly maxRate: number; readonly ceiling: number }
			readonly ssf: { readonly maxRate: number; readonly ceiling: number }
			readonly pvd: { readonly maxRate: number; readonly ceiling: number }
			readonly gpf: { readonly maxRate: number; readonly ceiling: number }
			readonly nsf: { readonly ceiling: number }
			readonly pensionLifeInsurance: {
				readonly maxRate: number
				readonly ceiling: number
			}
		}
		readonly thaiEsg: { readonly maxRate: number; readonly ceiling: number }
		readonly donations: {
			readonly donation2xMultiplier: number
			readonly donation2xMaxRate: number
			readonly donation1xMaxRate: number
		}
	}
	readonly brackets: readonly TaxBracket[]
	readonly minimumGrossTax: {
		readonly rate: number
		readonly incomeThreshold: number
		readonly taxThreshold: number
	}
	/**
	 * Section 40(4) final withholding rates (ratios).
	 *
	 * @statute Thailand Revenue Code Sections 40(4), 50(2)(g), 57 ter.
	 */
	readonly finalWithholding: {
		/** Bank interest rate (ratio). */
		readonly interestRate: number
		/** Dividend rate (ratio). */
		readonly dividendRate: number
		/** Digital asset income rate (ratio); an assumption mirroring interest. */
		readonly digitalAssetRate: number
	}
	/**
	 * Section 48(5) separate sheet for severance/retirement lump sums. Money in THB major units,
	 * rates as ratios.
	 *
	 * @statute Thailand Revenue Code Section 48(5), Section 42(1).
	 */
	readonly separateSheet: {
		/** Minimum completed years of service for eligibility (count). */
		readonly minYearsOfService: number
		/** Multiplier of the last daily wage for the exemption (days). */
		readonly exemptionWageDays: number
		/** Absolute exemption ceiling (THB). */
		readonly exemptionCeiling: number
		/** Fixed expense per year of service (THB). */
		readonly expensePerYearOfService: number
		/** Expense rate on the remainder after the fixed expense (ratio). */
		readonly remainderExpenseRate: number
		/** Separate progressive schedule (THB bounds, ratio rates). */
		readonly brackets: readonly TaxBracket[]
	}
	/**
	 * Section 48(4) real estate transfer parameters.
	 *
	 * @statute Thailand Revenue Code Section 48(4), Ministerial Regulation No. 126.
	 */
	readonly realEstate: {
		/** Expense rate by holding years; the last row with `minYears <= holdingYears` applies. */
		readonly expenseTable: readonly {
			/** Minimum whole holding years for the row (count). */
			readonly minYears: number
			/** Expense deduction rate (ratio). */
			readonly rate: number
		}[]
		/** Flat expense rate for inherited or gifted property (ratio); replaces the table. */
		readonly inheritanceExpenseRate: number
		/** Holding years above this count as this many (statute: more than 10 years counts as 10). */
		readonly maxHoldingYears: number
		/** Annualised schedule: the Section 48(5) ladder without a 0% tier (THB bounds, ratios). */
		readonly brackets: readonly TaxBracket[]
		/** Cap on tax as a share of gross transfer value (ratio). */
		readonly taxCapRate: number
	}
}
