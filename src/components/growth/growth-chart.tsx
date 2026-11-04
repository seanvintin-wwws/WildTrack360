"use client";

import { useMemo, type ReactNode } from "react";
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
import { type GrowthReferencePoint, interpolateWithinRange } from "@/lib/growth-utils";
import type { GrowthMeasurement } from "@prisma/client";
import { differenceInDays } from "date-fns";

export type GrowthChartMetric = "weightGrams" | "armLengthMm";

const METRIC_META: Record<GrowthChartMetric, { label: string; unit: string; noun: string }> = {
  weightGrams: { label: "Weight (g)", unit: "g", noun: "weight" },
  armLengthMm: { label: "Forearm (mm)", unit: "mm", noun: "forearm" },
};

interface GrowthChartProps {
  measurements: GrowthMeasurement[];
  /** The expected curve to draw (already chosen: Pinson, Wombaroo or DEECA). */
  referenceData: GrowthReferencePoint[];
  dateOfBirth: Date | null;
  metric?: GrowthChartMetric;
  /** Legend name for the expected curve, e.g. "Pinson chart". */
  curveName?: string;
  /** Source line shown under the chart. */
  referenceSource?: string | null;
  /** Switches shown in the card header. */
  controls?: ReactNode;
}

interface ChartDataPoint {
  ageDays: number;
  actual?: number;
  predicted?: number;
}

export function GrowthChart({
  measurements,
  referenceData,
  dateOfBirth,
  metric = "weightGrams",
  curveName = "Expected",
  referenceSource = null,
  controls,
}: GrowthChartProps) {
  const meta = METRIC_META[metric];

  const chartData = useMemo(() => {
    if (!dateOfBirth) return [];

    const dob = new Date(dateOfBirth);
    const dataMap = new Map<number, ChartDataPoint>();
    const at = (age: number) => {
      let p = dataMap.get(age);
      if (!p) {
        p = { ageDays: age };
        dataMap.set(age, p);
      }
      return p;
    };

    // Actual measurements
    for (const m of measurements) {
      const v = m[metric];
      if (v == null) continue;
      const ageDays = differenceInDays(new Date(m.date), dob);
      if (ageDays < 0) continue;
      at(ageDays).actual = v;
    }

    // Expected curve, as printed
    for (const ref of referenceData) {
      const v = ref[metric];
      if (v == null) continue;
      at(ref.ageDays).predicted = v;
    }

    // Expected value at every other plotted age (for the hover box), only
    // inside the chart's own range
    for (const p of dataMap.values()) {
      if (p.predicted == null) {
        const v = interpolateWithinRange(referenceData, metric, p.ageDays);
        if (v != null) p.predicted = v;
      }
    }

    return Array.from(dataMap.values()).sort((a, b) => a.ageDays - b.ageDays);
  }, [measurements, referenceData, dateOfBirth, metric]);

  const hasActual = chartData.some((p) => p.actual != null);

  const header = (
    <CardHeader>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CardTitle>Growth Chart</CardTitle>
        {controls}
      </div>
    </CardHeader>
  );

  if (!dateOfBirth) {
    return (
      <Card>
        {header}
        <CardContent>
          <p className="text-sm text-muted-foreground">
            A date of birth is required to display the growth chart. Use the
            Birth Date Estimator below to estimate one.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!hasActual) {
    return (
      <Card>
        {header}
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No {meta.noun} measurements recorded yet. Add a growth measurement to see
            the chart.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {header}
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="ageDays"
              label={{ value: "Age (days)", position: "insideBottomRight", offset: -5 }}
            />
            <YAxis
              label={{
                value: meta.label,
                angle: -90,
                position: "insideLeft",
                offset: -5,
              }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `${Math.round(value * 10) / 10} ${meta.unit}`,
                name === "actual" ? "Actual" : curveName,
              ]}
              labelFormatter={(label) => `Age: ${label} days`}
            />
            <Legend
              formatter={(value) =>
                value === "actual" ? `Actual ${meta.noun}` : `${curveName} (expected ${meta.noun})`
              }
            />
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--chart-1, 221.2 83.2% 53.3%))"
              strokeWidth={2}
              dot={false}
              connectNulls
              name="predicted"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--chart-2, 0 84.2% 60.2%))"
              strokeWidth={2}
              dot={{ r: 4 }}
              connectNulls
              name="actual"
            />
          </LineChart>
        </ResponsiveContainer>
        {referenceSource && (
          <div className="flex items-start gap-1.5 mt-3 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Predicted growth curve source: {referenceSource}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
