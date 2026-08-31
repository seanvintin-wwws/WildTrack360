"use client";

import { useMemo } from "react";
import { Info } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type GrowthReferencePoint,
  calculatePredictedWeight,
} from "@/lib/growth-utils";
import type { GrowthMeasurement } from "@prisma/client";
import { differenceInDays } from "date-fns";

/**
 * Weight-for-age comparison across several animals of the same species.
 *
 * The single-animal GrowthChart answers "is this animal tracking?". This one
 * answers "how is this cohort doing relative to each other and to the
 * reference curve?" — useful when a shelter has taken in a group over one
 * season and wants to spot the individual falling behind.
 *
 * Animals with no date of birth are excluded rather than guessed at: without
 * a birth date there is no age axis to plot against, and inventing one would
 * put a misleading line on a chart carers use to make care decisions.
 */

export interface CohortAnimal {
  id: string;
  name: string;
  orgAnimalId?: string | null;
  dateOfBirth: Date | null;
  measurements: GrowthMeasurement[];
}

interface MultiAnimalGrowthChartProps {
  animals: CohortAnimal[];
  referenceData: GrowthReferencePoint[];
  species: string;
  /** Show the reference curve behind the animals. Defaults to true. */
  showReference?: boolean;
}

/**
 * Distinct, colour-blind-friendly hues. Deliberately not the app's status
 * colours (green/amber/red), so a line colour is never mistaken for a
 * judgement about that animal's condition.
 */
const SERIES_COLOURS = [
  "#1f77b4",
  "#8c564b",
  "#9467bd",
  "#17becf",
  "#e377c2",
  "#7f7f7f",
  "#2ca02c",
  "#bcbd22",
];

interface Row {
  ageDays: number;
  reference?: number;
  [animalKey: string]: number | undefined;
}

export function MultiAnimalGrowthChart({
  animals,
  referenceData,
  species,
  showReference = true,
}: MultiAnimalGrowthChartProps) {
  const plottable = useMemo(
    () =>
      animals.filter(
        (a) => a.dateOfBirth != null && a.measurements.some((m) => m.weightGrams != null)
      ),
    [animals]
  );

  const excludedCount = animals.length - plottable.length;

  const { rows, seriesKeys } = useMemo(() => {
    const byAge = new Map<number, Row>();

    const ensure = (ageDays: number): Row => {
      let row = byAge.get(ageDays);
      if (!row) {
        row = { ageDays };
        byAge.set(ageDays, row);
      }
      return row;
    };

    const keys: { key: string; label: string }[] = [];

    for (const animal of plottable) {
      const key = `a_${animal.id}`;
      keys.push({
        key,
        label: animal.orgAnimalId
          ? `${animal.name} (${animal.orgAnimalId})`
          : animal.name,
      });

      for (const m of animal.measurements) {
        if (m.weightGrams == null) continue;
        const ageDays = differenceInDays(
          new Date(m.date),
          new Date(animal.dateOfBirth as Date)
        );
        if (ageDays < 0) continue;
        ensure(ageDays)[key] = m.weightGrams;
      }
    }

    if (showReference && referenceData.length > 0) {
      const maxAge = Math.max(0, ...Array.from(byAge.keys()));
      for (let age = 0; age <= maxAge; age += Math.max(1, Math.round(maxAge / 40))) {
        const predicted = calculatePredictedWeight(referenceData, age);
        if (predicted != null) ensure(age).reference = predicted;
      }
    }

    return {
      rows: Array.from(byAge.values()).sort((a, b) => a.ageDays - b.ageDays),
      seriesKeys: keys,
    };
  }, [plottable, referenceData, showReference]);

  if (plottable.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight for age — {species}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No animals in this selection can be plotted. A comparison needs at
            least one animal with a date of birth and a recorded weight.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Weight for age — {species} ({plottable.length}{" "}
          {plottable.length === 1 ? "animal" : "animals"})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ageDays"
              type="number"
              domain={["dataMin", "dataMax"]}
              label={{ value: "Age (days)", position: "insideBottom", offset: -12 }}
            />
            <YAxis
              label={{ value: "Weight (g)", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [`${value} g`, name]}
              labelFormatter={(age) => `Day ${age}`}
            />
            <Legend verticalAlign="top" height={36} />

            {showReference && (
              <Line
                type="monotone"
                dataKey="reference"
                name="Expected"
                stroke="#6b7280"
                strokeDasharray="5 4"
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            )}

            {seriesKeys.map(({ key, label }, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={label}
                stroke={SERIES_COLOURS[i % SERIES_COLOURS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {excludedCount > 0 && (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {excludedCount}{" "}
              {excludedCount === 1 ? "animal is" : "animals are"} not shown —
              a date of birth and at least one recorded weight are needed to
              place an animal on the age axis.
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
