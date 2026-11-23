import { z } from 'zod';

/**
 * Zod schema for Comment validation
 */
export const CommentSchema = z.object({
  id: z.string().uuid(),
  commentName: z.string().min(1, { message: "Comment Name is required" }),
  commentText: z.string().min(1, { message: "Comment Text is required" }),
  createdBy: z.object({ id: z.string().uuid(), applicationUserName: z.string() }),
  createdDate: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "DateTime must be in ISO format").min(1, { message: "Created Date is required" }),
  inspectionResponse: z.object({ id: z.string().uuid(), inspectionResponseName: z.string() }),
});

/**
 * Schema for creating a new Comment (omits system-generated ID)
 */
export const CreateCommentSchema = CommentSchema.omit({ id: true });

/**
 * Schema for updating an existing Comment
 */
export const UpdateCommentSchema = CommentSchema;

export type CommentInput = z.infer<typeof CommentSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;