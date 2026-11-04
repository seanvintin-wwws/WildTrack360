"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { GrowthMeasurementForm } from "./growth-measurement-form";
import { GrowthChart } from "./growth-chart";
import { GrowthHistoryTable } from "./growth-history-table";
import { BirthDateEstimator } from "./birth-date-estimator";
import type { GrowthReferencePoint } from "@/lib/growth-utils";
import type { GrowthMeasurement } from "@prisma/client";
import type { Animal } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GrowthChartMetric } from "./growth-chart";
import { PINSON_CHART_SOURCE, pinsonAgesSpecies, pinsonReference } from "@/lib/pinson-ghff-chart";
import {
  WOMBAROO_CHART_SOURCE,
  wombarooChartAppliesTo,
  wombarooReference,
} from "@/lib/wombaroo-ghff-chart";

/** Chart to compare against. Pinson and Wombaroo cover Grey-headed only. */
type CompareAgainst = "pinson" | "wombaroo" | "deeca";
const CURVE_NAME: Record<CompareAgainst, string> = {
  pinson: "Pinson chart",
  wombaroo: "Wombaroo chart",
  deeca: "DEECA",
};

interface GrowthTabProps {
  animal: Animal;
  initialMeasurements: GrowthMeasurement[];
  speciesSubtype?: string | null;
  onAnimalUpdate?: (updated: Animal) => void;
}

export function GrowthTab({
  animal,
  initialMeasurements,
  speciesSubtype,
  onAnimalUpdate,
}: GrowthTabProps) {
  const [measurements, setMeasurements] =
    useState<GrowthMeasurement[]>(initialMeasurements);
  const [referenceData, setReferenceData] = useState<GrowthReferencePoint[]>([]);
  const [hasReferenceData, setHasReferenceData] = useState(false);
  const { toast } = useToast();
  // Default to Pinson for Grey-headed (the shelter feeds goat's milk on
  // Pinson's chart); every other species uses its stored (DEECA) reference.
  const chartsApply = pinsonAgesSpecies(animal.species) && wombarooChartAppliesTo(animal.species);
  const [compareAgainst, setCompareAgainst] = useState<CompareAgainst>("pinson");
  const [metric, setMetric] = useState<GrowthChartMetric>("weightGrams");
  const effective: CompareAgainst = chartsApply ? compareAgainst : "deeca";

  const deecaSource = useMemo(() => {
    const sources = new Set(
      referenceData
        .map((r) => (r as GrowthReferencePoint & { reference?: string | null }).reference)
        .filter(Boolean)
    );
    return sources.size > 0 ? Array.from(sources).join("; ") : null;
  }, [referenceData]);

  const chartReference = useMemo<GrowthReferencePoint[]>(
    () =>
      effective === "pinson"
        ? pinsonReference()
        : effective === "wombaroo"
          ? wombarooReference()
          : referenceData,
    [effective, referenceData]
  );
  const chartSource =
    effective === "pinson"
      ? PINSON_CHART_SOURCE
      : effective === "wombaroo"
        ? WOMBAROO_CHART_SOURCE
        : deecaSource;

  // Fetch reference data for this species
  useEffect(() => {
    async function fetchReferenceData() {
      if (!animal.species) return;
      try {
        const sex = animal.sex || "Female";
        const res = await fetch(
          `/api/growth-references?speciesName=${encodeURIComponent(animal.species)}&sex=${encodeURIComponent(sex)}`
        );
        if (res.ok) {
          const data = await res.json();
          setReferenceData(data);
          setHasReferenceData(data.length > 0);
        }
      } catch {
        // Silently fail - reference data is optional
      }
    }
    fetchReferenceData();
  }, [animal.species, animal.sex]);

  const refreshMeasurements = useCallback(async () => {
    try {
      const res = await fetch(`/api/animals/${animal.id}/growth`);
      if (res.ok) {
        const data = await res.json();
        setMeasurements(data);
      }
    } catch {
      // Silent fail
    }
  }, [animal.id]);

  const handleDelete = useCallback(
    async (measurementId: string) => {
      try {
        const res = await fetch(
          `/api/animals/${animal.id}/growth/${measurementId}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error();
        setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));
        toast({ title: "Deleted", description: "Measurement removed." });
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete measurement.",
          variant: "destructive",
        });
      }
    },
    [animal.id, toast]
  );

  const dateOfBirth = animal.dateOfBirth ? new Date(animal.dateOfBirth) : null;

  return (
    <div className="space-y-6">
      {/* Birth date estimator - shown when DOB is unknown and species has reference data */}
      {!dateOfBirth && hasReferenceData && (
        <BirthDateEstimator
          animal={animal}
          referenceData={referenceData}
          onBirthDateSet={onAnimalUpdate}
        />
      )}

      {/* Growth chart */}
      <GrowthChart
        measurements={measurements}
        referenceData={chartReference}
        dateOfBirth={dateOfBirth}
        metric={metric}
        curveName={CURVE_NAME[effective]}
        referenceSource={chartSource}
        controls={
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={metric} onValueChange={(v) => setMetric(v as GrowthChartMetric)}>
              <TabsList>
                <TabsTrigger value="weightGrams">Weight</TabsTrigger>
                <TabsTrigger value="armLengthMm">Forearm</TabsTrigger>
              </TabsList>
            </Tabs>
            {chartsApply && (
              <Tabs value={compareAgainst} onValueChange={(v) => setCompareAgainst(v as CompareAgainst)}>
                <TabsList>
                  <TabsTrigger value="pinson">Pinson</TabsTrigger>
                  <TabsTrigger value="wombaroo">Wombaroo</TabsTrigger>
                  <TabsTrigger value="deeca">DEECA</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
        }
      />

      {/* Growth history table */}
      <GrowthHistoryTable
        measurements={measurements}
        referenceData={chartReference}
        wfaAgainst={CURVE_NAME[effective]}
        dateOfBirth={dateOfBirth}
        onDelete={handleDelete}
      />

      {/* Add measurement form */}
      <GrowthMeasurementForm
        animalId={animal.id}
        speciesSubtype={speciesSubtype}
        onMeasurementAdd={refreshMeasurements}
      />
    </div>
  );
}
