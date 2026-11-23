import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EvidenceService } from "../services/evidence-service";
import type { Evidence } from "../models/evidence-model";
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve all Evidence records with optional filtering and sorting.
 * @param options Optional filtering and sorting options
 *   Available properties for sorting: id, evidenceName, caption, createdDate, evidenceTypeKey, evidenceURL, fileName, photoDataURL
 *   Filtering supports OData syntax, e.g., "status eq 'active'"
 */
export function useEvidenceList(options?: IOperationOptions) {
  return useQuery({
    queryKey: ["evidence-list", options],
    queryFn: () => EvidenceService.getAll(options),
  });
}

/**
 * Retrieve a single Evidence record by its unique identifier.
 * @param id The id of the record (must be a valid UUID)
 */
export function useEvidence(id: string) {
  return useQuery({
    queryKey: ["evidence", id],
    queryFn: () => EvidenceService.get(id),
    enabled: !!id && UUID_REGEX.test(id),
  });
}

/**
 * Create a new Evidence record.
 * @remarks Form validation: use CreateEvidenceSchema with zodResolver for type-safe create forms
 */
export function useCreateEvidence() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Evidence, "id">) => EvidenceService.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["evidence-list"] });
    },
  });
}

/**
 * Update an existing Evidence record.
 * @remarks Form validation: use UpdateEvidenceSchema.partial().omit({ id: true }) with zodResolver for edit forms (matches changedFields input)
 */
export function useUpdateEvidence() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<Evidence, "id">>;
    }) => EvidenceService.update(id, changedFields),
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["evidence-list"] });
      client.invalidateQueries({ queryKey: ["evidence", variables.id] });
    },
  });
}

/**
 * Delete a Evidence record by its unique identifier.
 */
export function useDeleteEvidence() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => EvidenceService.delete(id),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["evidence-list"] });
      client.invalidateQueries({ queryKey: ["evidence", id] });
    },
  });
}

/** Data source type for this table — drives InMemoryDataBanner visibility. */
export const Evidence_DATA_SOURCE_TYPE = 'InMemory' as const;

export { EvidenceSchema, CreateEvidenceSchema, UpdateEvidenceSchema } from "../validators/evidence-validator";
export type { EvidenceInput, CreateEvidenceInput, UpdateEvidenceInput } from "../validators/evidence-validator";