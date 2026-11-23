import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChoiceSetService } from "../services/choice-set-service";
import type { ChoiceSet } from "../models/choice-set-model";
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve all ChoiceSet records with optional filtering and sorting.
 * @param options Optional filtering and sorting options
 *   Available properties for sorting: id, choiceSetName, active, options
 *   Filtering supports OData syntax, e.g., "status eq 'active'"
 */
export function useChoiceSetList(options?: IOperationOptions) {
  return useQuery({
    queryKey: ["choiceSet-list", options],
    queryFn: () => ChoiceSetService.getAll(options),
  });
}

/**
 * Retrieve a single ChoiceSet record by its unique identifier.
 * @param id The id of the record (must be a valid UUID)
 */
export function useChoiceSet(id: string) {
  return useQuery({
    queryKey: ["choiceSet", id],
    queryFn: () => ChoiceSetService.get(id),
    enabled: !!id && UUID_REGEX.test(id),
  });
}

/**
 * Create a new ChoiceSet record.
 * @remarks Form validation: use CreateChoiceSetSchema with zodResolver for type-safe create forms
 */
export function useCreateChoiceSet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ChoiceSet, "id">) => ChoiceSetService.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["choiceSet-list"] });
    },
  });
}

/**
 * Update an existing ChoiceSet record.
 * @remarks Form validation: use UpdateChoiceSetSchema.partial().omit({ id: true }) with zodResolver for edit forms (matches changedFields input)
 */
export function useUpdateChoiceSet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<ChoiceSet, "id">>;
    }) => ChoiceSetService.update(id, changedFields),
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["choiceSet-list"] });
      client.invalidateQueries({ queryKey: ["choiceSet", variables.id] });
    },
  });
}

/**
 * Delete a ChoiceSet record by its unique identifier.
 */
export function useDeleteChoiceSet() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ChoiceSetService.delete(id),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["choiceSet-list"] });
      client.invalidateQueries({ queryKey: ["choiceSet", id] });
    },
  });
}

/** Data source type for this table — drives InMemoryDataBanner visibility. */
export const ChoiceSet_DATA_SOURCE_TYPE = 'InMemory' as const;

export { ChoiceSetSchema, CreateChoiceSetSchema, UpdateChoiceSetSchema } from "../validators/choice-set-validator";
export type { ChoiceSetInput, CreateChoiceSetInput, UpdateChoiceSetInput } from "../validators/choice-set-validator";