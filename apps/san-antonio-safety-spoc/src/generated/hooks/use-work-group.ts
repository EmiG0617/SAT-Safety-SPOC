import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkGroupService } from "../services/work-group-service";
import type { WorkGroup } from "../models/work-group-model";
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve all WorkGroup records with optional filtering and sorting.
 * @param options Optional filtering and sorting options
 *   Available properties for sorting: id, workGroupName, active
 *   Filtering supports OData syntax, e.g., "status eq 'active'"
 */
export function useWorkGroupList(options?: IOperationOptions) {
  return useQuery({
    queryKey: ["workGroup-list", options],
    queryFn: () => WorkGroupService.getAll(options),
  });
}

/**
 * Retrieve a single WorkGroup record by its unique identifier.
 * @param id The id of the record (must be a valid UUID)
 */
export function useWorkGroup(id: string) {
  return useQuery({
    queryKey: ["workGroup", id],
    queryFn: () => WorkGroupService.get(id),
    enabled: !!id && UUID_REGEX.test(id),
  });
}

/**
 * Create a new WorkGroup record.
 * @remarks Form validation: use CreateWorkGroupSchema with zodResolver for type-safe create forms
 */
export function useCreateWorkGroup() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<WorkGroup, "id">) => WorkGroupService.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["workGroup-list"] });
    },
  });
}

/**
 * Update an existing WorkGroup record.
 * @remarks Form validation: use UpdateWorkGroupSchema.partial().omit({ id: true }) with zodResolver for edit forms (matches changedFields input)
 */
export function useUpdateWorkGroup() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<WorkGroup, "id">>;
    }) => WorkGroupService.update(id, changedFields),
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["workGroup-list"] });
      client.invalidateQueries({ queryKey: ["workGroup", variables.id] });
    },
  });
}

/**
 * Delete a WorkGroup record by its unique identifier.
 */
export function useDeleteWorkGroup() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => WorkGroupService.delete(id),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["workGroup-list"] });
      client.invalidateQueries({ queryKey: ["workGroup", id] });
    },
  });
}

/** Data source type for this table — drives InMemoryDataBanner visibility. */
export const WorkGroup_DATA_SOURCE_TYPE = 'InMemory' as const;

export { WorkGroupSchema, CreateWorkGroupSchema, UpdateWorkGroupSchema } from "../validators/work-group-validator";
export type { WorkGroupInput, CreateWorkGroupInput, UpdateWorkGroupInput } from "../validators/work-group-validator";