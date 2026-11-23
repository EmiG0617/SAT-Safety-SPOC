import { z } from 'zod';

/**
 * Zod schema for ApplicationUser validation
 */
export const ApplicationUserSchema = z.object({
  id: z.string().uuid(),
  applicationUserName: z.string().min(1, { message: "Application User Name is required" }),
  active: z.boolean(),
  email: z.string().email().min(1, { message: "Email is required" }),
  manager: z.object({ id: z.string().uuid(), applicationUserName: z.string() }).optional(),
  phone: z.string().optional(),
  roleKey: z.enum(['Administrator', 'SafetyOfficerSpecialist', 'SPOC', 'Supervisor', 'Auditor']),
  workGroup: z.object({ id: z.string().uuid(), workGroupName: z.string() }),
  workLocation: z.object({ id: z.string().uuid(), workLocationName: z.string() }),
});

/**
 * Schema for creating a new ApplicationUser (omits system-generated ID)
 */
export const CreateApplicationUserSchema = ApplicationUserSchema.omit({ id: true });

/**
 * Schema for updating an existing ApplicationUser
 */
export const UpdateApplicationUserSchema = ApplicationUserSchema;

export type ApplicationUserInput = z.infer<typeof ApplicationUserSchema>;
export type CreateApplicationUserInput = z.infer<typeof CreateApplicationUserSchema>;
export type UpdateApplicationUserInput = z.infer<typeof UpdateApplicationUserSchema>;