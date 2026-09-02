// Removed invalid import: JurisdictionConfig is not exported from @prisma/client

import { JurisdictionConfig } from "./types";

export interface ComplianceRule {
  id: string;
  section: string;
  title: string;
  description: string;
  required: boolean;
  jurisdictions: string[];
  category: 'record-keeping' | 'hygiene' | 'release' | 'carer-management' | 'incident-management' | 'general';
  formType?: string;
  retentionYears?: number;
  exportFormats?: string[];
}

export interface ComplianceSection {
  id: string;
  title: string;
  description: string;
  rules: ComplianceRule[];
  jurisdictions: string[];
}

export interface JurisdictionComplianceConfig extends JurisdictionConfig {
  codeOfPractice: string;
  codeOfPracticeUrl?: string;
  sections: ComplianceSection[];
  retentionRequirements: {
    animalRecords: number;
    incidentReports: number;
    hygieneLogs: number;
    releaseChecklists: number;
    carerRecords: number;
  };
  mandatoryForms: string[];
  optionalForms: string[];
  distanceRequirements: {
    releaseDistance: number;
    unit: 'km' | 'miles';
    enforced: boolean;
  };
  vetRequirements: {
    signOffRequired: boolean;
    forJuveniles: boolean;
    forSpecificSpecies: string[];
  };
}

