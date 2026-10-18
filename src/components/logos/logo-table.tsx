"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ExternalLink,
  Globe,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { ClientLogo } from "@/types/client-logo";

type LogoTableProps = {
  logos: ClientLogo[];
  onDelete: (id: string) => Promise<void>;
};

export function LogoTable({ logos, onDelete }: LogoTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<ClientLogo | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logos.filter((logo) => {
      const matchesSearch =
        !q ||
        logo.name.toLowerCase().includes(q) ||
        logo.altText.toLowerCase().includes(q) ||
        (logo.websiteUrl && logo.websiteUrl.toLowerCase().includes(q));
      const matchesStatus =
        statusFilter === "all" || logo.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [logos, search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await onDelete(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logos by client name or URL…"
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={logos.length === 0 ? "No client logos yet" : "No matches"}
          description={
            logos.length === 0
              ? "Add genuine client logos to feature in the 'Who We Work With' marquee on the website."
              : "Try adjusting your search query or filter."
          }
          actionLabel={logos.length === 0 ? "Add client logo" : undefined}
          onAction={
            logos.length === 0 ? () => router.push("/logos/new") : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr className="text-muted-foreground">
                    <th className="px-4 py-3.5 font-medium">Logo</th>
                    <th className="px-4 py-3.5 font-medium">Client Name</th>
                    <th className="px-4 py-3.5 font-medium">Website</th>
                    <th className="px-4 py-3.5 font-medium">Assigned Countries</th>
                    <th className="px-4 py-3.5 font-medium">Order</th>
                    <th className="px-4 py-3.5 font-medium">Status</th>
                    <th className="px-4 py-3.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((logo) => (
                    <tr
                      key={logo.id}
                      className="border-b border-border/70 transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex h-12 w-24 items-center justify-center rounded-lg border border-border bg-card p-1.5">
                          {logo.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={logo.logoUrl}
                              alt={logo.altText}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">No logo</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{logo.name}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          Alt: {logo.altText}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {logo.websiteUrl ? (
                          <a
                            href={logo.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                          >
                            <span>Visit site</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {logo.isGlobal ? (
                          <Badge variant="secondary" className="gap-1 text-[11px]">
                            <Globe className="h-3 w-3" />
                            Global
                          </Badge>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {logo.countries.map((c) => (
                              <Badge key={c} variant="outline" className="text-[10px] uppercase">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs">{logo.sortOrder}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            logo.status === "published" ? "success" : "warning"
                          }
                        >
                          {logo.status === "published" ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/logos/${logo.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(logo)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete client logo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>{" "}
              from the &quot;Who We Work With&quot; marquee on the website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-[#b91c1c]"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
