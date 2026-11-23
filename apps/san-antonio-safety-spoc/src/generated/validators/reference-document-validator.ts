import { z } from 'zod';

/**
 * Zod schema for ReferenceDocument validation
 */
export const ReferenceDocumentSchema = z.object({
  id: z.string().uuid(),
  referenceDocumentName: z.string().min(1, { message: "Reference Document Name is required" }),
  active: z.boolean(),
  categoryKey: z.enum(['InspectionForms', 'FacilitySafety', 'HAZCOM', 'SDS', 'SPCC', 'EmergencyEvacuation', 'TrainingSPOCResources']),
  sharePointURL: z.string().url().min(1, { message: "SharePoint URL is required" }),
  title: z.string().min(1, { message: "Title is required" }),
});

/**
 * Schema for creating a new ReferenceDocument (omits system-generated ID)
 */
export const CreateReferenceDocumentSchema = ReferenceDocumentSchema.omit({ id: true });

/**
 * Schema for updating an existing ReferenceDocument
 */
export const UpdateReferenceDocumentSchema = ReferenceDocumentSchema;

export type ReferenceDocumentInput = z.infer<typeof ReferenceDocumentSchema>;
export type CreateReferenceDocumentInput = z.infer<typeof CreateReferenceDocumentSchema>;
export type UpdateReferenceDocumentInput = z.infer<typeof UpdateReferenceDocumentSchema>;