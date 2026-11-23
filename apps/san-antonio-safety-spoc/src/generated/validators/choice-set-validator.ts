import { z } from 'zod';

/**
 * Zod schema for ChoiceSet validation
 */
export const ChoiceSetSchema = z.object({
  id: z.string().uuid(),
  choiceSetName: z.string().min(1, { message: "Choice Set Name is required" }),
  active: z.boolean(),
  options: z.string().min(1, { message: "Options is required" }),
});

/**
 * Schema for creating a new ChoiceSet (omits system-generated ID)
 */
export const CreateChoiceSetSchema = ChoiceSetSchema.omit({ id: true });

/**
 * Schema for updating an existing ChoiceSet
 */
export const UpdateChoiceSetSchema = ChoiceSetSchema;

export type ChoiceSetInput = z.infer<typeof ChoiceSetSchema>;
export type CreateChoiceSetInput = z.infer<typeof CreateChoiceSetSchema>;
export type UpdateChoiceSetInput = z.infer<typeof UpdateChoiceSetSchema>;