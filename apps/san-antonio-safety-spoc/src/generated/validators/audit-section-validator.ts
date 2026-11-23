import { z } from 'zod';

/**
 * Zod schema for AuditSection validation
 */
export const AuditSectionSchema = z.object({
  id: z.string().uuid(),
  auditSectionName: z.string().min(1, { message: "Audit Section Name is required" }),
  applicable: z.boolean(),
  audit: z.object({ id: z.string().uuid(), auditName: z.string() }),
  completionStatusKey: z.enum(['NotStarted', 'InProgress', 'Complete', 'NotApplicable', 'DeficiencyPresent']),
  inspectionType: z.object({ id: z.string().uuid(), inspectionTypeName: z.string() }),
  inspectionTypeSnapshot: z.string().min(1, { message: "Inspection Type Snapshot is required" }),
});

/**
 * Schema for creating a new AuditSection (omits system-generated ID)
 */
export const CreateAuditSectionSchema = AuditSectionSchema.omit({ id: true });

/**
 * Schema for updating an existing AuditSection
 */
export const UpdateAuditSectionSchema = AuditSectionSchema;

export type AuditSectionInput = z.infer<typeof AuditSectionSchema>;
export type CreateAuditSectionInput = z.infer<typeof CreateAuditSectionSchema>;
export type UpdateAuditSectionInput = z.infer<typeof UpdateAuditSectionSchema>;