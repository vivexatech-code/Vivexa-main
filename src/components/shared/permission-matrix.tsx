"use client";

import { APP_MODULE_CONFIG } from "@/lib/constants";
import { ALL_MODULES, PERMISSION_LEVEL_LABELS } from "@/lib/permissions";
import type { AppModule, PermissionLevel } from "@/types/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PermissionMatrixProps {
  value: Partial<Record<AppModule, PermissionLevel>>;
  onChange?: (updated: Record<AppModule, PermissionLevel>) => void;
  readOnly?: boolean;
  className?: string;
}

export function PermissionMatrix({
  value,
  onChange,
  readOnly = false,
  className,
}: PermissionMatrixProps) {
  const currentPermissions = ALL_MODULES.reduce((acc, mod) => {
    acc[mod] = value[mod] || "none";
    return acc;
  }, {} as Record<AppModule, PermissionLevel>);

  const handleLevelChange = (mod: AppModule, level: PermissionLevel) => {
    if (!onChange || readOnly) return;
    onChange({
      ...currentPermissions,
      [mod]: level,
    });
  };

  const badgeStyle = (level: PermissionLevel) => {
    switch (level) {
      case "full":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case "read_write":
        return "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30";
      case "approval_required":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
      case "read":
        return "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30";
      case "none":
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-soft", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3.5">Module</th>
              <th className="px-5 py-3.5 hidden md:table-cell">Description</th>
              <th className="px-5 py-3.5 w-64">Permission Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {APP_MODULE_CONFIG.map((modConfig) => {
              const mod = modConfig.id as AppModule;
              const level = currentPermissions[mod];
              const levelInfo = PERMISSION_LEVEL_LABELS[level];

              return (
                <tr key={mod} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 font-medium text-foreground">
                    <div>
                      <p className="font-semibold">{modConfig.label}</p>
                      <p className="text-xs text-muted-foreground md:hidden mt-0.5">
                        {modConfig.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground hidden md:table-cell">
                    {modConfig.description}
                  </td>
                  <td className="px-5 py-4">
                    {readOnly ? (
                      <Badge variant="outline" className={cn("px-2.5 py-1 text-xs font-medium", badgeStyle(level))}>
                        {levelInfo.label}
                      </Badge>
                    ) : (
                      <Select
                        value={level}
                        onValueChange={(val) => handleLevelChange(mod, val as PermissionLevel)}
                      >
                        <SelectTrigger className="w-full max-w-[220px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-slate-400" />
                              No Access
                            </span>
                          </SelectItem>
                          <SelectItem value="read">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-slate-600" />
                              Read Only
                            </span>
                          </SelectItem>
                          <SelectItem value="read_write">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-sky-500" />
                              Read & Write
                            </span>
                          </SelectItem>
                          <SelectItem value="approval_required">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-amber-500" />
                              Write + Approval
                            </span>
                          </SelectItem>
                          <SelectItem value="full">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              Full Access
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
