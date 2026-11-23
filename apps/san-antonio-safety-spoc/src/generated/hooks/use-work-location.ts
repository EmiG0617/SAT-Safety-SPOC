import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkLocationService } from "../services/work-location-service";
import type { WorkLocation } from "../models/work-location-model";
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve all WorkLocation records with optional filtering and sorting.
 * @param options Optional filtering and sorting options
 *   Available properties for sorting: id, workLocationName, active, address, city, imageUrl, postalCode, state
 *   Filtering supports OData syntax, e.g., "status eq 'active'"
 */
export function useWorkLocationList(options?: IOperationOptions) {
  return useQuery({
    queryKey: ["workLocation-list", options],
    queryFn: () => WorkLocationService.getAll(options),
  });
}

/**
 * Retrieve a single WorkLocation record by its unique identifier.
 * @param id The id of the record (must be a valid UUID)
 */
export function useWorkLocation(id: string) {
  return useQuery({
    queryKey: ["workLocation", id],
    queryFn: () => WorkLocationService.get(id),
    enabled: !!id && UUID_REGEX.test(id),
  });
}

/**
 * Create a new WorkLocation record.
 * @remarks Form validation: use CreateWorkLocationSchema with zodResolver for type-safe create forms
 */
export function useCreateWorkLocation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<WorkLocation, "id">) => WorkLocationService.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["workLocation-list"] });
    },
  });
}

/**
 * Update an existing WorkLocation record.
 * @remarks Form validation: use UpdateWorkLocationSchema.partial().omit({ id: true }) with zodResolver for edit forms (matches changedFields input)
 */
export function useUpdateWorkLocation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<WorkLocation, "id">>;
    }) => WorkLocationService.update(id, changedFields),
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["workLocation-list"] });
      client.invalidateQueries({ queryKey: ["workLocation", variables.id] });
    },
  });
}

/**
 * Delete a WorkLocation record by its unique identifier.
 */
export function useDeleteWorkLocation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => WorkLocationService.delete(id),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["workLocation-list"] });
      client.invalidateQueries({ queryKey: ["workLocation", id] });
    },
  });
}

/** Data source type for this table — drives InMemoryDataBanner visibility. */
export const WorkLocation_DATA_SOURCE_TYPE = 'InMemory' as const;

export { WorkLocationSchema, CreateWorkLocationSchema, UpdateWorkLocationSchema } from "../validators/work-location-validator";
export type { WorkLocationInput, CreateWorkLocationInput, UpdateWorkLocationInput } from "../validators/work-location-validator";