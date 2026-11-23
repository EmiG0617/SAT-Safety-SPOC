import { z } from 'zod';

/**
 * Zod schema for InspectionResponse validation
 */
export const InspectionResponseSchema = z.object({
  id: z.string().uuid(),
  inspectionResponseName: z.string().min(1, { message: "Inspection Response Name is required" }),
  assetInspection: z.object({ id: z.string().uuid(), assetInspectionName: z.string() }).optional(),
  auditSection: z.object({ id: z.string().uuid(), auditSectionName: z.string() }),
  createdDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "DateTime must be in ISO format").min(1, { message: "Created Date is required" }),
  isDeficiency: z.boolean(),
  modifiedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "DateTime must be in ISO format").min(1, { message: "Modified Date is required" }),
  question: z.object({ id: z.string().uuid(), questionName: z.string() }),
  questionCodeSnapshot: z.string().min(1, { message: "Question Code Snapshot is required" }),
  questionTextSnapshot: z.string().min(1, { message: "Question Text Snapshot is required" }),
  responseValue: z.string().optional(),
});

/**
 * Schema for creating a new InspectionResponse (omits system-generated ID)
 */
export const CreateInspectionResponseSchema = InspectionResponseSchema.omit({ id: true });

/**
 * Schema for updating an existing InspectionResponse
 */
export const UpdateInspectionResponseSchema = InspectionResponseSchema;

export type InspectionResponseInput = z.infer<typeof InspectionResponseSchema>;
export type CreateInspectionResponseInput = z.infer<typeof CreateInspectionResponseSchema>;
export type UpdateInspectionResponseInput = z.infer<typeof UpdateInspectionResponseSchema>;