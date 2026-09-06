"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageTransition } from "@/components/layout/page-transition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  applicationStatusLabel,
  getApplicationById,
  updateApplicationStatus,
} from "@/lib/firebase/applications";
import type { ApplicationStatus, CareerApplication } from "@/types/career";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const [application, setApplication] = useState<CareerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    void getApplicationById(params.id)
      .then((data) => {
        if (!active) return;
        setApplication(data);
        if (!data) setError("Application not found");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load application");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  const changeStatus = async (status: ApplicationStatus) => {
    if (!application) return;
    setSaving(true);
    try {
      await updateApplicationStatus(application.id, status);
      setApplication({ ...application, status });
      toast.success("Status updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {error || "Application not found"}
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {application.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Applied for {application.opportunityTitle}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/applications">Back to applications</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Applicant</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" value={application.email} />
            <Field label="Phone" value={application.phone} />
            <Field label="Location" value={application.location} />
            <Field
              label="Type"
              value={`${application.opportunityType} · ${application.opportunityTitle}`}
            />
            {application.portfolioUrl ? (
              <div className="sm:col-span-2">
                <p className="text-xs text-muted-foreground">Portfolio / LinkedIn</p>
                <a
                  href={application.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {application.portfolioUrl}
                </a>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Cover letter</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {application.coverLetter || "—"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume & status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Badge>{applicationStatusLabel(application.status)}</Badge>
              {application.resumeUrl ? (
                <Button asChild variant="outline" size="sm">
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open resume
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">No resume uploaded</p>
              )}
            </div>
            <Select
              value={application.status}
              onValueChange={(value) =>
                void changeStatus(value as ApplicationStatus)
              }
              disabled={saving}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="review">Under Review</SelectItem>
                <SelectItem value="shortlisted">Shortlisted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="selected">Selected</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
