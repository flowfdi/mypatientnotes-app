export interface StateRules {
  code: string
  name: string
  soapRequired: boolean
  consentRequired: boolean
  noControlledSubstances: boolean
  reExamInterval?: string
  notes: string[]
}

export const STATE_RULES: Record<string, StateRules> = {
  IA: {
    code: 'IA',
    name: 'Iowa',
    soapRequired: true,
    consentRequired: true,
    noControlledSubstances: true,
    reExamInterval: '30 days',
    notes: [
      'SOAP documentation required for every visit (Iowa Admin. Code 645—43.3)',
      'Written informed consent required prior to treatment',
      'DCs may not prescribe controlled substances',
      'Re-examination required at least every 30 days',
    ],
  },
  IL: {
    code: 'IL',
    name: 'Illinois',
    soapRequired: true,
    consentRequired: true,
    noControlledSubstances: true,
    reExamInterval: '60 days',
    notes: [
      'SOAP or equivalent documentation required',
      'Informed consent must be documented in patient record',
      'DCs may not prescribe controlled substances',
    ],
  },
  MN: {
    code: 'MN',
    name: 'Minnesota',
    soapRequired: true,
    consentRequired: true,
    noControlledSubstances: true,
    notes: [
      'Complete clinical records required including SOAP notes',
      'Informed consent required and must be documented',
      'DCs may not prescribe controlled substances',
    ],
  },
  WI: {
    code: 'WI',
    name: 'Wisconsin',
    soapRequired: true,
    consentRequired: true,
    noControlledSubstances: true,
    notes: [
      'Adequate documentation of each patient visit required',
      'Informed consent required before chiropractic services',
      'DCs may not prescribe controlled substances',
    ],
  },
  MO: {
    code: 'MO',
    name: 'Missouri',
    soapRequired: true,
    consentRequired: true,
    noControlledSubstances: true,
    notes: [
      'Clinical records must reflect subjective and objective findings',
      'Patient consent must be documented',
      'DCs may not prescribe controlled substances',
    ],
  },
  NE: {
    code: 'NE',
    name: 'Nebraska',
    soapRequired: true,
    consentRequired: true,
    noControlledSubstances: true,
    notes: [
      'SOAP documentation required',
      'Informed consent documentation required',
      'DCs may not prescribe controlled substances',
    ],
  },
  CA: {
    code: 'CA',
    name: 'California',
    soapRequired: true,
    consentRequired: true,
    noControlledSubstances: true,
    notes: [
      'SOAP notes required per BCP regulations',
      'Informed consent must be documented (Business & Professions Code §734)',
      'DCs may not prescribe controlled substances',
      'Peer review required for extended care beyond 12 visits',
    ],
  },
  TX: {
    code: 'TX',
    name: 'Texas',
    soapRequired: true,
    consentRequired: true,
    noControlledSubstances: true,
    reExamInterval: '90 days',
    notes: [
      'Complete clinical records required including examination findings',
      'Written informed consent required',
      'DCs may not prescribe controlled substances',
    ],
  },
  FL: {
    code: 'FL',
    name: 'Florida',
    soapRequired: true,
    consentRequired: true,
    noControlledSubstances: true,
    notes: [
      'SOAP documentation required per Florida Board of Chiropractic',
      'Informed consent required and documented',
      'DCs may not prescribe controlled substances',
    ],
  },
  NY: {
    code: 'NY',
    name: 'New York',
    soapRequired: true,
    consentRequired: true,
    noControlledSubstances: true,
    notes: [
      'Adequate records required for each patient visit',
      'Informed consent documentation required',
      'DCs may not prescribe controlled substances',
    ],
  },
}

export const ALL_STATES = Object.values(STATE_RULES).sort((a, b) =>
  a.name.localeCompare(b.name)
)

export function getStateRules(code: string): StateRules {
  return (
    STATE_RULES[code] ?? {
      code,
      name: code,
      soapRequired: true,
      consentRequired: true,
      noControlledSubstances: true,
      notes: ['SOAP documentation recommended. Check your state board requirements.'],
    }
  )
}