// ACT Wildlife Code of Practice 2020 Compliance Rules
const ACT_COMPLIANCE_RULES: ComplianceSection[] = [
  {
    id: 'section-7',
    title: 'Record Keeping Requirements',
    description: 'Wildlife admission and outcome register requirements',
    jurisdictions: ['ACT'],
    rules: [
      {
        id: '7.1.1',
        section: '7.1.1',
        title: 'Wildlife Admission Register',
        description: 'Maintain a register of all wildlife admitted to care',
        required: true,
        jurisdictions: ['ACT'],
        category: 'record-keeping',
        formType: 'wildlife-register',
        retentionYears: 3,
        exportFormats: ['CSV', 'PDF']
      },
      {
        id: '7.1.2',
        section: '7.1.2',
        title: 'Search and Filter Capability',
        description: 'Register must allow searching and filtering by species, date, and carer',
        required: true,
        jurisdictions: ['ACT'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      },
      {
        id: '7.1.3',
        section: '7.1.3',
        title: 'Export Functionality',
        description: 'Ability to export records as CSV and PDF formats',
        required: true,
        jurisdictions: ['ACT'],
        category: 'record-keeping',
        formType: 'wildlife-register',
        exportFormats: ['CSV', 'PDF']
      }
    ]
  },
  {
    id: 'section-6',
    title: 'Release Requirements',
    description: 'Release site selection and checklist requirements',
    jurisdictions: ['ACT'],
    rules: [
      {
        id: '6.1',
        section: '6.1',
        title: 'Release Site Distance',
        description: 'Release sites must be at least 10km from capture location',
        required: true,
        jurisdictions: ['ACT'],
        category: 'release',
        formType: 'release-checklist'
      },
      {
        id: '6.2',
        section: '6.2',
        title: 'Veterinary Sign-off for Juveniles',
        description: 'Veterinary approval required for release of juvenile animals',
        required: true,
        jurisdictions: ['ACT'],
        category: 'release',
        formType: 'release-checklist'
      },
      {
        id: '6.3',
        section: '6.3',
        title: 'Release Checklist Documentation',
        description: 'Complete release checklist must be documented and retained',
        required: true,
        jurisdictions: ['ACT'],
        category: 'release',
        formType: 'release-checklist',
        retentionYears: 3,
        exportFormats: ['PDF']
      }
    ]
  },
  {
    id: 'section-5',
    title: 'Hygiene and Biosecurity',
    description: 'Daily hygiene and biosecurity protocols',
    jurisdictions: ['ACT'],
    rules: [
      {
        id: '5.2.1',
        section: '5.2.1',
        title: 'Daily Hygiene Log',
        description: 'Daily cleaning and biosecurity protocols must be documented',
        required: true,
        jurisdictions: ['ACT'],
        category: 'hygiene',
        formType: 'hygiene-log',
        retentionYears: 3
      },
      {
        id: '5.2.2',
        section: '5.2.2',
        title: 'PPE Usage Tracking',
        description: 'Personal protective equipment usage must be recorded',
        required: true,
        jurisdictions: ['ACT'],
        category: 'hygiene',
        formType: 'hygiene-log'
      },
      {
        id: '5.2.3',
        section: '5.2.3',
        title: 'Equipment Disinfection',
        description: 'Feeding bowls and equipment disinfection must be documented',
        required: true,
        jurisdictions: ['ACT'],
        category: 'hygiene',
        formType: 'hygiene-log'
      }
    ]
  },
  {
    id: 'section-5.1',
    title: 'Incident Management',
    description: 'Incident reporting and management requirements',
    jurisdictions: ['ACT'],
    rules: [
      {
        id: '5.1.3',
        section: '5.1.3',
        title: 'Incident Reporting',
        description: 'All major incidents must be reported and documented',
        required: true,
        jurisdictions: ['ACT'],
        category: 'incident-management',
        formType: 'incident-report',
        retentionYears: 3,
        exportFormats: ['PDF']
      },
      {
        id: '5.2.4',
        section: '5.2.4',
        title: 'Escape Incidents',
        description: 'Animal escape incidents must be reported immediately',
        required: true,
        jurisdictions: ['ACT'],
        category: 'incident-management',
        formType: 'incident-report'
      },
      {
        id: '6.4',
        section: '6.4',
        title: 'Release Incidents',
        description: 'Incidents during release must be documented',
        required: true,
        jurisdictions: ['ACT'],
        category: 'incident-management',
        formType: 'incident-report'
      }
    ]
  },
  {
    id: 'section-4',
    title: 'Carer Management',
    description: 'Carer licensing and training requirements',
    jurisdictions: ['ACT'],
    rules: [
      {
        id: '4.1.1',
        section: '4.1.1',
        title: 'Licence Management',
        description: 'Carer licences must be tracked and managed',
        required: true,
        jurisdictions: ['ACT'],
        category: 'carer-management',
        formType: 'carer-licence'
      },
      {
        id: '4.1.2',
        section: '4.1.2',
        title: 'Training Records',
        description: 'Training history and continuing professional development must be documented',
        required: true,
        jurisdictions: ['ACT'],
        category: 'carer-management',
        formType: 'carer-licence'
      },
      {
        id: '4.1.3',
        section: '4.1.3',
        title: 'Authorised Species',
        description: 'Authorised species for each carer must be tracked',
        required: true,
        jurisdictions: ['ACT'],
        category: 'carer-management',
        formType: 'carer-licence'
      }
    ]
  }
];

// NSW Encounter Types (official DCCEEW list)
export const NSW_ENCOUNTER_TYPES = {
  'Attacks & Collisions': [
    'Attack – bird',
    'Attack – cat',
    'Attack – dog',
    'Attack – fox',
    'Attack – same species',
    'Attack – suspected-other',
    'Collision – building',
    'Collision – motor vehicle',
    'Collision – other',
    'Collision – vessel strike'
  ],
  'Dependency & Diseases': [
    'Abandoned/orphaned',
    'Dependent on parent taken into care',
    'Disease – botulism',
    'Disease – chlamydia',
    'Disease – external parasite',
    'Disease – internal parasite',
    'Disease – mange',
    'Disease – other',
    'Disease – PBFD'
  ],
  'Domestic Pets': [
    'Domestic pet – escaped',
    'Domestic pet – seized',
    'Domestic pet – surrendered'
  ],
  'Electrocution & Entanglement': [
    'Electrocution',
    'Entanglement – marine debris',
    'Entanglement – netting',
    'Entanglement – other',
    'Entanglement – wire',
    'Entrapment'
  ],
  'Events & Environmental': [
    'Event – drought',
    'Event – extreme heat',
    'Event – fire',
    'Event – flood',
    'Event – storm',
    'Fallen from nest or tree',
    'Fouled by substance',
    'Human impact – habitat alteration/tree felling'
  ],
  'Human Actions & Other': [
    'Human impact – intentional harm',
    'Human impact – interference',
    'Ingestion of a foreign object',
    'Poisoned',
    'Negative interaction',
    'Stranded/haul-out',
    'Unsuitable environment',
    'Unknown'
  ]
};

// NSW Fate Options (official DCCEEW list)
export const NSW_FATE_OPTIONS = [
  'Advice provided',
  'Could not locate for rescue',
  'Dead prior to rescuer arriving',
  'Died in care',
  'Escaped from care',
  'Euthanased by rehabilitation group',
  'Euthanased by vet',
  'Euthanased by police',
  'Euthanased by other',
  'Evaded capture',
  'In care',
  'Left and observed',
  'Permanent care – companion (approved)',
  'Permanent care – external/community education (approved)',
  'Permanent care – internal training (approved)',
  'Permanent care – research (approved)',
  'Rehomed',
  'Released',
  'Relocated',
  'Resolved by vets',
  'Returned to owner',
  'Reunited with parents',
  'Transferred to an authorised animal park/zoo',
  'Transferred to other wildlife rehabilitation organisation'
];

// NSW Pouch Conditions (marsupials only)
export const NSW_POUCH_CONDITIONS = [
  'Lactating',
  'Non-lactating',
  'Pinkie attached',
  'Pouch young',
  'Back young',
  'NA'
];

// NSW Animal Condition Options
export const NSW_ANIMAL_CONDITIONS = [
  'Dehydrated',
  'Emaciated',
  'Good',
  'Moribund',
  'Multiple health issues',
  'Poor',
  'Fair'
];

// NSW Wildlife Rehabilitation Compliance Rules
const NSW_COMPLIANCE_RULES: ComplianceSection[] = [
  {
    id: 'section-14',
    title: 'Record Keeping Requirements',
    description: 'Standards and guidelines for maintaining records of protected fauna per DCCEEW requirements',
    jurisdictions: ['NSW'],
    rules: [
      {
        id: '14.1.1',
        section: '14.1.1',
        title: 'Individual Animal Records',
        description: 'Maintain individual records with unique org ID, species, encounter date/type, location, condition, sex, life stage',
        required: true,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register',
        retentionYears: 2
      },
      {
        id: '14.1.1a',
        section: '14.1.1a',
        title: 'Initial Weight Recording',
        description: 'Record the first weight taken on entry to care in grams',
        required: true,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      },
      {
        id: '14.1.1b',
        section: '14.1.1b',
        title: 'Encounter Type Recording',
        description: 'Use official DCCEEW encounter type list for immediate cause of rescue',
        required: true,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      },
      {
        id: '14.1.1c',
        section: '14.1.1c',
        title: 'Animal Condition Assessment',
        description: 'Record animal condition using official NSW categories',
        required: true,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      },
      {
        id: '14.1.1d',
        section: '14.1.1d',
        title: 'Pouch Condition (Marsupials)',
        description: 'Record pouch condition for marsupials using one of six official values',
        required: true,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      },
      {
        id: '14.1.1e',
        section: '14.1.1e',
        title: 'Fate Recording',
        description: 'Record fate using official DCCEEW fate list with date and details',
        required: true,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      },
      {
        id: '14.1.2',
        section: '14.1.2',
        title: 'Record Transfer',
        description: 'Track transfers with your ID, receiving org ID, entity details, and transfer date to avoid duplicates',
        required: true,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      },
      {
        id: '14.1.2a',
        section: '14.1.2a',
        title: 'Transfer Register',
        description: 'Maintain transfer register with unique IDs for cross-referencing between organizations',
        required: true,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      },
      {
        id: '14.1.3',
        section: '14.1.3',
        title: 'Disease Outbreak Reporting',
        description: 'Immediately contact rehabilitation group for tissue analysis or necropsy if death suspected from serious disease',
        required: true,
        jurisdictions: ['NSW'],
        category: 'incident-management',
        formType: 'incident-report'
      },
      {
        id: '14.2.1',
        section: '14.2.1',
        title: 'Rescue Information',
        description: 'Record who discovered animal, when discovered, and any treatment provided prior to transport',
        required: false,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      },
      {
        id: '14.2.2',
        section: '14.2.2',
        title: 'Veterinary Assessment',
        description: 'Record details of wounds, injuries, diseases, mobility, abnormal behaviour, and recommended management',
        required: false,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      },
      {
        id: '14.2.3',
        section: '14.2.3',
        title: 'Entry Information',
        description: 'Record standard measurements, identifying features, and housing type',
        required: false,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      },
      {
        id: '14.2.4',
        section: '14.2.4',
        title: 'Daily Care Records',
        description: 'Record food intake, treatment details, veterinary instructions, fitness changes, and enclosure cleaning',
        required: false,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      },
      {
        id: '14.2.5',
        section: '14.2.5',
        title: 'Release Information',
        description: 'Record release type, date, exact address, distance from rescue, tags/bands, and microchip if used',
        required: false,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'release-checklist'
      },
      {
        id: '14.2.6',
        section: '14.2.6',
        title: 'Record Backups',
        description: 'Keep duplicates or backups of records to avoid information loss',
        required: false,
        jurisdictions: ['NSW'],
        category: 'record-keeping',
        formType: 'wildlife-register'
      }
    ]
  },
  {
    id: 'section-11',
    title: 'Suitability for Release',
    description: 'Assessment criteria for determining if animals are suitable for release',
    jurisdictions: ['NSW'],
    rules: [
      {
        id: '11.1',
        section: '11.1',
        title: 'Release Assessment',
        description: 'Animals must be assessed for suitability for release based on health, behavior, and survival skills',
        required: true,
        jurisdictions: ['NSW'],
        category: 'release',
        formType: 'release-checklist'
      }
    ]
  },
  {
    id: 'section-12',
    title: 'Release Considerations',
    description: 'Factors to consider when releasing animals back to the wild',
    jurisdictions: ['NSW'],
    rules: [
      {
        id: '12.1',
        section: '12.1',
        title: 'Release Planning',
        description: 'Consider habitat suitability, season, weather conditions, and potential threats',
        required: true,
        jurisdictions: ['NSW'],
        category: 'release',
        formType: 'release-checklist'
      }
    ]
  },
  {
    id: 'section-13',
    title: 'Training Requirements',
    description: 'Training and experience requirements for fauna rehabilitators',
    jurisdictions: ['NSW'],
    rules: [
      {
        id: '13.1',
        section: '13.1',
        title: 'Rehabilitator Training',
        description: 'Fauna rehabilitators must have appropriate training and experience',
        required: true,
        jurisdictions: ['NSW'],
        category: 'carer-management',
        formType: 'carer-licence'
      }
    ]
  },
  {
    id: 'section-8',
    title: 'Care Procedures',
    description: 'Standards for care procedures and treatment of protected fauna',
    jurisdictions: ['NSW'],
    rules: [
      {
        id: '8.1',
        section: '8.1',
        title: 'Care Standards',
        description: 'Follow appropriate care procedures for the species and condition of the animal',
        required: true,
        jurisdictions: ['NSW'],
        category: 'general'
      }
    ]
  },
  {
    id: 'section-9',
    title: 'Husbandry',
    description: 'Husbandry standards for the care of protected fauna',
    jurisdictions: ['NSW'],
    rules: [
      {
        id: '9.1',
        section: '9.1',
        title: 'Husbandry Standards',
        description: 'Maintain appropriate husbandry practices for the species in care',
        required: true,
        jurisdictions: ['NSW'],
        category: 'general'
      }
    ]
  },
  {
    id: 'section-10',
    title: 'Housing Requirements',
    description: 'Standards for housing and enclosure requirements based on species',
    jurisdictions: ['NSW'],
    rules: [
      {
        id: '10.1',
        section: '10.1',
        title: 'Enclosure Standards',
        description: 'Provide appropriate enclosure sizes and conditions as per Appendix A guidelines',
        required: true,
        jurisdictions: ['NSW'],
        category: 'general'
      }
    ]
  }
];

// VIC Wildlife Rehabilitation Compliance Rules
// Sourced from the DEECA Wildlife Rehabilitator Authorisation Guide (Conditions 1-25),
// https://www.vic.gov.au/wildlife-rehabilitator-authorisation-guide/authorisation-conditions
const VIC_COMPLIANCE_RULES: ComplianceSection[] = [
  {
    id: 'vic-scope-of-authorisation',
    title: 'Scope of Authorisation',
    description: 'Species excluded from the authorisation, and the standing of directions from Authorised Officers (Conditions 1-2)',
    jurisdictions: ['VIC'],
    rules: [
      {
        id: 'vic-1',
        section: 'Condition 1',
        title: 'Species Not Covered by the Authorisation',
        // Verbatim species list taken from an issued Shelter Authorisation.
        // This is the only condition in the set that can be checked
        // mechanically at admission, so keep the list exact — an omission here
        // silently permits an intake the authorisation forbids.
        description: 'The authorisation does not permit acquiring, receiving, possessing, euthanasing or disposing of: whales, dolphins, seals, marine turtles, platypus, fish, deer, non-indigenous quail, pheasants and partridges.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'general'
      },
      {
        id: 'vic-2',
        section: 'Condition 2',
        title: 'Directions from Authorised Officers',
        description: 'Any verbal or written direction from a DEECA Authorised Officer relating to wildlife held under the authorisation must be followed.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'general'
      }
    ]
  },
  {
    id: 'vic-assessment-quarantine',
    title: 'Assessment & Quarantine',
    description: 'Health assessment and quarantine requirements (Conditions 3-6)',
    jurisdictions: ['VIC'],
    rules: [
      {
        id: 'vic-3',
        section: 'Condition 3',
        title: 'Health Assessment Within 48 Hours',
        description: 'New wildlife must have its health assessed within 48 hours by a registered vet or experienced rehabilitator, and their advice recorded.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'incident-management',
        formType: 'health-assessment'
      },
      {
        id: 'vic-4-5',
        section: 'Conditions 4-5',
        title: 'Quarantine on Admission',
        description: 'Wildlife must be isolated/quarantined from other wildlife on acquisition and prior to health assessment, and if showing signs of disease.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'hygiene'
      },
      {
        id: 'vic-6',
        section: 'Condition 6',
        title: 'Vet Clearance Before Leaving Quarantine',
        description: 'Wildlife must not leave quarantine until a vet, experienced rehabilitator, or Authorised Officer confirms it is safe to do so.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'hygiene'
      }
    ]
  },
  {
    id: 'vic-experience',
    title: 'Experience & Species Advice',
    description: 'Requirement to seek advice for unfamiliar species (Condition 7)',
    jurisdictions: ['VIC'],
    rules: [
      {
        id: 'vic-7',
        section: 'Condition 7',
        title: 'Advice for Unfamiliar Species Within 24 Hours',
        description: 'For any species not previously cared for, advice must be sought within 24 hours from a vet, experienced rehabilitator, or Authorised Officer.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'incident-management'
      }
    ]
  },
  {
    id: 'vic-surgical-treatment',
    title: 'Surgical Treatment & Medication',
    description: 'Limits on surgery and on the administration of scheduled poisons (Condition 8)',
    jurisdictions: ['VIC'],
    rules: [
      {
        id: 'vic-8',
        section: 'Condition 8',
        title: 'No Surgery; Scheduled Medicines Only on Advice',
        description: 'Surgical treatment must not be undertaken — only registered veterinary practitioners may do so. Schedule 4, 8 or 9 poisons may only be administered subject to Condition 3 (i.e. on veterinary or experienced-carer advice) and in accordance with the Drugs, Poisons and Controlled Substances Regulations.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'incident-management'
      }
    ]
  },
  {
    id: 'vic-euthanasia-disposal',
    title: 'Euthanasia & Carcass Disposal',
    description: 'Euthanasia criteria, methods, and carcass disposal requirements (Conditions 9-12)',
    jurisdictions: ['VIC'],
    rules: [
      {
        id: 'vic-9-11',
        section: 'Conditions 9-11',
        title: 'Euthanasia Criteria and Approved Methods',
        description: 'Wildlife meeting defined non-survivable criteria must be promptly euthanised by an approved method (never by CO2/CO, chloroform, drowning, hypothermia, air embolism, suffocation, or exsanguination alone).',
        required: true,
        jurisdictions: ['VIC'],
        category: 'incident-management',
        formType: 'necropsy'
      },
      {
        id: 'vic-12',
        section: 'Condition 12',
        title: 'Carcass Disposal',
        description: 'Carcasses from barbiturate euthanasia, bats, or mange-infected animals must be incinerated or buried 60cm deep, at least 100m from any waterway.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'general'
      }
    ]
  },
  {
    id: 'vic-threatened-species',
    title: 'Threatened Species Notification',
    description: 'Notification requirements for threatened species (Condition 13)',
    jurisdictions: ['VIC'],
    rules: [
      {
        id: 'vic-13',
        section: 'Condition 13',
        title: 'Notify Authorised Officer Within 48 Hours',
        description: 'Any wildlife listed as threatened under the Flora and Fauna Guarantee Act 1988 must be reported to the local Conservation Regulator Authorised Officer within 48 hours of admission.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'incident-management'
      }
    ]
  },
  {
    id: 'vic-enclosures',
    title: 'Enclosure Standards',
    description: 'Enclosure sizing, construction, and hygiene requirements (Conditions 14-19)',
    jurisdictions: ['VIC'],
    rules: [
      {
        id: 'vic-14',
        section: 'Condition 14',
        title: 'Minimum Enclosure Sizes',
        description: 'Enclosures must meet minimum floor area, height, and stocking density requirements set out for birds, reptiles, and mammals by species/size class.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'general'
      },
      {
        id: 'vic-15-18',
        section: 'Conditions 15-18',
        title: 'Enclosure Location, Construction & Hygiene',
        description: 'Wildlife must be separated from domestic animals and human living spaces, prevent escape, minimise stress, and be cleaned/disinfected with daily waste removal.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'hygiene',
        formType: 'hygiene-log'
      },
      {
        id: 'vic-19',
        section: 'Condition 19',
        title: 'Food and Water',
        description: 'Food and water provided must meet the species\' dietary/nutritional needs, be fresh, clean, and stored to prevent spoilage or contamination.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'general'
      }
    ]
  },
  {
    id: 'vic-display',
    title: 'Display of Wildlife',
    description: 'Restrictions on display and photography of wildlife in care (Condition 20)',
    jurisdictions: ['VIC'],
    rules: [
      {
        id: 'vic-20',
        section: 'Condition 20',
        title: 'Display Restrictions',
        description: 'Wildlife may only be shown to a vet or regular volunteer providing care. Any other display, including third-party filming, requires prior written approval from the Conservation Regulator.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'general'
      }
    ]
  },
  {
    id: 'vic-release',
    title: 'Release Requirements',
    description: 'Release location and readiness criteria, and euthanasia of non-releasable wildlife (Conditions 21-22)',
    jurisdictions: ['VIC'],
    rules: [
      {
        id: 'vic-21',
        section: 'Condition 21',
        title: 'Release Within 24 Hours at a Suitable Location',
        description: 'Wildlife must be released within 24 hours of being ready, at the location found if suitable, or the closest suitable location within its home range otherwise. Release outside the home range is not permitted.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'release',
        formType: 'release-checklist'
      },
      {
        id: 'vic-22',
        section: 'Condition 22',
        title: 'Euthanasia of Non-Releasable Wildlife',
        description: 'Wildlife that cannot be released to a suitable location, or that is not fit for release, must be euthanised rather than released.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'release'
      }
    ]
  },
  {
    id: 'vic-record-keeping',
    title: 'Wildlife Records',
    description: 'Record keeping requirements for Victoria (Condition 23)',
    jurisdictions: ['VIC'],
    rules: [
      {
        id: 'vic-23',
        section: 'Condition 23',
        title: 'Wildlife Records',
        description: 'Accurate records must be kept for every animal received, acquired, possessed, euthanised, or disposed of, on Conservation Regulator Wildlife Record Sheets (or an approved equivalent), including species, found location/date, condition, cause, vet advice, and fate/release details. Records must be kept for 3 years and produced to an Authorised Officer without delay. Annual submission to DEECA is no longer required.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'record-keeping',
        formType: 'wildlife-register',
        retentionYears: 3
      }
    ]
  },
  {
    id: 'vic-other-licences',
    title: 'Other Wildlife Licences',
    description: 'Separation from wildlife held under other licences (Condition 24)',
    jurisdictions: ['VIC'],
    rules: [
      {
        id: 'vic-24',
        section: 'Condition 24',
        title: 'Physical Separation From Licensed Wildlife',
        description: 'Wildlife held under this authorisation must be kept physically separate from wildlife held under any private or commercial wildlife licence.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'general'
      }
    ]
  },
  {
    id: 'vic-foster-carer-supervision',
    title: 'Foster Carer Supervision',
    description: 'Foster carer notification obligations to their supervising shelter (Condition 25)',
    jurisdictions: ['VIC'],
    rules: [
      {
        id: 'vic-25',
        section: 'Condition 25',
        title: 'Notify Supervising Shelter Within 24 Hours',
        description: 'Foster carers must notify their registered shelter operator within 24 hours of receiving or acquiring wildlife.',
        required: true,
        jurisdictions: ['VIC'],
        category: 'carer-management'
      }
    ]
  }
];

// Jurisdiction-specific compliance configurations
export const JURISDICTION_COMPLIANCE_CONFIGS: { [key: string]: JurisdictionComplianceConfig } = {
  ACT: {
    enabledForms: ['releaseChecklist', 'incidentLog', 'hygieneLog', 'carerLicence', 'wildlifeRegister'],
    templates: ['ACTRegister', 'ACTReleaseChecklist'],
    enforceReleaseDistance: true,
    requireVetSignOff: true,
    maxRetentionYears: 3,
    codeOfPractice: 'ACT Wildlife Code of Practice 2020',
    codeOfPracticeUrl: 'https://actwildlife.net/wp-content/uploads/2022/03/Wildlife-COP-2020.pdf',
    sections: ACT_COMPLIANCE_RULES,
    retentionRequirements: {
      animalRecords: 3,
      incidentReports: 3,
      hygieneLogs: 3,
      releaseChecklists: 3,
      carerRecords: 3
    },
    mandatoryForms: ['wildlife-register', 'release-checklist', 'hygiene-log', 'incident-report'],
    optionalForms: ['carer-licence'],
    distanceRequirements: {
      releaseDistance: 10,
      unit: 'km',
      enforced: true
    },
    vetRequirements: {
      signOffRequired: true,
      forJuveniles: true,
      forSpecificSpecies: ['All species']
    }
  },
  NSW: {
    enabledForms: ['releaseChecklist', 'incidentLog', 'wildlifeRegister'],
    templates: ['NSWRegister'],
    enforceReleaseDistance: false,
    requireVetSignOff: false,
    maxRetentionYears: 2,
    codeOfPractice: 'Code of Practice for Injured, Sick and Orphaned Protected Fauna',
    codeOfPracticeUrl: 'https://www.environment.nsw.gov.au/sites/default/files/code-practice-injured-protected-fauna-110004.pdf',
    sections: NSW_COMPLIANCE_RULES,
    retentionRequirements: {
      animalRecords: 2,
      incidentReports: 2,
      hygieneLogs: 1,
      releaseChecklists: 2,
      carerRecords: 2
    },
    mandatoryForms: ['wildlife-register', 'release-checklist', 'incident-report'],
    optionalForms: ['carer-licence'],
    distanceRequirements: {
      releaseDistance: 0,
      unit: 'km',
      enforced: false
    },
    vetRequirements: {
      signOffRequired: false,
      forJuveniles: false,
      forSpecificSpecies: []
    }
  },
  VIC: {
    enabledForms: ['releaseChecklist', 'incidentLog', 'hygieneLog', 'wildlifeRegister'],
    templates: ['VICRegister'],
    // DEECA Condition 21: release at the location found if suitable, otherwise the
    // closest suitable location within the animal's home range. There is no fixed
    // distance cap like ACT's 10km - "enforced: true" here means the *rule* is
    // enforced (home-range based), not that releaseDistance below is a hard limit.
    enforceReleaseDistance: true,
    requireVetSignOff: true,
    maxRetentionYears: 3,
    codeOfPractice: 'Wildlife Rehabilitator Authorisation Guide (DEECA, June 2023) - Wildlife Act 1975 s.28A',
    codeOfPracticeUrl: 'https://www.vic.gov.au/wildlife-rehabilitator-authorisation-guide',
    sections: VIC_COMPLIANCE_RULES,
    retentionRequirements: {
      animalRecords: 3,
      incidentReports: 3,
      hygieneLogs: 3,
      releaseChecklists: 3,
      carerRecords: 3
    },
    // Condition 23 makes the wildlife-register mandatory; release-checklist supports
    // Condition 21/22 fitness-for-release criteria; hygiene-log supports Conditions
    // 4-6, 15-18 (quarantine and enclosure hygiene); incident-report captures the
    // 24/48-hour notifications required by Conditions 7, 13, and 25.
    mandatoryForms: ['wildlife-register', 'release-checklist', 'hygiene-log', 'incident-report'],
    optionalForms: ['carer-licence'],
    distanceRequirements: {
      // No fixed km limit under DEECA - release must be at the found location if
      // suitable, or the closest suitable site within the animal's home range
      // (Condition 21). releaseDistance is left at 0 since it's not distance-capped;
      // "enforced: true" flags that a location-suitability rule still applies.
      releaseDistance: 0,
      unit: 'km',
      enforced: true
    },
    vetRequirements: {
      // Condition 6: quarantine release sign-off; Condition 10: euthanasia by vet
      // wherever practical; Condition 13: threatened (FFG Act) species need advice
      // logged from a vet or experienced rehabilitator on assessment.
      signOffRequired: true,
      forJuveniles: false,
      forSpecificSpecies: ['FFG Act threatened species']
    }
  },
  // National – no state-specific compliance rules but core platform features (release checklists) are enabled
  NATIONAL: {
    enabledForms: ['releaseChecklist'],
    templates: [],
    enforceReleaseDistance: false,
    requireVetSignOff: false,
    maxRetentionYears: 0,
    codeOfPractice: '',
    sections: [],
    retentionRequirements: {
      animalRecords: 0,
      incidentReports: 0,
      hygieneLogs: 0,
      releaseChecklists: 0,
      carerRecords: 0
    },
    mandatoryForms: ['release-checklist'],
    optionalForms: [],
    distanceRequirements: {
      releaseDistance: 0,
      unit: 'km',
      enforced: false
    },
    vetRequirements: {
      signOffRequired: false,
      forJuveniles: false,
      forSpecificSpecies: []
    }
  }
};

// Helper functions
export const getJurisdictionComplianceConfig = (jurisdiction: string): JurisdictionComplianceConfig => {
  return JURISDICTION_COMPLIANCE_CONFIGS[jurisdiction] || JURISDICTION_COMPLIANCE_CONFIGS['ACT'];
};

export const isComplianceRuleRequired = (ruleId: string, jurisdiction: string): boolean => {
  const config = getJurisdictionComplianceConfig(jurisdiction);
  const rule = config.sections
    .flatMap(section => section.rules)
    .find(rule => rule.id === ruleId);
  
  return rule?.required || false;
};

export const getComplianceRulesForJurisdiction = (jurisdiction: string): ComplianceRule[] => {
  const config = getJurisdictionComplianceConfig(jurisdiction);
  return config.sections.flatMap(section => section.rules);
};

export const getComplianceSectionsForJurisdiction = (jurisdiction: string): ComplianceSection[] => {
  const config = getJurisdictionComplianceConfig(jurisdiction);
  return config.sections;
};

export const isFormRequired = (formType: string, jurisdiction: string): boolean => {
  const config = getJurisdictionComplianceConfig(jurisdiction);
  return config.mandatoryForms.includes(formType);
};

export const isFormOptional = (formType: string, jurisdiction: string): boolean => {
  const config = getJurisdictionComplianceConfig(jurisdiction);
  return config.optionalForms.includes(formType);
};

export const getRetentionYears = (recordType: string, jurisdiction: string): number => {
  const config = getJurisdictionComplianceConfig(jurisdiction);
  const retentionMap: { [key: string]: number } = {
    'animal-records': config.retentionRequirements.animalRecords,
    'incident-reports': config.retentionRequirements.incidentReports,
    'hygiene-logs': config.retentionRequirements.hygieneLogs,
    'release-checklists': config.retentionRequirements.releaseChecklists,
    'carer-records': config.retentionRequirements.carerRecords
  };
  return retentionMap[recordType] || config.maxRetentionYears;
};

export const getComplianceRuleById = (ruleId: string, jurisdiction: string): ComplianceRule | undefined => {
  const config = getJurisdictionComplianceConfig(jurisdiction);
  return config.sections
    .flatMap(section => section.rules)
    .find(rule => rule.id === ruleId);
};

export const getComplianceRulesByCategory = (category: string, jurisdiction: string): ComplianceRule[] => {
  const config = getJurisdictionComplianceConfig(jurisdiction);
  return config.sections
    .flatMap(section => section.rules)
    .filter(rule => rule.category === category);
};

export const getComplianceRulesByFormType = (formType: string, jurisdiction: string): ComplianceRule[] => {
  const config = getJurisdictionComplianceConfig(jurisdiction);
  return config.sections
    .flatMap(section => section.rules)
    .filter(rule => rule.formType === formType);
};

export const getRequiredComplianceRules = (jurisdiction: string): ComplianceRule[] => {
  const config = getJurisdictionComplianceConfig(jurisdiction);
  return config.sections
    .flatMap(section => section.rules)
    .filter(rule => rule.required);
};

export const getOptionalComplianceRules = (jurisdiction: string): ComplianceRule[] => {
  const config = getJurisdictionComplianceConfig(jurisdiction);
  return config.sections
    .flatMap(section => section.rules)
    .filter(rule => !rule.required);
}; 