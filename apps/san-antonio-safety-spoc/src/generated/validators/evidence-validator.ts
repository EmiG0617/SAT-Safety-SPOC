import { z } from 'zod';

/**
 * Zod schema for Evidence validation
 */
export const EvidenceSchema = z.object({
  id: z.string().uuid(),
  evidenceName: z.string().min(1, { message: "Evidence Name is required" }),
  caption: z.string().optional(),
  createdDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "DateTime must be in ISO format").min(1, { message: "Created Date is required" }),
  evidenceTypeKey: z.enum(['Photo', 'Document', 'Receipt', 'InspectionRecord', 'Other']),
  evidenceURL: z.string().url().min(1, { message: "Evidence URL is required" }),
  fileName: z.string().min(1, { message: "File Name is required" }),
  inspectionResponse: z.object({ id: z.string().uuid(), inspectionResponseName: z.string() }).optional(),
  photoDataURL: z.string().optional(),
});

/**
 * Schema for creating a new Evidence (omits system-generated ID)
 */
export const CreateEvidenceSchema = EvidenceSchema.omit({ id: true });

/**
 * Schema for updating an existing Evidence
 */
export const UpdateEvidenceSchema = EvidenceSchema;

export type EvidenceInput = z.infer<typeof EvidenceSchema>;
export type CreateEvidenceInput = z.infer<typeof CreateEvidenceSchema>;
export type UpdateEvidenceInput = z.infer<typeof UpdateEvidenceSchema>;