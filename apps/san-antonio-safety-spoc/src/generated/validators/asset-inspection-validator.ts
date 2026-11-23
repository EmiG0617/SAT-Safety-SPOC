import { z } from 'zod';

/**
 * Zod schema for AssetInspection validation
 */
export const AssetInspectionSchema = z.object({
  id: z.string().uuid(),
  assetInspectionName: z.string().min(1, { message: "Asset Inspection Name is required" }),
  assetSequence: z.number().int(),
  auditSection: z.object({ id: z.string().uuid(), auditSectionName: z.string() }),
  identifier: z.string().min(1, { message: "Identifier is required" }),
  locationDescription: z.string().optional(),
  serialNumber: z.string().optional(),
});

/**
 * Schema for creating a new AssetInspection (omits system-generated ID)
 */
export const CreateAssetInspectionSchema = AssetInspectionSchema.omit({ id: true });

/**
 * Schema for updating an existing AssetInspection
 */
export const UpdateAssetInspectionSchema = AssetInspectionSchema;

export type AssetInspectionInput = z.infer<typeof AssetInspectionSchema>;
export type CreateAssetInspectionInput = z.infer<typeof CreateAssetInspectionSchema>;
export type UpdateAssetInspectionInput = z.infer<typeof UpdateAssetInspectionSchema>;