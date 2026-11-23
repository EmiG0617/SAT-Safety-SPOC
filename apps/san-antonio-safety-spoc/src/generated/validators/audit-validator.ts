import { z } from 'zod';

/**
 * Zod schema for Audit validation
 */
export const AuditSchema = z.object({
  id: z.string().uuid(),
  auditName: z.string().min(1, { message: "Audit Name is required" }),
  completedBy: z.object({ id: z.string().uuid(), applicationUserName: z.string() }).optional(),
  completedByIdentitySnapshot: z.string().min(1, { message: "Completed By Identity Snapshot is required" }),
  createdBy: z.object({ id: z.string().uuid(), applicationUserName: z.string() }),
  createdDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "DateTime must be in ISO format").min(1, { message: "Created Date is required" }),
  isCompliant: z.boolean(),
  modifiedBy: z.object({ id: z.string().uuid(), applicationUserName: z.string() }),
  modifiedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "DateTime must be in ISO format").min(1, { message: "Modified Date is required" }),
  nameNotFound: z.boolean(),
  statusKey: z.enum(['Draft', 'Submitted', 'Archived']),
  submittedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "DateTime must be in ISO format").optional(),
  visitDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").min(1, { message: "Visit Date is required" }),
  workGroup: z.object({ id: z.string().uuid(), workGroupName: z.string() }),
});

/**
 * Schema for creating a new Audit (omits system-generated ID)
 */
export const CreateAuditSchema = AuditSchema.omit({ id: true });

/**
 * Schema for updating an existing Audit
 */
export const UpdateAuditSchema = AuditSchema;

export type AuditInput = z.infer<typeof AuditSchema>;
export type CreateAuditInput = z.infer<typeof CreateAuditSchema>;
export type UpdateAuditInput = z.infer<typeof UpdateAuditSchema>;