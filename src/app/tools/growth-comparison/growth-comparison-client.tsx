"use client";

import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  COMPARISON_METRICS,
  type ComparisonAnimal,
  type ComparisonMetric,
  type GrowthStatus,
  type MetricComparison,
  type ReferenceRow,
  buildExpectedCurve,
  buildSeries,
  referenceForSex,
  resolveBirthDate,
  sexCurvesIdentical,
  summariseAnimal,
} from "@/lib/growth-comparison";
import {
  WOMBAROO_CHART_SOURCE,
  wombarooChartAppliesTo,
  wombarooReference,
} from "@/lib/wombaroo-ghff-chart";
import { PINSON_CHART_SOURCE, pinsonReference } from "@/lib/pinson-ghff-chart";

/**
 * Distinct, colour-blind-friendly hues (same set as the cohort chart), kept
 * clear of the green/amber/red used for status so a line colour is never read
 * as a judgement on that animal.
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
const EXPECTED_COLOUR = "#8b938d";
const WOMBAROO_COLOUR = "#5f9a6e";
const PINSON_COLOUR = "#b07a3f";

const STATUS_BADGE: Record<GrowthStatus, { label: string; variant: "success" | "warning" | "destructive" | "outline" }> = {
  normal: { label: "On track", variant: "success" },
  warning: { label: "Behind (>10%)", variant: "warning" },
  danger: { label: "Well behind (>20%)", variant: "destructive" },
  unknown: { label: "Not enough data", variant: "outline" },
};

interface Props {
  animalsBySpecies: Record<string, ComparisonAnimal[]>;
  references: Record<string, ReferenceRow[]>;
  defaultSpecies: string | null;
  today: string;
}

function label(a: ComparisonAnimal) {
  return a.orgAnimalId ? `${a.name} (${a.orgAnimalId.replace(/^.*-(\d+)$/, "$1")})` : a.name;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" });
}

function formatComparison(c: MetricComparison | null, unit: string) {
  if (!c) return <span className="text-muted-foreground">—</span>;
  const sign = c.difference > 0 ? "+" : "";
  return (
    <span>
      {c.actual} {unit}{" "}
      <span className="text-muted-foreground">
        vs {c.expected} ({sign}
        {c.percent}%)
      </span>
    </span>
  );
}

export default function GrowthComparisonClient({
  animalsBySpecies,
  references,
  defaultSpecies,
  today,
}: Props) {
  const speciesNames = Object.keys(animalsBySpecies).sort();
  const [species, setSpecies] = useState<string | null>(defaultSpecies);
  const [metric, setMetric] = useState<ComparisonMetric>("weightGrams");
  const [showExpected, setShowExpected] = useState(true);
  const [showWombaroo, setShowWombaroo] = useState(true);
  const [showPinson, setShowPinson] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(() => {
    const initial = defaultSpecies ? animalsBySpecies[defaultSpecies] ?? [] : [];
    const inCare = initial.filter((a) => a.status === "IN_CARE");
    return new Set((inCare.length > 0 ? inCare : initial).map((a) => a.id));
  });

  const animals = useMemo(
    () => (species ? animalsBySpecies[species] ?? [] : []),
    [animalsBySpecies, species]
  );
  const referenceRows = useMemo(
    () => (species ? references[species] ?? [] : []),
    [references, species]
  );
  const oneCurve = sexCurvesIdentical(referenceRows);
  const todayDate = useMemo(() => new Date(today), [today]);

  const prepared = useMemo(
    () =>
      animals.map((a, i) => {
        const ref = referenceForSex(referenceRows, a.sex);
        const birth = resolveBirthDate(a, ref);
        return {
          animal: a,
          colour: SERIES_COLOURS[i % SERIES_COLOURS.length],
          ref,
          birth,
          summary: summariseAnimal(a, ref, todayDate),
        };
      }),
    [animals, referenceRows, todayDate]
  );

  const { rows, plotted, expectedKeys } = useMemo(() => {
    const byAge = new Map<number, Record<string, number>>();
    const at = (age: number) => {
      let row = byAge.get(age);
      if (!row) {
        row = { ageDays: age };
        byAge.set(age, row);
      }
      return row;
    };

    const visible = prepared.filter((p) => selected.has(p.animal.id) && p.birth);
    let maxAge = 0;
    for (const p of visible) {
      for (const point of buildSeries(p.animal, p.birth!.date, metric)) {
        at(point.ageDays)[`a_${p.animal.id}`] = point.value;
        maxAge = Math.max(maxAge, point.ageDays);
      }
    }

    const keys: { key: string; name: string; colour: string; dash: string }[] = [];
    if (showExpected && referenceRows.length > 0) {
      const sexes = oneCurve
        ? [null]
        : Array.from(new Set(visible.map((p) => (p.animal.sex === "Male" || p.animal.sex === "Female" ? p.animal.sex : null))));
      for (const sex of sexes.length ? sexes : [null]) {
        const key = `expected_${sex ?? "all"}`;
        keys.push({
          key,
          name: sex ? `DEECA expected (${sex.toLowerCase()})` : "DEECA expected",
          colour: EXPECTED_COLOUR,
          dash: "6 4",
        });
        for (const point of buildExpectedCurve(referenceForSex(referenceRows, sex), metric, maxAge)) {
          at(point.ageDays)[key] = point.value;
        }
      }
    }

    if (showWombaroo && wombarooChartAppliesTo(species)) {
      keys.push({ key: "wombaroo", name: "Wombaroo chart", colour: WOMBAROO_COLOUR, dash: "2 3" });
      for (const point of buildExpectedCurve(wombarooReference(), metric, maxAge)) {
        at(point.ageDays).wombaroo = point.value;
      }
    }

    if (showPinson && wombarooChartAppliesTo(species)) {
      keys.push({ key: "pinson", name: "Pinson chart", colour: PINSON_COLOUR, dash: "10 3 2 3" });
      for (const point of buildExpectedCurve(pinsonReference(), metric, maxAge)) {
        at(point.ageDays).pinson = point.value;
      }
    }

    return {
      rows: Array.from(byAge.values()).sort((a, b) => a.ageDays - b.ageDays),
      plotted: visible,
      expectedKeys: keys,
    };
  }, [prepared, selected, metric, showExpected, showWombaroo, showPinson, species, referenceRows, oneCurve]);

  const unit = COMPARISON_METRICS[metric].unit;
  const referenceSource = referenceRows.find((r) => r.reference)?.reference ?? null;

  const changeSpecies = (s: string) => {
    setSpecies(s);
    const list = animalsBySpecies[s] ?? [];
    const inCare = list.filter((a) => a.status === "IN_CARE");
    setSelected(new Set((inCare.length > 0 ? inCare : list).map((a) => a.id)));
  };

  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  if (speciesNames.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          No animals have growth measurements yet for a species with a reference curve. Add
          weight or forearm measurements on an animal&apos;s Growth tab and they will appear here.
        </CardContent>
      </Card>
    );
  }

  const unaged = prepared.filter((p) => selected.has(p.animal.id) && !p.birth);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Select value={species ?? undefined} onValueChange={changeSpecies}>
          <SelectTrigger className="w-full sm:w-72" aria-label="Species">
            <SelectValue placeholder="Choose a species" />
          </SelectTrigger>
          <SelectContent>
            {speciesNames.map((s) => (
              <SelectItem key={s} value={s}>
                {s} ({animalsBySpecies[s].length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap items-center gap-4">
          <Tabs value={metric} onValueChange={(v) => setMetric(v as ComparisonMetric)}>
            <TabsList>
              <TabsTrigger value="weightGrams">Weight</TabsTrigger>
              <TabsTrigger value="armLengthMm">Forearm</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Switch id="show-expected" checked={showExpected} onCheckedChange={setShowExpected} />
            <Label htmlFor="show-expected">DEECA expected</Label>
          </div>
          {wombarooChartAppliesTo(species) && (
            <div className="flex items-center gap-2">
              <Switch id="show-wombaroo" checked={showWombaroo} onCheckedChange={setShowWombaroo} />
              <Label htmlFor="show-wombaroo">Wombaroo chart</Label>
            </div>
          )}
          {wombarooChartAppliesTo(species) && (
            <div className="flex items-center gap-2">
              <Switch id="show-pinson" checked={showPinson} onCheckedChange={setShowPinson} />
              <Label htmlFor="show-pinson">Pinson chart</Label>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <Card>
          <CardHeader>
            <CardTitle>
              {COMPARISON_METRICS[metric].label} for age — {species}
            </CardTitle>
            {referenceSource && showExpected && (
              <CardDescription>DEECA expected (grey dashes): {referenceSource}</CardDescription>
            )}
            {showWombaroo && wombarooChartAppliesTo(species) && (
              <CardDescription>Wombaroo chart (green dots): {WOMBAROO_CHART_SOURCE}</CardDescription>
            )}
            {showPinson && wombarooChartAppliesTo(species) && (
              <CardDescription>Pinson chart (brown dash-dot): {PINSON_CHART_SOURCE}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {plotted.length === 0 && expectedKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">Tick at least one animal to plot it.</p>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 24, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="ageDays"
                    type="number"
                    domain={[0, "dataMax"]}
                    allowDecimals={false}
                    label={{ value: "Age (days)", position: "insideBottom", offset: -12 }}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    label={{ value: `${COMPARISON_METRICS[metric].label} (${unit})`, angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} ${unit}`, name]}
                    labelFormatter={(age) => `Day ${age}`}
                  />
                  <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: 8 }} />
                  {expectedKeys.map(({ key, name, colour, dash }) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={name}
                      stroke={colour}
                      strokeDasharray={dash}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                  {plotted.map((p) => (
                    <Line
                      key={p.animal.id}
                      type="monotone"
                      dataKey={`a_${p.animal.id}`}
                      name={label(p.animal)}
                      stroke={p.colour}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Animals</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelected(new Set(animals.map((a) => a.id)))}
              >
                All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelected(new Set(animals.filter((a) => a.status === "IN_CARE").map((a) => a.id)))
                }
              >
                In care
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
                None
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {prepared.map((p) => (
              <label
                key={p.animal.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-muted"
              >
                <Checkbox
                  checked={selected.has(p.animal.id)}
                  onCheckedChange={(v) => toggle(p.animal.id, v === true)}
                />
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: p.colour }}
                  aria-hidden
                />
                <span className="flex-1">{label(p.animal)}</span>
                {p.animal.status !== "IN_CARE" && (
                  <span className="text-xs text-muted-foreground">
                    {p.animal.status.replace("_", " ").toLowerCase()}
                  </span>
                )}
              </label>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Latest measurement vs expected</CardTitle>
          <CardDescription>
            Expected values, WFA, GPD and status use the DEECA curve. Status uses weight, with the app&apos;s usual thresholds: more than 10% below
            expected is flagged, more than 20% is flagged red. A guide only — always read it
            alongside how the animal is feeding and behaving. WFA (weight for age) is
            actual weight minus expected weight for that age. GPD (grams per day) is the
            average daily weight gain over the most recent week of weigh-ins.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal</TableHead>
                <TableHead>Age today</TableHead>
                <TableHead>Last measured</TableHead>
                <TableHead>Weight vs expected</TableHead>
                <TableHead>Forearm vs expected</TableHead>
                <TableHead>WFA</TableHead>
                <TableHead>GPD</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prepared
                .filter((p) => selected.has(p.animal.id))
                .map(({ animal, summary, birth }) => {
                  const badge = STATUS_BADGE[summary.status];
                  const stillInCare = animal.status === "IN_CARE";
                  return (
                    <TableRow key={animal.id}>
                      <TableCell className="font-medium">{label(animal)}</TableCell>
                      <TableCell>
                        {stillInCare && summary.ageTodayDays != null ? (
                          <>
                            {summary.ageTodayDays} days
                            {birth?.estimated && (
                              <span className="block text-xs text-muted-foreground">
                                {birth.basis}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {summary.latestDate ? (
                          <>
                            {formatDate(summary.latestDate)}
                            <span className="block text-xs text-muted-foreground">
                              day {summary.latestAgeDays}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{formatComparison(summary.weight, "g")}</TableCell>
                      <TableCell>{formatComparison(summary.forearm, "mm")}</TableCell>
                      <TableCell className="whitespace-nowrap font-medium">
                        {summary.wfaGrams == null
                          ? "—"
                          : `${summary.wfaGrams > 0 ? "+" : ""}${summary.wfaGrams} g`}
                      </TableCell>
                      <TableCell>
                        {summary.gpd ? (
                          <>
                            <span className="whitespace-nowrap">{summary.gpd.actual} g/day</span>
                            <span className="block text-xs text-muted-foreground">
                              {summary.gpd.expected != null && `expected ${summary.gpd.expected} · `}
                              over {summary.gpd.days} {summary.gpd.days === 1 ? "day" : "days"}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">needs 2 weights</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Where an animal has no recorded date of birth, its age is estimated from its first
          forearm measurement (or first weight if no forearm was taken). That first forearm point
          therefore sits on the expected curve by design; weight and later forearm readings are the
          real comparison. Record a date of birth on the animal to override the estimate.
          {unaged.length > 0 &&
            ` ${unaged.length} ticked ${unaged.length === 1 ? "animal has" : "animals have"} no measurement to estimate an age from and ${unaged.length === 1 ? "is" : "are"} not plotted.`}
        </span>
      </p>
    </div>
  );
}
