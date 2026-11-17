import { TH_2026_BRACKETS } from "./parameters-brackets"
import {
	TH_2026_FINAL_WITHHOLDING,
	TH_2026_REAL_ESTATE,
	TH_2026_SEPARATE_SHEET,
} from "./parameters-special"
import type { ThParameters } from "./parameters-types"

/**
 * Thailand Statutory Tax Parameters for Tax Year 2026 (Revenue Code ภ.ง.ด.90/91).
 *
 * @statute Thailand Revenue Code Sections 40, 42 bis, 47, 47 bis, 48(1)–(5); Royal Decrees No. 11, 650.
 */
export const TH_2026_PARAMETERS: ThParameters = {
	taxYear: 2026,
	currency: "THB",
	expenses: {
		section40_1_2: { rate: 0.5, ceiling: 100_000 },
		section40_3: { rate: 0.5, ceiling: 100_000 },
		section40_4: { rate: 0.0 },
		section40_5: {
			building: 0.3,
			agriculturalLand: 0.2,
			nonAgriculturalLand: 0.15,
			vehicles: 0.3,
			other: 0.1,
		},
		section40_6: {
			medical: 0.6,
			other: 0.3,
		},
		section40_7: { rate: 0.6 },
		section40_8: {
			generalRate: 0.6,
			entertainerFirstTierRate: 0.6,
			entertainerFirstTierThreshold: 300_000,
			entertainerSecondTierRate: 0.4,
			entertainerCeiling: 600_000,
		},
	},
	allowances: {
		personal: 60_000,
		spouse: 60_000,
		child: {
			basePerChild: 30_000,
			bonusSecondPlusBorn2018OrLater: 30_000,
			bonusCutoffYear: 2018,
		},
		parent: {
			perPerson: 30_000,
			maxCount: 4,
		},
		disabledPerPerson: 60_000,
		socialSecurityFundCeiling: 10_500,
		lifeInsurance: {
			combinedCeiling: 100_000,
			healthCeiling: 25_000,
		},
		parentHealthInsuranceCeiling: 15_000,
		spouseLifeInsuranceCeiling: 10_000,
		mortgageInterestCeiling: 100_000,
		retirementCluster: {
			combinedCeiling: 500_000,
			rmf: { maxRate: 0.3, ceiling: 500_000 },
			ssf: { maxRate: 0.3, ceiling: 200_000 },
			pvd: { maxRate: 0.15, ceiling: 500_000 },
			gpf: { maxRate: 0.3, ceiling: 500_000 },
			nsf: { ceiling: 30_000 },
			pensionLifeInsurance: { maxRate: 0.15, ceiling: 200_000 },
		},
		thaiEsg: { maxRate: 0.3, ceiling: 300_000 },
		donations: {
			donation2xMultiplier: 2,
			donation2xMaxRate: 0.1,
			donation1xMaxRate: 0.1,
		},
	},
	brackets: TH_2026_BRACKETS,
	minimumGrossTax: {
		rate: 0.005,
		incomeThreshold: 120_000,
		taxThreshold: 5_000,
	},
	finalWithholding: TH_2026_FINAL_WITHHOLDING,
	separateSheet: TH_2026_SEPARATE_SHEET,
	realEstate: TH_2026_REAL_ESTATE,
}
