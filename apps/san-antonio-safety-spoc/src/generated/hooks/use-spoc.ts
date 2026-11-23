import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SPOCService } from "../services/spoc-service";
import type { SPOC } from "../models/spoc-model";
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve all SPOC records with optional filtering and sorting.
 * @param options Optional filtering and sorting options
 *   Available properties for sorting: id, sPOCName, email, reviewFlag, reviewNotes, section, sPOCRoleKey, supervisorEmail, supervisorName
 *   Filtering supports OData syntax, e.g., "status eq 'active'"
 */
export function useSPOCList(options?: IOperationOptions) {
  return useQuery({
    queryKey: ["sPOC-list", options],
    queryFn: () => SPOCService.getAll(options),
  });
}

/**
 * Retrieve a single SPOC record by its unique identifier.
 * @param id The id of the record (must be a valid UUID)
 */
export function useSPOC(id: string) {
  return useQuery({
    queryKey: ["sPOC", id],
    queryFn: () => SPOCService.get(id),
    enabled: !!id && UUID_REGEX.test(id),
  });
}

/**
 * Create a new SPOC record.
 * @remarks Form validation: use CreateSPOCSchema with zodResolver for type-safe create forms
 */
export function useCreateSPOC() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<SPOC, "id">) => SPOCService.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["sPOC-list"] });
    },
  });
}

/**
 * Update an existing SPOC record.
 * @remarks Form validation: use UpdateSPOCSchema.partial().omit({ id: true }) with zodResolver for edit forms (matches changedFields input)
 */
export function useUpdateSPOC() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<SPOC, "id">>;
    }) => SPOCService.update(id, changedFields),
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["sPOC-list"] });
      client.invalidateQueries({ queryKey: ["sPOC", variables.id] });
    },
  });
}

/**
 * Delete a SPOC record by its unique identifier.
 */
export function useDeleteSPOC() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SPOCService.delete(id),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["sPOC-list"] });
      client.invalidateQueries({ queryKey: ["sPOC", id] });
    },
  });
}

/** Data source type for this table — drives InMemoryDataBanner visibility. */
export const SPOC_DATA_SOURCE_TYPE = 'InMemory' as const;

export { SPOCSchema, CreateSPOCSchema, UpdateSPOCSchema } from "../validators/spoc-validator";
export type { SPOCInput, CreateSPOCInput, UpdateSPOCInput } from "../validators/spoc-validator";