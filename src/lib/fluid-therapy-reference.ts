/**
 * Rehydration fluid selection reference.
 *
 * SOURCE
 * Thomas, M. "Getting to know rehydration therapies", Animalia Wildlife
 * Shelter. Presented to the Australian Wildlife Rehabilitation Conference,
 * South Australia, June 2010, with assistance and funding from the Department
 * of Sustainability and Environment, Victoria.
 *
 * WHAT THIS IS, AND WHAT IT IS NOT
 * This is a fluid SELECTION guide. The source paper contains no doses, no
 * volumes and no infusion rates, so neither does this module. Nothing here
 * tells a carer how much to give.
 *
 * The problem the paper addresses is a real and specific one: rehabilitators
 * are donated bags of IV solutions by vets and hospitals, accept whatever is
 * offered, and frequently do not know what the different solutions do. The
 * consequences of choosing wrongly can be severe. So the useful thing to
 * encode is which fluids are safe, and which are actively dangerous in which
 * circumstances.
 *
 * The paper's own conclusion is the safety default this module leads with:
 * in almost all cases the safest rehydration therapy is 0.9% saline, and for
 * carers administering subcutaneous fluids it should be the only choice.
 * Anything else needs a veterinarian, who can run serum and plasma
 * biochemistry and advise on the results.
 *
 * CALIBRATION NOTE FOR MAINTAINERS
 * This is a 2010 conference paper by an experienced shelter operator, drawing
 * on a human nursing text. It is carer education, not a veterinary formulary,
 * and the paper itself says to build a relationship with a vet who understands
 * wildlife. Treat it accordingly: good for "should I be using this bag at
 * all", not a substitute for veterinary direction.
 */

export type Tonicity = 'isotonic' | 'hypotonic' | 'hypertonic';

export interface FluidProfile {
  id: string;
  name: string;
  alsoKnownAs?: string[];
  tonicity: Tonicity;
  /** Situations the paper lists this fluid as being used for. */
  indications: string[];
  /** Situations the paper warns against. These are the reason this exists. */
  cautions: string[];
  /** Absolute "do not use" statements from the paper. */
  doNotUse: string[];
  /** True only for the fluid the paper nominates as the carer default. */
  carerSafeDefault: boolean;
  notes?: string[];
}

export const FLUID_PROFILES: FluidProfile[] = [
  {
    id: 'normal-saline',
    name: '0.9% sodium chloride',
    alsoKnownAs: ['Normal saline', 'NS'],
    tonicity: 'isotonic',
    indications: [
      'Shock',
      'Hyponatraemia',
      'Blood transfusions',
      'Resuscitation',
      'Fluid challenges',
      'Metabolic alkalosis',
      'Hypocalcaemia',
      'Fluid replacement in diabetic ketoacidosis',
    ],
    cautions: [],
    doNotUse: [
      'Congestive heart failure — replaces extracellular fluid and can lead to overload',
      'Oedema',
      'Hypernatraemia',
    ],
    carerSafeDefault: true,
    notes: [
      'The paper names this as the safest rehydration therapy in almost all cases, and the only choice for carers giving subcutaneous fluids.',
    ],
  },
  {
    id: 'dextrose-5-water',
    name: '5% dextrose in water',
    alsoKnownAs: ['D5W'],
    tonicity: 'isotonic',
    indications: ['Fluid loss and dehydration', 'Hypernatraemia'],
    cautions: [
      'Isotonic in the bag, but becomes hypotonic once the dextrose is metabolised',
      'Use cautiously where renal failure or cardiac issues may be present — can cause fluid overload',
      'Does not provide enough daily calories for prolonged use, and may eventually cause protein breakdown',
    ],
    doNotUse: ['Resuscitation — can cause hyperglycaemia'],
    carerSafeDefault: false,
  },
  {
    id: 'lactated-ringers',
    name: "Lactated Ringer's solution",
    alsoKnownAs: ['LR', 'RL', 'LRS', "Ringer's lactate"],
    tonicity: 'isotonic',
    indications: [
      'Lower GI tract fluid loss',
      'Acute blood loss',
      'Hypovolaemia due to third spacing',
    ],
    cautions: [
      'Electrolyte content is similar to serum but contains no magnesium',
      'Contains potassium',
      'Similar to but not identical to Hartmann\u2019s solution — the ionic concentrations differ',
      'In burns patients, not for the first few days',
    ],
    doNotUse: [
      'Renal failure, or anything expected to lead to it including severely dehydrated patients — can cause hypokalaemia',
      'Liver issues — the patient cannot metabolise lactate, which a functioning liver converts to bicarbonate',
    ],
    carerSafeDefault: false,
  },
  {
    id: 'hartmanns',
    name: "Hartmann's solution",
    alsoKnownAs: ['Compound sodium lactate', 'CSL'],
    tonicity: 'isotonic',
    indications: [
      'Replacing body fluid and mineral salts lost for a variety of reasons',
      'Especially where losses result in too much acid in the blood',
    ],
    cautions: [
      'Similar to but not identical to Lactated Ringer\u2019s — the ionic concentrations differ',
    ],
    doNotUse: [],
    carerSafeDefault: false,
  },
  {
    id: 'half-normal-saline',
    name: '0.45% sodium chloride',
    alsoKnownAs: ['Half normal saline'],
    tonicity: 'hypotonic',
    indications: [
      'Water replacement',
      'Hypertonic dehydration',
      'Sodium and chloride depletion',
      'Gastric fluid loss from vomiting',
    ],
    cautions: [
      'May cause cardiovascular collapse or increased intracranial pressure',
    ],
    doNotUse: ['Liver issues', 'Trauma', 'Burns'],
    carerSafeDefault: false,
  },
  {
    id: 'dextrose-5-half-normal-saline',
    name: '5% dextrose in 0.45% sodium chloride',
    tonicity: 'hypertonic',
    indications: [
      'Diabetic ketoacidosis, after initial treatment with normal saline and half normal saline',
      'Preventing hypoglycaemia and cerebral oedema where serum osmolality would otherwise fall too rapidly',
    ],
    cautions: [
      'Uses are quite specific and require close veterinary supervision',
      'Refer to species-specific serum and plasma biochemistry values before use',
    ],
    doNotUse: [],
    carerSafeDefault: false,
  },
  {
    id: 'dextrose-5-normal-saline',
    name: '5% dextrose in normal saline',
    tonicity: 'hypertonic',
    indications: [
      'Hypotonic dehydration',
      'Temporary treatment of circulatory insufficiency',
      'Syndrome of inappropriate antidiuretic hormone',
    ],
    cautions: [],
    doNotUse: [],
    carerSafeDefault: false,
  },
];

