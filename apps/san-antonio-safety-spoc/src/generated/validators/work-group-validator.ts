import { z } from 'zod';

/**
 * Zod schema for WorkGroup validation
 */
export const WorkGroupSchema = z.object({
  id: z.string().uuid(),
  workGroupName: z.string().min(1, { message: "Work Group Name is required" }),
  active: z.boolean(),
});

/**
 * Schema for creating a new WorkGroup (omits system-generated ID)
 */
export const CreateWorkGroupSchema = WorkGroupSchema.omit({ id: true });

/**
 * Schema for updating an existing WorkGroup
 */
export const UpdateWorkGroupSchema = WorkGroupSchema;

export type WorkGroupInput = z.infer<typeof WorkGroupSchema>;
export type CreateWorkGroupInput = z.infer<typeof CreateWorkGroupSchema>;
export type UpdateWorkGroupInput = z.infer<typeof UpdateWorkGroupSchema>;