import { z } from 'zod';

/**
 * Zod schema for SPOC validation
 */
export const SPOCSchema = z.object({
  id: z.string().uuid(),
  sPOCName: z.string().min(1, { message: "SPOC Name is required" }),
  email: z.string().email().optional(),
  reviewFlag: z.boolean(),
  reviewNotes: z.string().optional(),
  section: z.string().min(1, { message: "Section is required" }),
  sPOCRoleKey: z.enum(['Primary', 'Alternate']),
  supervisorEmail: z.string().email().optional(),
  supervisorName: z.string().optional(),
});

/**
 * Schema for creating a new SPOC (omits system-generated ID)
 */
export const CreateSPOCSchema = SPOCSchema.omit({ id: true });

/**
 * Schema for updating an existing SPOC
 */
export const UpdateSPOCSchema = SPOCSchema;

export type SPOCInput = z.infer<typeof SPOCSchema>;
export type CreateSPOCInput = z.infer<typeof CreateSPOCSchema>;
export type UpdateSPOCInput = z.infer<typeof UpdateSPOCSchema>;