export const CARER_SUBCUT_GUIDANCE =
  'In almost all cases the safest rehydration therapy is 0.9% saline, and for carers administering subcutaneous fluids it should be the only choice. Any other fluid needs veterinary direction — a vet can run serum and plasma biochemistry and advise from the results.';

export const FLUID_REFERENCE_SOURCE =
  'Thomas, M. "Getting to know rehydration therapies", Animalia Wildlife Shelter. Australian Wildlife Rehabilitation Conference, South Australia, June 2010.';

export function getFluidProfile(id: string): FluidProfile | undefined {
  return FLUID_PROFILES.find((f) => f.id === id);
}

/**
 * Find a fluid by the name on the bag, including the abbreviations that
 * appear on donated stock. Matching is forgiving about punctuation and case,
 * because the point is helping a carer identify something handed to them.
 *
 * It is NOT forgiving about substrings of short abbreviations. Naive
 * containment matching resolves "Hartmanns" to normal saline, because "NS" is
 * a substring of "hartmaNNS" — which would tell a carer holding Hartmann's
 * that they were holding the one fluid the paper nominates as always safe.
 * Short abbreviations therefore require an exact match.
 */
function normaliseLabel(s: string): string {
  return s
    .toLowerCase()
    // Strip apostrophes rather than spacing them, so "Hartmann's" and
    // "Hartmanns" normalise identically. Carers type both.
    .replace(/['\u2018\u2019]/g, '')
    .replace(/[^a-z0-9%. ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const ABBREVIATION_MAX_LENGTH = 4;

export function identifyFluid(label: string): FluidProfile | undefined {
  const q = normaliseLabel(label);
  if (!q) return undefined;

  const candidates = FLUID_PROFILES.map((f) => ({
    fluid: f,
    names: [f.name, ...(f.alsoKnownAs ?? [])].map(normaliseLabel),
  }));

  // Exact match on any name or abbreviation.
  const exact = candidates.find((c) => c.names.includes(q));
  if (exact) return exact.fluid;

  // Otherwise allow containment, but only for names long enough that a
  // coincidental substring is implausible.
  const partial = candidates.find((c) =>
    c.names.some(
      (n) =>
        n.length > ABBREVIATION_MAX_LENGTH &&
        q.length > ABBREVIATION_MAX_LENGTH &&
        (q.includes(n) || n.includes(q))
    )
  );
  return partial?.fluid;
}

/** The fluid the paper nominates as the carer default. */
export function getCarerDefaultFluid(): FluidProfile {
  return FLUID_PROFILES.find((f) => f.carerSafeDefault)!;
}

/**
 * Contraindication check. Returns any "do not use" and caution statements
 * matching the patient's presenting conditions, so a carer holding a donated
 * bag can see immediately whether it is the wrong one.
 */
export interface FluidWarning {
  severity: 'do-not-use' | 'caution';
  text: string;
}

export function checkFluidAgainstConditions(
  fluid: FluidProfile,
  conditions: string[]
): FluidWarning[] {
  const warnings: FluidWarning[] = [];
  const normalised = conditions.map((c) => c.toLowerCase().trim()).filter(Boolean);

  for (const statement of fluid.doNotUse) {
    if (normalised.some((c) => statement.toLowerCase().includes(c))) {
      warnings.push({ severity: 'do-not-use', text: statement });
    }
  }
  for (const statement of fluid.cautions) {
    if (normalised.some((c) => statement.toLowerCase().includes(c))) {
      warnings.push({ severity: 'caution', text: statement });
    }
  }
  return warnings;
}
