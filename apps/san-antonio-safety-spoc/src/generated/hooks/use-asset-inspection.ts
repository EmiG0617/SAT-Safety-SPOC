import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AssetInspectionService } from "../services/asset-inspection-service";
import type { AssetInspection } from "../models/asset-inspection-model";
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve all AssetInspection records with optional filtering and sorting.
 * @param options Optional filtering and sorting options
 *   Available properties for sorting: id, assetInspectionName, assetSequence, identifier, locationDescription, serialNumber
 *   Filtering supports OData syntax, e.g., "status eq 'active'"
 */
export function useAssetInspectionList(options?: IOperationOptions) {
  return useQuery({
    queryKey: ["assetInspection-list", options],
    queryFn: () => AssetInspectionService.getAll(options),
  });
}

/**
 * Retrieve a single AssetInspection record by its unique identifier.
 * @param id The id of the record (must be a valid UUID)
 */
export function useAssetInspection(id: string) {
  return useQuery({
    queryKey: ["assetInspection", id],
    queryFn: () => AssetInspectionService.get(id),
    enabled: !!id && UUID_REGEX.test(id),
  });
}

/**
 * Create a new AssetInspection record.
 * @remarks Form validation: use CreateAssetInspectionSchema with zodResolver for type-safe create forms
 */
export function useCreateAssetInspection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AssetInspection, "id">) => AssetInspectionService.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["assetInspection-list"] });
    },
  });
}

/**
 * Update an existing AssetInspection record.
 * @remarks Form validation: use UpdateAssetInspectionSchema.partial().omit({ id: true }) with zodResolver for edit forms (matches changedFields input)
 */
export function useUpdateAssetInspection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<AssetInspection, "id">>;
    }) => AssetInspectionService.update(id, changedFields),
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["assetInspection-list"] });
      client.invalidateQueries({ queryKey: ["assetInspection", variables.id] });
    },
  });
}

/**
 * Delete a AssetInspection record by its unique identifier.
 */
export function useDeleteAssetInspection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AssetInspectionService.delete(id),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["assetInspection-list"] });
      client.invalidateQueries({ queryKey: ["assetInspection", id] });
    },
  });
}

/** Data source type for this table — drives InMemoryDataBanner visibility. */
export const AssetInspection_DATA_SOURCE_TYPE = 'InMemory' as const;

export { AssetInspectionSchema, CreateAssetInspectionSchema, UpdateAssetInspectionSchema } from "../validators/asset-inspection-validator";
export type { AssetInspectionInput, CreateAssetInspectionInput, UpdateAssetInspectionInput } from "../validators/asset-inspection-validator";