/**
 * DEECA Wildlife Shelter Record Sheet codes for Victoria.
 *
 * Source: "Species Code" document (age class, injury, cause of injury, and
 * fate/status codes) published alongside the Wildlife Shelter Record Sheet at
 * https://www.vic.gov.au/wildlife-rehabilitation-shelters-and-foster-carers
 * (https://www.vic.gov.au/sites/default/files/2020-12/Species_Code.doc)
 *
 * These are the exact codes DEECA/Conservation Regulator officers expect to
 * see on a Wildlife Shelter Record Sheet (Condition 23 of the Wildlife
 * Rehabilitator Authorisation). Species codes themselves live in
 * vic-species-codes.ts (sourced from the companion Wildlife Code Book).
 */

export type VicAnimalGroup = 'bird' | 'mammal' | 'reptile-amphibian';

export interface VicCodeOption {
  code: string;
  label: string;
  description?: string;
}

// ─── AGE CLASS ───────────────────────────────────────────────────────────
// Codes differ by animal group.
export const VIC_AGE_CODES: Record<VicAnimalGroup, VicCodeOption[]> = {
  bird: [
    { code: 'C', label: 'Chick', description: 'Young bird which cannot fly (nestling)' },
    { code: 'J', label: 'Juvenile', description: 'Young bird, fully feathered (up to 12 months)' },
    { code: 'M', label: 'Mature', description: 'Adult, or bird of unknown age' },
  ],
  mammal: [
    { code: 'P', label: 'Pouch young', description: 'Not yet weaned' },
    { code: 'D', label: 'Dependent young', description: 'On back or at heel, but not weaned' },
    { code: 'S', label: 'Subadult', description: 'Weaned, not fully grown, still dependent' },
    { code: 'A', label: 'Adult', description: 'Fully grown, or of unknown age' },
  ],
  'reptile-amphibian': [
    { code: 'H', label: 'Hatchling', description: 'Young snake, turtle, or lizard' },
    { code: 'O', label: 'Other', description: 'All other age classes - includes adults and unknowns' },
  ],
};

// ─── INJURY (single letter code - most serious injury if multiple) ────────
export const VIC_INJURY_CODES: VicCodeOption[] = [
  { code: 'A', label: 'Abrasions/cuts; broken/damaged limb(s)' },
  { code: 'B', label: 'Burnt / electrocuted' },
  { code: 'C', label: 'Concussion' },
  { code: 'D', label: 'Dead on arrival' },
  { code: 'F', label: 'Paralysed / severe nerve damage' },
  { code: 'K', label: 'Shock (capture myopathy or other stress)' },
  { code: 'M', label: 'Malnourished / starving' },
  { code: 'N', label: 'Not injured' },
  { code: 'O', label: 'Orphaned' },
  { code: 'P', label: 'Poisoning' },
  { code: 'S', label: 'Sick / diseased' },
  { code: 'U', label: 'Unknown' },
  { code: 'W', label: 'Water logged / drowned' },
  { code: 'X', label: 'None of the above' },
];

// ─── CAUSE OF INJURY (double-digit code) ──────────────────────────────────
export const VIC_CAUSE_CODES: VicCodeOption[] = [
  { code: '00', label: 'Unknown' },
  { code: '01', label: 'Trapped in cage-trap (e.g. possum trap)' },
  { code: '02', label: 'Caught accidentally (e.g. in chimney, building, drain, pool)' },
  { code: '03', label: 'Caught in fishing line, tackle or plastics' },
  { code: '04', label: 'Loss of habitat (e.g. due to logging)' },
  { code: '05', label: 'Human interference (e.g. unnecessary rescue)' },
  { code: '06', label: 'Human interference (e.g. cruelty)' },
  { code: '07', label: 'Fire / lightning strike' },
  { code: '08', label: 'Found (e.g. in produce box or plant pot)' },
  { code: '09', label: 'Stranded (e.g. flood, fire, beach, stranding)' },
  { code: '10', label: 'Attack by other or unknown animal' },
  { code: '11', label: 'Attack by domestic or wild dog' },
  { code: '12', label: 'Attack by domestic, stray or feral cat' },
  { code: '13', label: 'Attack by fox' },
  { code: '20', label: 'Contamination (e.g. oil spill, pollutants)' },
  { code: '21', label: 'Poisoned - bait taken or unknown chemical' },
  { code: '22', label: 'Infection, bacterial or viral (e.g. Chlamydia or botulism)' },
  { code: '30', label: 'Found exhausted' },
  { code: '31', label: 'Old age' },
  { code: '40', label: 'Nestling / pouch young found out of nest or abandoned' },
  { code: '41', label: 'Escapee (e.g. tame animal)' },
  { code: '50', label: 'Collided with window' },
  { code: '51', label: 'Collided with moving vehicle' },
  { code: '52', label: 'Collided with pole, wire fence, overhead wires' },
  { code: '53', label: 'Found adjacent to road (accident not observed)' },
  { code: '60', label: 'Shot (firearms)' },
  { code: '61', label: 'Shot (includes spears and arrows)' },
  { code: '66', label: 'None of the above' },
];

// ─── FATE (STATUS) - grouped: died / transferred / released ───────────────
export const VIC_FATE_CODES: VicCodeOption[] = [
  { code: '70', label: 'Death by euthanasia' },
  { code: '71', label: 'Death by injuries / other causes' },
  { code: '80', label: 'Released alive at location found' },
  { code: '81', label: 'Released alive, not at location found' },
  { code: '82', label: 'Escaped / stolen' },
  { code: '90', label: 'Transferred to other shelter' },
  { code: '91', label: 'Transferred to government zoo', description: 'Requires prior DEECA approval' },
  { code: '92', label: 'Transferred to captive breeding/study program', description: 'Requires prior DEECA approval' },
  { code: '93', label: 'Transferred to wildlife licensee', description: 'Requires prior DEECA approval' },
];

export const VIC_FATE_CATEGORY: Record<string, 'died' | 'transferred' | 'released' | 'other'> = {
  '70': 'died',
  '71': 'died',
  '80': 'released',
  '81': 'released',
  '82': 'other',
  '90': 'transferred',
  '91': 'transferred',
  '92': 'transferred',
  '93': 'transferred',
};

export const VIC_FATE_REQUIRES_APPROVAL = new Set(['91', '92', '93']);

export function getVicAgeCodesForGroup(group: VicAnimalGroup): VicCodeOption[] {
  return VIC_AGE_CODES[group];
}

export function lookupVicInjuryLabel(code: string): string | undefined {
  return VIC_INJURY_CODES.find((c) => c.code === code)?.label;
}

export function lookupVicCauseLabel(code: string): string | undefined {
  return VIC_CAUSE_CODES.find((c) => c.code === code)?.label;
}

export function lookupVicFateLabel(code: string): string | undefined {
  return VIC_FATE_CODES.find((c) => c.code === code)?.label;
}
