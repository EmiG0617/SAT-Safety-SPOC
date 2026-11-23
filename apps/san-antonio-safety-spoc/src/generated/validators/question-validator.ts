import { z } from 'zod';

/**
 * Zod schema for Question validation
 */
export const QuestionSchema = z.object({
  id: z.string().uuid(),
  questionName: z.string().min(1, { message: "Question Name is required" }),
  active: z.boolean(),
  choiceSet: z.object({ id: z.string().uuid(), choiceSetName: z.string() }).optional(),
  displayOrder: z.number().int(),
  helpText: z.string().optional(),
  inspectionType: z.object({ id: z.string().uuid(), inspectionTypeName: z.string() }),
  questionCode: z.string().min(1, { message: "Question Code is required" }),
  questionText: z.string().min(1, { message: "Question Text is required" }),
  repeatableAsset: z.boolean(),
  required: z.boolean(),
  responseTypeKey: z.enum(['YesNoNA', 'YesNo', 'SingleChoice', 'MultiSelect', 'Text', 'MultilineText', 'Date', 'Number']),
});

/**
 * Schema for creating a new Question (omits system-generated ID)
 */
export const CreateQuestionSchema = QuestionSchema.omit({ id: true });

/**
 * Schema for updating an existing Question
 */
export const UpdateQuestionSchema = QuestionSchema;

export type QuestionInput = z.infer<typeof QuestionSchema>;
export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;