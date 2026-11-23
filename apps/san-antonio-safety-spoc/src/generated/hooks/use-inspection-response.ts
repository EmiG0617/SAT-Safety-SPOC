import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InspectionResponseService } from "../services/inspection-response-service";
import type { InspectionResponse } from "../models/inspection-response-model";
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve all InspectionResponse records with optional filtering and sorting.
 * @param options Optional filtering and sorting options
 *   Available properties for sorting: id, inspectionResponseName, createdDate, isDeficiency, modifiedDate, questionCodeSnapshot, questionTextSnapshot, responseValue
 *   Filtering supports OData syntax, e.g., "status eq 'active'"
 */
export function useInspectionResponseList(options?: IOperationOptions) {
  return useQuery({
    queryKey: ["inspectionResponse-list", options],
    queryFn: () => InspectionResponseService.getAll(options),
  });
}

/**
 * Retrieve a single InspectionResponse record by its unique identifier.
 * @param id The id of the record (must be a valid UUID)
 */
export function useInspectionResponse(id: string) {
  return useQuery({
    queryKey: ["inspectionResponse", id],
    queryFn: () => InspectionResponseService.get(id),
    enabled: !!id && UUID_REGEX.test(id),
  });
}

/**
 * Create a new InspectionResponse record.
 * @remarks Form validation: use CreateInspectionResponseSchema with zodResolver for type-safe create forms
 */
export function useCreateInspectionResponse() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<InspectionResponse, "id">) => InspectionResponseService.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["inspectionResponse-list"] });
    },
  });
}

/**
 * Update an existing InspectionResponse record.
 * @remarks Form validation: use UpdateInspectionResponseSchema.partial().omit({ id: true }) with zodResolver for edit forms (matches changedFields input)
 */
export function useUpdateInspectionResponse() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<InspectionResponse, "id">>;
    }) => InspectionResponseService.update(id, changedFields),
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["inspectionResponse-list"] });
      client.invalidateQueries({ queryKey: ["inspectionResponse", variables.id] });
    },
  });
}

/**
 * Delete a InspectionResponse record by its unique identifier.
 */
export function useDeleteInspectionResponse() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => InspectionResponseService.delete(id),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["inspectionResponse-list"] });
      client.invalidateQueries({ queryKey: ["inspectionResponse", id] });
    },
  });
}

/** Data source type for this table — drives InMemoryDataBanner visibility. */
export const InspectionResponse_DATA_SOURCE_TYPE = 'InMemory' as const;

export { InspectionResponseSchema, CreateInspectionResponseSchema, UpdateInspectionResponseSchema } from "../validators/inspection-response-validator";
export type { InspectionResponseInput, CreateInspectionResponseInput, UpdateInspectionResponseInput } from "../validators/inspection-response-validator";