import { z } from 'zod';

/**
 * Zod schema for AuditContactSnapshot validation
 */
export const AuditContactSnapshotSchema = z.object({
  id: z.string().uuid(),
  auditContactSnapshotName: z.string().min(1, { message: "Audit Contact Snapshot Name is required" }),
  additionalRecipient: z.string().email().optional(),
  address: z.string().min(1, { message: "Address is required" }),
  audit: z.object({ id: z.string().uuid(), auditName: z.string() }),
  city: z.string().min(1, { message: "City is required" }),
  postalCode: z.string().min(1, { message: "Postal Code is required" }),
  safetyOfficerSpecialist: z.string().optional(),
  state: z.string().min(1, { message: "State is required" }),
  supervisorEmail: z.string().email().optional(),
  supervisorName: z.string().optional(),
  supervisorNotDisplayed: z.boolean(),
});

/**
 * Schema for creating a new AuditContactSnapshot (omits system-generated ID)
 */
export const CreateAuditContactSnapshotSchema = AuditContactSnapshotSchema.omit({ id: true });

/**
 * Schema for updating an existing AuditContactSnapshot
 */
export const UpdateAuditContactSnapshotSchema = AuditContactSnapshotSchema;

export type AuditContactSnapshotInput = z.infer<typeof AuditContactSnapshotSchema>;
export type CreateAuditContactSnapshotInput = z.infer<typeof CreateAuditContactSnapshotSchema>;
export type UpdateAuditContactSnapshotInput = z.infer<typeof UpdateAuditContactSnapshotSchema>;