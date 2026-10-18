"use client";

import type { ApprovalDiffItem } from "@/types/approval";
import { Badge } from "@/components/ui/badge";

interface Props {
  diff?: ApprovalDiffItem[];
  action: "create" | "update" | "delete" | "publish";
  currentData?: Record<string, unknown>;
  proposedData?: Record<string, unknown>;
}

function formatValue(val: unknown): string {
  if (val === undefined || val === null || val === "") return "—";
  if (typeof val === "object") {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  return String(val);
}

export function ApprovalDiffViewer({ diff, action, currentData, proposedData }: Props) {
  // If it's a create action, show proposed values as new additions
  if (action === "create") {
    const entries = Object.entries(proposedData || {}).filter(
      ([k]) => !["createdAt", "updatedAt", "id", "docId"].includes(k),
    );

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
            New Record Creation
          </Badge>
          <span className="text-xs text-muted-foreground">All fields below will be created upon approval</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-muted/40 uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="px-4 py-3 w-1/3">Field</th>
                <th className="px-4 py-3">Proposed Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {entries.map(([k, v]) => (
                <tr key={k} className="bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                  <td className="px-4 py-2.5 font-sans font-semibold text-foreground">{k}</td>
                  <td className="px-4 py-2.5 whitespace-pre-wrap text-emerald-700 dark:text-emerald-400">
                    {formatValue(v)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // If it's a delete action
  if (action === "delete") {
    const entries = Object.entries(currentData || {}).filter(
      ([k]) => !["createdAt", "updatedAt", "id", "docId"].includes(k),
    );

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="destructive">Record Deletion</Badge>
          <span className="text-xs text-muted-foreground">This existing record will be permanently deleted upon approval</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b bg-muted/40 uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="px-4 py-3 w-1/3">Field</th>
                <th className="px-4 py-3">Current Value (To Be Deleted)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {entries.map(([k, v]) => (
                <tr key={k} className="bg-destructive/5 hover:bg-destructive/10 transition-colors">
                  <td className="px-4 py-2.5 font-sans font-semibold text-foreground">{k}</td>
                  <td className="px-4 py-2.5 whitespace-pre-wrap text-destructive line-through">
                    {formatValue(v)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Update action: Side-by-side or field-by-field diff
  if (!diff || diff.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
        No field-level changes detected between current and proposed payloads.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {diff.length} Modified Field(s)
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b bg-muted/40 uppercase tracking-wider text-muted-foreground font-semibold">
              <th className="px-4 py-3 w-1/4">Field</th>
              <th className="px-4 py-3 w-3/8 text-rose-600 dark:text-rose-400">Current / Live Value</th>
              <th className="px-4 py-3 w-3/8 text-emerald-600 dark:text-emerald-400">Proposed New Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono">
            {diff.map((item) => (
              <tr key={item.field} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3 font-sans font-semibold text-foreground align-top">
                  {item.fieldLabel || item.field}
                </td>
                <td className="px-4 py-3 bg-rose-500/5 text-rose-700 dark:text-rose-400 whitespace-pre-wrap align-top">
                  {formatValue(item.oldValue)}
                </td>
                <td className="px-4 py-3 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 whitespace-pre-wrap align-top font-semibold">
                  {formatValue(item.newValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
