import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InspectionTypeService } from "../services/inspection-type-service";
import type { InspectionType } from "../models/inspection-type-model";
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve all InspectionType records with optional filtering and sorting.
 * @param options Optional filtering and sorting options
 *   Available properties for sorting: id, inspectionTypeName, active, displayOrder, repeatable, sourceForm
 *   Filtering supports OData syntax, e.g., "status eq 'active'"
 */
export function useInspectionTypeList(options?: IOperationOptions) {
  return useQuery({
    queryKey: ["inspectionType-list", options],
    queryFn: () => InspectionTypeService.getAll(options),
  });
}

/**
 * Retrieve a single InspectionType record by its unique identifier.
 * @param id The id of the record (must be a valid UUID)
 */
export function useInspectionType(id: string) {
  return useQuery({
    queryKey: ["inspectionType", id],
    queryFn: () => InspectionTypeService.get(id),
    enabled: !!id && UUID_REGEX.test(id),
  });
}

/**
 * Create a new InspectionType record.
 * @remarks Form validation: use CreateInspectionTypeSchema with zodResolver for type-safe create forms
 */
export function useCreateInspectionType() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<InspectionType, "id">) => InspectionTypeService.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["inspectionType-list"] });
    },
  });
}

/**
 * Update an existing InspectionType record.
 * @remarks Form validation: use UpdateInspectionTypeSchema.partial().omit({ id: true }) with zodResolver for edit forms (matches changedFields input)
 */
export function useUpdateInspectionType() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<InspectionType, "id">>;
    }) => InspectionTypeService.update(id, changedFields),
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["inspectionType-list"] });
      client.invalidateQueries({ queryKey: ["inspectionType", variables.id] });
    },
  });
}

/**
 * Delete a InspectionType record by its unique identifier.
 */
export function useDeleteInspectionType() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => InspectionTypeService.delete(id),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["inspectionType-list"] });
      client.invalidateQueries({ queryKey: ["inspectionType", id] });
    },
  });
}

/** Data source type for this table — drives InMemoryDataBanner visibility. */
export const InspectionType_DATA_SOURCE_TYPE = 'InMemory' as const;

export { InspectionTypeSchema, CreateInspectionTypeSchema, UpdateInspectionTypeSchema } from "../validators/inspection-type-validator";
export type { InspectionTypeInput, CreateInspectionTypeInput, UpdateInspectionTypeInput } from "../validators/inspection-type-validator";