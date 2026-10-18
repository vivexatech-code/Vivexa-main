"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Globe,
  MoreHorizontal,
  Pencil,
  Search,
  Star,
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
import type { Country } from "@/types/country";

type CountryTableProps = {
  countries: Country[];
  onDelete: (id: string) => Promise<void>;
};

export function CountryTable({ countries, onDelete }: CountryTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return countries.filter((country) => {
      const matchesSearch =
        !q ||
        country.name.toLowerCase().includes(q) ||
        country.slug.toLowerCase().includes(q) ||
        country.code.toLowerCase().includes(q) ||
        country.currency.code.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || country.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [countries, search, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.isDefault || deleteTarget.slug === "in") {
      toast.error("The default country (India) cannot be deleted");
      setDeleteTarget(null);
      return;
    }
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
            placeholder="Search countries by name, code, slug, or currency…"
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
          icon={Globe}
          title={countries.length === 0 ? "No countries configured" : "No matches"}
          description={
            countries.length === 0
              ? "Add a country experience or import the starter catalog (India, UK, USA, Canada, Australia)."
              : "Try adjusting your search query or filter."
          }
          actionLabel={countries.length === 0 ? "Add country" : undefined}
          onAction={
            countries.length === 0
              ? () => router.push("/countries/new")
              : undefined
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr className="text-muted-foreground">
                    <th className="px-4 py-3.5 font-medium">Country</th>
                    <th className="px-4 py-3.5 font-medium">URL Route</th>
                    <th className="px-4 py-3.5 font-medium">Currency & Pricing</th>
                    <th className="px-4 py-3.5 font-medium">Reviews</th>
                    <th className="px-4 py-3.5 font-medium">Homepage</th>
                    <th className="px-4 py-3.5 font-medium">Status</th>
                    <th className="px-4 py-3.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((country) => (
                    <tr
                      key={country.id}
                      className="border-b border-border/70 transition-colors last:border-0 hover:bg-muted/40"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl" role="img" aria-label={country.name}>
                            {country.flag || "🌐"}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{country.name}</p>
                              {country.isDefault ? (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                  Default
                                </Badge>
                              ) : null}
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {country.shortDescription || `Code: ${country.code}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-foreground bg-muted px-2 py-1 rounded-md">
                          {country.destinationUrl}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-xs">
                          {country.currency.code} ({country.currency.symbol})
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {country.pricing.budgetOptions.length} tier{country.pricing.budgetOptions.length === 1 ? "" : "s"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {country.googleReviews?.enabled ? (
                          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                            <span>{country.googleReviews.rating.toFixed(1)}</span>
                            <span className="text-[11px] text-muted-foreground">
                              ({country.googleReviews.reviewCount})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Hidden</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {country.showOnHomepage ? (
                          <Badge variant="outline" className="text-[11px]">
                            Visible (#{country.sortOrder})
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Off</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            country.status === "published" ? "success" : "warning"
                          }
                        >
                          {country.status === "published" ? "Published" : "Draft"}
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
                              <Link href={`/countries/${country.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a
                                href={`https://www.vivexatech.in${country.destinationUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Live
                              </a>
                            </DropdownMenuItem>
                            {!country.isDefault && country.slug !== "in" ? (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(country)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            ) : null}
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
            <AlertDialogTitle>Delete country experience?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the country experience for{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name} ({deleteTarget?.destinationUrl})
              </span>
              . Visitors to this URL will no longer see this country-specific content.
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
