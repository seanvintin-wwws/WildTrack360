"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { rankSpeciesMatches, excludedByAuthorisation } from "@/lib/species-search";

// A searchable species picker. Search is deliberately forgiving (see
// src/lib/species-search.ts); selection is not — the value handed back is
// always one of the supplied options, never what was typed. That string feeds
// lookupVicSpeciesCode() and therefore the SPECIES CODE column on the
// Wildlife Shelter Record Sheet.

interface SpeciesOption {
  value: string;
  label: string;
  name: string;
  type?: string;
  scientificName?: string;
}

interface SpeciesComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  onSpeciesSelect?: (species: { name: string; scientificName?: string; type?: string }) => void;
  placeholder?: string;
  species?: Array<{ name: string; scientificName?: string | null; type?: string | null }>;
  /**
   * Options pinned to the bottom of the list regardless of ranking, for
   * escape hatches like "Species not listed".
   */
  extraOptions?: Array<{ value: string; label: string }>;
  /** Species already admitted by this shelter, most recent first. */
  recentSpecies?: string[];
  /**
   * Hide species excluded by Condition 1 of the DEECA authorisation. The
   * shelter must not acquire them, so there is no admission to record.
   */
  excludeUnauthorised?: boolean;
  disabled?: boolean;
  id?: string;
}

const GROUPS = ["Mammal", "Bird", "Reptile", "Amphibian"] as const;

export function SpeciesCombobox({
  value,
  onValueChange,
  onSpeciesSelect,
  placeholder = "Select species...",
  species = [],
  extraOptions = [],
  recentSpecies = [],
  excludeUnauthorised = false,
  disabled = false,
  id,
}: SpeciesComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [highlighted, setHighlighted] = React.useState(0);
  const [group, setGroup] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const speciesOptions: SpeciesOption[] = React.useMemo(
    () =>
      species.map((s) => ({
        value: s.name,
        label: s.name,
        name: s.name,
        type: s.type || undefined,
        scientificName: s.scientificName || undefined,
      })),
    [species]
  );

  // Only offer a group chip if the data actually has species of that type.
  // The seeded list may have Species.type unset, in which case no chips show
  // rather than showing four buttons that all return nothing.
  const availableGroups = React.useMemo(() => {
    const present = new Set(
      speciesOptions.map((o) => (o.type ?? "").toLowerCase())
    );
    return GROUPS.filter((g) => present.has(g.toLowerCase()));
  }, [speciesOptions]);

  const extras: SpeciesOption[] = React.useMemo(
    () =>
      extraOptions.map((o) => ({
        value: o.value,
        label: o.label,
        name: o.label,
      })),
    [extraOptions]
  );

  // rankSpeciesMatches sorts by match quality then alphabetically, and
  // flattens hyphens and case, so "grey headed" finds "Grey-headed Flying
  // Fox" and "possum" puts the possums at the top rather than wherever the
  // alphabet leaves them. Extras stay pinned below the real species.
  const filteredOptions = React.useMemo(
    () => [
      ...rankSpeciesMatches(speciesOptions, searchValue, {
        recentNames: recentSpecies,
        type: group,
        excludeUnauthorised,
      }),
      // Extras ("Species not listed") are pinned below and are never filtered
      // by group — hiding the escape hatch behind a chip would strand anyone
      // whose species genuinely is not in the list.
      ...(group ? [] : rankSpeciesMatches(extras, searchValue)),
    ],
    [speciesOptions, extras, searchValue, recentSpecies, group, excludeUnauthorised]
  );

  // When a search finds nothing, say whether it is because the species sits
  // outside the authorisation. A silently absent species looks like missing
  // data; naming the reason tells the carer this is deliberate.
  const exclusionReason = React.useMemo(() => {
    if (!excludeUnauthorised || searchValue.trim() === "") return null;
    return excludedByAuthorisation(searchValue);
  }, [excludeUnauthorised, searchValue]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  React.useEffect(() => {
    if (open) {
      setSearchValue("");
      setHighlighted(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Typing changes the list under the cursor, so reset to the best match.
  React.useEffect(() => setHighlighted(0), [searchValue, group]);

  React.useEffect(() => {
    listRef.current
      ?.querySelector('[data-highlighted="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [highlighted]);

  const handleSelect = (option: SpeciesOption) => {
    onSpeciesSelect?.({
      name: option.label,
      scientificName: option.scientificName,
      type: option.type,
    });
    onValueChange(option.value);
    setOpen(false);
    setSearchValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, filteredOptions.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      // Enter must never commit free text: without a highlighted option there
      // is nothing valid to select, so do nothing.
      e.preventDefault();
      const option = filteredOptions[highlighted];
      if (option) handleSelect(option);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex w-full items-center gap-1">
        <Button
          type="button"
          variant="outline"
          role="combobox"
          id={id}
          disabled={disabled}
          aria-expanded={open}
          className="w-full justify-between text-left font-normal"
          onClick={() => setOpen(!open)}
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
        {value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Clear species"
            title="Clear species"
            className="h-9 w-9 shrink-0"
            onClick={() => {
              onValueChange("");
              setSearchValue("");
              setOpen(false);
            }}
          >
            <X className="h-4 w-4 opacity-70" />
          </Button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
          <div className="mb-2 flex items-center border-b pb-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type to search, e.g. possum"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="h-8 flex-1 border-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {searchValue && (
              <button
                type="button"
                aria-label="Clear search"
                className="ml-1 rounded-sm p-1 opacity-60 hover:opacity-100"
                onClick={() => {
                  setSearchValue("");
                  inputRef.current?.focus();
                }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {availableGroups.length > 1 && (
            <div className="mb-2 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setGroup(null)}
                aria-pressed={group === null}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs",
                  group === null
                    ? "border-primary bg-primary/10 font-medium"
                    : "border-border opacity-70 hover:opacity-100"
                )}
              >
                All
              </button>
              {availableGroups.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroup(group === g ? null : g)}
                  aria-pressed={group === g}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs",
                    group === g
                      ? "border-primary bg-primary/10 font-medium"
                      : "border-border opacity-70 hover:opacity-100"
                  )}
                >
                  {g}s
                </button>
              ))}
            </div>
          )}

          <div ref={listRef} className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              <div className="space-y-1">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {filteredOptions.length} match
                  {filteredOptions.length === 1 ? "" : "es"}
                </p>
                {filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    data-highlighted={index === highlighted}
                    onMouseEnter={() => setHighlighted(index)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none",
                      index === highlighted && "bg-primary/10"
                    )}
                    onClick={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 flex-shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex min-w-0 flex-1 flex-col items-start">
                      <span className="text-sm font-medium">{option.label}</span>
                      {option.scientificName && (
                        <span className="truncate text-xs italic opacity-70">
                          {option.scientificName}
                        </span>
                      )}
                      {option.type && (
                        <span className="text-xs capitalize opacity-60">
                          {option.type}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm">
                {exclusionReason ? (
                  <>
                    <p className="font-medium text-foreground">
                      Not covered by your authorisation
                    </p>
                    <p className="mt-1 text-foreground/70">
                      Condition 1 excludes {exclusionReason}. Contact DEECA on
                      136 186 for advice on where the animal should go.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-foreground">No species found</p>
                    <p className="mt-1 text-foreground/70">
                      {group
                        ? `Nothing matching in ${group}s — try All`
                        : "Try fewer words, or a different part of the name"}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
