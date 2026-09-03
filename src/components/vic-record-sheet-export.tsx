"use client";

import { useState } from "react";
import { Download, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * One button that produces the DEECA Wildlife Shelter Record Sheet.
 *
 * The point of this component is that a carer facing an Authorised Officer
 * should not have to assemble anything, choose a format, or decide what to
 * include. They press one button and get the document DEECA asks for, covering
 * the full three-year retention window by default.
 */
interface VicRecordSheetExportProps {
  /**
   * 'card' is the full explanation for a compliance page. 'button' is a bare
   * control for the dashboard action bar, where the surrounding text would be
   * noise. Both run exactly the same export.
   */
  variant?: 'card' | 'button';
}

export function VicRecordSheetExport({ variant = 'card' }: VicRecordSheetExportProps = {}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/compliance/vic-record-sheet");
      if (!res.ok) {
        throw new Error(
          res.status === 403
            ? "You do not have permission to export compliance records."
            : "The export could not be generated."
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wildlife-shelter-record-sheet-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The export could not be generated.");
    } finally {
      setBusy(false);
    }
  }

  if (variant === 'button') {
    return (
      <div className="flex flex-col gap-1">
        <Button onClick={handleExport} disabled={busy} variant="outline" className="w-full sm:w-auto">
          {busy ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {busy ? 'Preparing…' : 'DEECA Record Sheet'}
        </Button>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Wildlife Shelter Record Sheet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Produces the record DEECA asks for under Condition 23, covering the
          last three years. Contains only the twelve columns on the
          Conservation Regulator&rsquo;s record sheet — case number, species and
          code, dates in and out, sex, age, injury, cause, where found, status
          and notes.
        </p>

        <p className="text-sm text-muted-foreground">
          Clinical detail is deliberately left out. Medications, subcutaneous
          fluids, treatments, vet notes, weights and growth records are not
          part of this document. They stay in the system for your vet.
        </p>

        <Button onClick={handleExport} disabled={busy} size="lg" className="w-full">
          {busy ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing record sheet…
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export record sheet for DEECA
            </>
          )}
        </Button>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Records must be kept for three years and produced to an Authorised
          Officer without delay. Annual submission to DEECA is no longer
          required.
        </p>
      </CardContent>
    </Card>
  );
}
