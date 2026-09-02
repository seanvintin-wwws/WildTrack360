'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useOrganization } from '@/lib/clerk-client';
import {
  summariseCarerTitres,
  type CarerTitreSummary,
  type TitreAlertStage,
} from '@/lib/ablv-titre';

// ABLV titre currency across the shelter's carers. The escalation logic lives
// in src/lib/ablv-titre.ts, where it can be tested - this file only renders.
//
// This reports on RECORDS, not on anybody's actual immunity.

const STAGE_LABEL: Record<TitreAlertStage, string> = {
  overdue: 'Overdue',
  'due-in-1-week': 'Due this week',
  'due-in-2-weeks': 'Due in 2 weeks',
  'due-in-1-month': 'Due within a month',
  'due-in-3-months': 'Due within 3 months',
  ok: 'Current',
};

function toneFor(row: CarerTitreSummary): string {
  // Red: no titre recorded, lapsed, or a result below the threshold - i.e. not
  // covered for bat work.
  if (row.status === null || row.status.stage === 'overdue' || !row.covered) {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  // Orange from one month out, when it needs booking rather than noting.
  if (
    row.status.stage === 'due-in-1-month' ||
    row.status.stage === 'due-in-2-weeks' ||
    row.status.stage === 'due-in-1-week'
  ) {
    return 'bg-orange-100 text-orange-900 border-orange-200';
  }
  // Amber at three months: a heads-up, deliberately milder than orange.
  if (row.status.stage === 'due-in-3-months') {
    return 'bg-amber-100 text-amber-900 border-amber-200';
  }
  // Green when current. Every carer is listed now, so a row with nothing wrong
  // must not look flagged - otherwise the card cries wolf and gets ignored.
  return 'bg-green-100 text-green-900 border-green-200';
}

export function AblvTitreAlerts() {
  const { organization } = useOrganization();
  const [rows, setRows] = useState<CarerTitreSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/carers?orgId=${organization?.id ?? ''}`);
        if (res.ok) {
          const carers = await res.json();
          setRows(
            summariseCarerTitres(
              (Array.isArray(carers) ? carers : []).map((c: Record<string, unknown>) => ({
                id: String(c.id),
                name: String(c.name || c.email || 'Unnamed carer'),
                ablvTitreDate: (c.ablvTitreDate as string | null) ?? null,
                ablvTitreValue: (c.ablvTitreValue as number | null) ?? null,
              }))
            )
          );
        }
      } catch (error) {
        console.error('Error loading ABLV titre status:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [organization]);

  const needsAction = rows.filter((r) => !r.covered || r.status?.stage !== 'ok');
  // Every carer is listed, including those who are fine. Showing only problems
  // means a carer with a current titre vanishes, and absent then reads the same
  // as not recorded - the one distinction this card exists to make.
  const ordered = [...needsAction, ...rows.filter((r) => !needsAction.includes(r))];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            ABLV Titre Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            ABLV Titre Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            All carers have a current titre on record.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            ABLV Titre Status
          </CardTitle>
          <Link href="/compliance/carers">
            <Button variant="ghost" size="sm">
              View carers
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {ordered.map((row) => (
          <div
            key={row.id}
            className={`flex flex-col gap-1 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between ${toneFor(row)}`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{row.name}</p>
              <p className="text-xs opacity-90">{row.detail}</p>
            </div>
            <div className="flex items-center gap-2">
              {row.status && (
                <span className="text-xs opacity-80">
                  due {format(row.status.dueDate, 'd MMM yyyy')}
                </span>
              )}
              <Badge variant="outline" className="whitespace-nowrap">
                {row.status ? STAGE_LABEL[row.status.stage] : 'Not recorded'}
              </Badge>
            </div>
          </div>
        ))}
        <p className="pt-1 text-xs text-muted-foreground">
          Reflects what is recorded, not anyone&apos;s actual immunity. Carers
          handling bats should confirm their own serology with their provider.
        </p>
      </CardContent>
    </Card>
  );
}
