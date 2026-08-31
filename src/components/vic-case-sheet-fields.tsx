"use client";

import * as React from "react";
import type { Control } from "react-hook-form";
import { Info } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  VIC_CAUSE_CODES,
  VIC_FATE_CODES,
  VIC_FATE_REQUIRES_APPROVAL,
  VIC_INJURY_CODES,
  getVicAgeCodesForGroup,
  type VicAnimalGroup,
} from "@/lib/vic-picklists";
import { lookupVicSpeciesCode } from "@/lib/vic-species-codes";

/**
 * DEECA Wildlife Shelter Record Sheet fields for Victorian shelters.
 *
 * Renders the coded columns required by Condition 23 of the Wildlife
 * Rehabilitator Authorisation Guide: AGE, INJURY, CAUSE, STATUS (fate), and
 * the GPS/Melways reference that supplements the FOUND column.
 *
 * Other record sheet columns are already captured elsewhere on the animal
 * form and are not duplicated here:
 *   CASE NUMBER  -> orgAnimalId
 *   COMMON NAME  -> species
 *   SPECIES CODE -> derived from species at export time (Wildlife Code Book)
 *   DATE IN      -> dateFound / dateAdmitted
 *   SEX          -> sex
 *   FOUND        -> rescueLocation / rescueAddress (+ vicFoundRef here)
 *   DATE OUT     -> outcomeDate / dateReleased
 *   NOTES        -> notes / releaseNotes
 */

interface VicCaseSheetFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
  /** Current species value, used to preview the derived DEECA species code. */
  species?: string;
}

/**
 * DEECA uses different age-class code sets for birds, mammals, and
 * reptiles/amphibians. Infer the group from the species' code range in the
 * Wildlife Code Book: 1xxx = mammals, 2xxx/3xxx = reptiles & amphibians,
 * and the remaining (low, 1-999) codes = birds.
 */
function inferAnimalGroup(species?: string): VicAnimalGroup | null {
  if (!species) return null;
  const code = lookupVicSpeciesCode(species);
  if (!code) return null;
  const numeric = parseInt(code, 10);
  if (Number.isNaN(numeric)) return null;
  if (numeric >= 1000 && numeric < 2000) return "mammal";
  if (numeric >= 2000 && numeric < 4000) return "reptile-amphibian";
  return "bird";
}

const GROUP_LABELS: Record<VicAnimalGroup, string> = {
  bird: "bird",
  mammal: "mammal",
  "reptile-amphibian": "reptile/amphibian",
};

export function VicCaseSheetFields({ control, species }: VicCaseSheetFieldsProps) {
  const group = inferAnimalGroup(species);
  const speciesCode = species ? lookupVicSpeciesCode(species) : undefined;

  // If we can't infer the group, offer every age code so the carer is never
  // blocked from recording a value. Codes are unique across groups except
  // where DEECA intends them to be.
  const ageOptions = group
    ? getVicAgeCodesForGroup(group)
    : [
        ...getVicAgeCodesForGroup("bird"),
        ...getVicAgeCodesForGroup("mammal"),
        ...getVicAgeCodesForGroup("reptile-amphibian"),
      ];

  return (
    <div className="rounded-md border p-4 space-y-4">
      <div>
        <h4 className="font-medium">Wildlife Shelter Record Sheet (DEECA)</h4>
        <p className="text-sm text-muted-foreground">
          Codes required on your Victorian shelter record sheet. Records must be
          kept for 3 years and produced to a Conservation Regulator Authorised
          Officer on request.
        </p>
      </div>

      {/* Derived species code preview - not an input, since it comes from the
          Wildlife Code Book rather than carer entry. */}
      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        {speciesCode ? (
          <span>
            DEECA species code for {species}: <strong>{speciesCode}</strong>
            {group ? ` (${GROUP_LABELS[group]} age codes shown below)` : null}
          </span>
        ) : (
          <span>
            No DEECA species code matched
            {species ? ` "${species}"` : ""}. The Species Code column will be
            left blank on export, which is correct for unidentified species -
            otherwise check the latest Wildlife Code Book.
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* AGE */}
        <FormField
          control={control}
          name="vicAgeCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age class</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age class" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ageOptions.map((opt) => (
                    <SelectItem key={`age-${opt.code}`} value={opt.code}>
                      {opt.code} - {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                If the animal has young, record the age of the parent only.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* INJURY */}
        <FormField
          control={control}
          name="vicInjuryCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Injury</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select major injury" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VIC_INJURY_CODES.map((opt) => (
                    <SelectItem key={`injury-${opt.code}`} value={opt.code}>
                      {opt.code} - {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Record only the most serious injury if there is more than one.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CAUSE */}
        <FormField
          control={control}
          name="vicCauseCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cause of injury</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cause" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VIC_CAUSE_CODES.map((opt) => (
                    <SelectItem key={`cause-${opt.code}`} value={opt.code}>
                      {opt.code} - {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* FATE / STATUS */}
        <FormField
          control={control}
          name="vicFateCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fate / status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome (once known)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VIC_FATE_CODES.map((opt) => (
                    <SelectItem key={`fate-${opt.code}`} value={opt.code}>
                      {opt.code} - {opt.label}
                      {VIC_FATE_REQUIRES_APPROVAL.has(opt.code) ? " *" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {field.value && VIC_FATE_REQUIRES_APPROVAL.has(field.value) ? (
                  <span className="text-amber-700 dark:text-amber-500">
                    * This transfer type requires prior DEECA approval.
                  </span>
                ) : (
                  "Leave blank until the animal is permanently disposed of."
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* FOUND reference */}
      <FormField
        control={control}
        name="vicFoundRef"
        render={({ field }) => (
          <FormItem>
            <FormLabel>GPS coordinates or Melways reference</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. -37.8136, 144.9631 or Melway 43 G7"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormDescription>
              Recorded alongside the rescue location so the animal can be
              released where it was found (Condition 21).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
