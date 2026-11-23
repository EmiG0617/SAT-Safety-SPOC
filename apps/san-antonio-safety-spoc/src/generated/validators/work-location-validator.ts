import { z } from 'zod';

/**
 * Zod schema for WorkLocation validation
 */
export const WorkLocationSchema = z.object({
  id: z.string().uuid(),
  workLocationName: z.string().min(1, { message: "Work Location Name is required" }),
  active: z.boolean(),
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  imageUrl: z.string().optional(),
  postalCode: z.string().min(1, { message: "Postal Code is required" }),
  state: z.string().min(1, { message: "State is required" }),
});

/**
 * Schema for creating a new WorkLocation (omits system-generated ID)
 */
export const CreateWorkLocationSchema = WorkLocationSchema.omit({ id: true });

/**
 * Schema for updating an existing WorkLocation
 */
export const UpdateWorkLocationSchema = WorkLocationSchema;

export type WorkLocationInput = z.infer<typeof WorkLocationSchema>;
export type CreateWorkLocationInput = z.infer<typeof CreateWorkLocationSchema>;
export type UpdateWorkLocationInput = z.infer<typeof UpdateWorkLocationSchema>;