"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import {
  calculateFlyingFoxFeed,
  FLYING_FOX_FORMULAS,
  FLYING_FOX_SPECIES,
  type FlyingFoxFormula,
  type FlyingFoxSpecies,
} from "@/lib/feed-calculators/flyingFox";
import {
  CHART_FORMULAS,
  calculateChartFeed,
  isChartFormula,
  type ChartFormula,
} from "@/lib/feed-calculators/flyingFoxChart";

type InputMode = "age" | "forearm";

export function FlyingFoxCalculator() {
  const [species, setSpecies] = useState<FlyingFoxSpecies>("grey-headed");
  const [formula, setFormula] = useState<FlyingFoxFormula | ChartFormula>(
    "biolac-flying-fox"
  );
  const [weightG, setWeightG] = useState<string>("");
  const [mode, setMode] = useState<InputMode>("age");
  const [ageDays, setAgeDays] = useState<string>("");
  const [forearmMm, setForearmMm] = useState<string>("");

  const chartPlan = useMemo(() => {
    if (!isChartFormula(formula) || weightG === "") return null;
    return calculateChartFeed({ formula, bodyWeightGrams: Number(weightG), species });
  }, [formula, species, weightG]);

  const result = useMemo(() => {
    if (isChartFormula(formula)) return null;
    const ageNum = ageDays === "" ? undefined : Number(ageDays);
    const forearmNum = forearmMm === "" ? undefined : Number(forearmMm);
    const validAge =
      mode === "age" &&
      ageNum !== undefined &&
      Number.isFinite(ageNum) &&
      ageNum >= 0 &&
      ageNum <= 365;
    const validForearm =
      mode === "forearm" &&
      forearmNum !== undefined &&
      Number.isFinite(forearmNum) &&
      forearmNum > 0 &&
      forearmNum <= 250;
    if (!validAge && !validForearm) return null;
    try {
      return calculateFlyingFoxFeed({
        species,
        formula: formula as FlyingFoxFormula,
        ageDays: validAge ? ageNum : undefined,
        forearmMm: validForearm ? forearmNum : undefined,
      });
    } catch {
      return null;
    }
  }, [species, formula, mode, ageDays, forearmMm]);

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-3xl">
      <Link
        href="/tools"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Tools
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Flying Fox Feed Calculator
        </h1>
        <p className="text-muted-foreground text-sm">
          Calculate daily milk intake for Grey-headed and Little Red Flying
          Fox pups based on age or forearm length.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pup Details</CardTitle>
          <CardDescription>
            Enter the species, milk formula, and one developmental
            measurement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Species</Label>
              <Select
                value={species}
                onValueChange={(v) => setSpecies(v as FlyingFoxSpecies)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FLYING_FOX_SPECIES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Milk Formula</Label>
              <Select
                value={formula}
                onValueChange={(v) => setFormula(v as FlyingFoxFormula | ChartFormula)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_FORMULAS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                  {FLYING_FOX_FORMULAS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isChartFormula(formula) ? (
            <div className="space-y-2">
              <Label htmlFor="ffWeight">Body weight (g)</Label>
              <Input
                id="ffWeight"
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="e.g. 93"
                value={weightG}
                onChange={(e) => setWeightG(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {formula === "goats-milk"
                  ? "Goat's milk volume is derived from the Biolac rate (see notes)."
                  : "Biolac publish their feeding rate as a percentage of body weight, not by age or forearm."}
              </p>
            </div>
          ) : (
            <>
          <div className="space-y-2">
              <Label>Measurement</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={mode === "age" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("age")}
                >
                  Age (days)
                </Button>
                <Button
                  type="button"
                  variant={mode === "forearm" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("forearm")}
                >
                  Forearm (mm)
                </Button>
              </div>
            </div>
  
            {mode === "age" ? (
              <div className="space-y-2">
                <Label htmlFor="ffAge">Age in days</Label>
                <Input
                  id="ffAge"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={365}
                  placeholder="e.g. 21"
                  value={ageDays}
                  onChange={(e) => setAgeDays(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="ffForearm">Forearm length (mm)</Label>
                <Input
                  id="ffForearm"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  max={250}
                  placeholder="e.g. 90"
                  value={forearmMm}
                  onChange={(e) => setForearmMm(e.target.value)}
                />
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>

      {chartPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Feed Plan</CardTitle>
            <CardDescription>
              {CHART_FORMULAS.find((f) => f.value === formula)?.label} · {chartPlan.bodyWeightGrams} g pup ·{" "}
              {chartPlan.percentMin}–{chartPlan.percentMax}% of body weight per day
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {chartPlan.volumeIsDerived && (
              <Alert variant="default" className="border-amber-300 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <AlertDescription className="text-amber-900 text-sm">
                  Derived volume, not a published figure. Check against the Flying-fox Manual&apos;s printed cow&apos;s milk chart.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile
                label="Total daily milk"
                value={`${chartPlan.dailyMinMl}–${chartPlan.dailyMaxMl} ml`}
                sub={`${chartPlan.percentMin}–${chartPlan.percentMax}% of ${chartPlan.bodyWeightGrams} g`}
              />
              <StatTile
                label="Feeds per day"
                value={`${chartPlan.feedsMin}–${chartPlan.feedsMax}`}
                sub="depending on age and development"
              />
              <StatTile
                label="Per feed"
                value={`${chartPlan.perFeedMinMl}–${chartPlan.perFeedMaxMl} ml`}
                sub="daily total split across the feeds"
              />
            </div>

            {chartPlan.powderGrams != null && (
              <p className="text-sm">
                <span className="font-medium">For the day (at 25%):</span> {chartPlan.powderGrams} g powder
                made up to {chartPlan.dailyMaxMl} ml.
              </p>
            )}
            {chartPlan.goatsMilk && (
              <p className="text-sm">
                <span className="font-medium">For the day (upper figure):</span> {chartPlan.goatsMilk.milkMl} ml
                goat&apos;s milk + {chartPlan.goatsMilk.glucoseGrams} g Glucodin +{" "}
                {chartPlan.goatsMilk.calciumSyrupMl} ml calcium syrup.
              </p>
            )}

            <div className="space-y-2 rounded-md bg-muted/50 p-3 text-sm">
              <Badge variant="secondary">Mixing</Badge>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {chartPlan.mixing.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 rounded-md bg-muted/50 p-3 text-sm">
              <Badge variant="secondary">Notes</Badge>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                {chartPlan.notes.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">
              Source: Biolac Flying Fox and Flying Fox Plus product pages (biolac.com.au): 20–25% of
              body weight daily in 4–5 feeds, 14 g made up to 70 mL. Goat&apos;s milk recipe: The
              Flying-fox Manual s3.021.
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Feed Plan</CardTitle>
            <CardDescription>{result.stage.label}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="default" className="border-amber-300 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              <AlertDescription className="text-amber-900 text-sm">
                These volumes come from a general stage table, not from Wombaroo or Di-Vetelact, and
                are the same whichever of these three formulas is chosen. Check them against the
                manufacturer&apos;s feeding chart.
              </AlertDescription>
            </Alert>
            {result.warnings.map((w, i) => (
              <Alert key={i} variant="default" className="border-amber-300 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <AlertDescription className="text-amber-900 text-sm">
                  {w}
                </AlertDescription>
              </Alert>
            ))}

            <div className="grid gap-3 sm:grid-cols-3">
              <StatTile
                label="Expected weight"
                value={`${result.expectedWeightGrams} g`}
                sub={`range ${result.stage.weightGramsMin}–${result.stage.weightGramsMax} g`}
              />
              <StatTile
                label="Total daily feed"
                value={`${result.dailyFeedMl} ml`}
                sub={`${Math.round(result.stage.dailyIntakeFraction * 100)}% of body weight`}
              />
              <StatTile
                label="Feeds per day"
                value={`${result.feedsPerDay}`}
                sub={`${result.perFeedMl} ml per feed`}
              />
            </div>

            <div className="space-y-2 rounded-md bg-muted/50 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Stage notes</Badge>
                <span className="text-muted-foreground">
                  {result.stage.notes}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Formula</Badge>
                <span className="text-muted-foreground">
                  {result.formulaRecommendation}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert className="border-blue-200 bg-blue-50">
        <AlertTriangle className="h-4 w-4 text-blue-700" />
        <AlertDescription className="text-blue-900 text-sm">
          These figures are guideline only. Adjust feed volumes based on the
          pup&apos;s actual body condition, weight gain, and vet advice.
          Always follow the formula manufacturer&apos;s mixing and hygiene
          instructions.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}
