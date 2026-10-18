import type { AppModule } from "./auth";

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  module: AppModule;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  details?: Record<string, unknown>;
  approvalRequestId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export type AuditLogFilters = {
  actorId?: string;
  module?: AppModule;
  action?: string;
  startDate?: string;
  endDate?: string;
};
