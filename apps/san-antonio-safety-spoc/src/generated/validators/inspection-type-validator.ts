import { z } from 'zod';

/**
 * Zod schema for InspectionType validation
 */
export const InspectionTypeSchema = z.object({
  id: z.string().uuid(),
  inspectionTypeName: z.string().min(1, { message: "Inspection Type Name is required" }),
  active: z.boolean(),
  displayOrder: z.number().int(),
  repeatable: z.boolean(),
  sourceForm: z.string().min(1, { message: "Source Form is required" }),
});

/**
 * Schema for creating a new InspectionType (omits system-generated ID)
 */
export const CreateInspectionTypeSchema = InspectionTypeSchema.omit({ id: true });

/**
 * Schema for updating an existing InspectionType
 */
export const UpdateInspectionTypeSchema = InspectionTypeSchema;

export type InspectionTypeInput = z.infer<typeof InspectionTypeSchema>;
export type CreateInspectionTypeInput = z.infer<typeof CreateInspectionTypeSchema>;
export type UpdateInspectionTypeInput = z.infer<typeof UpdateInspectionTypeSchema>;