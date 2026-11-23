import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ReferenceDocumentService } from "../services/reference-document-service";
import type { ReferenceDocument } from "../models/reference-document-model";
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve all ReferenceDocument records with optional filtering and sorting.
 * @param options Optional filtering and sorting options
 *   Available properties for sorting: id, referenceDocumentName, active, categoryKey, sharePointURL, title
 *   Filtering supports OData syntax, e.g., "status eq 'active'"
 */
export function useReferenceDocumentList(options?: IOperationOptions) {
  return useQuery({
    queryKey: ["referenceDocument-list", options],
    queryFn: () => ReferenceDocumentService.getAll(options),
  });
}

/**
 * Retrieve a single ReferenceDocument record by its unique identifier.
 * @param id The id of the record (must be a valid UUID)
 */
export function useReferenceDocument(id: string) {
  return useQuery({
    queryKey: ["referenceDocument", id],
    queryFn: () => ReferenceDocumentService.get(id),
    enabled: !!id && UUID_REGEX.test(id),
  });
}

/**
 * Create a new ReferenceDocument record.
 * @remarks Form validation: use CreateReferenceDocumentSchema with zodResolver for type-safe create forms
 */
export function useCreateReferenceDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ReferenceDocument, "id">) => ReferenceDocumentService.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["referenceDocument-list"] });
    },
  });
}

/**
 * Update an existing ReferenceDocument record.
 * @remarks Form validation: use UpdateReferenceDocumentSchema.partial().omit({ id: true }) with zodResolver for edit forms (matches changedFields input)
 */
export function useUpdateReferenceDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<ReferenceDocument, "id">>;
    }) => ReferenceDocumentService.update(id, changedFields),
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["referenceDocument-list"] });
      client.invalidateQueries({ queryKey: ["referenceDocument", variables.id] });
    },
  });
}

/**
 * Delete a ReferenceDocument record by its unique identifier.
 */
export function useDeleteReferenceDocument() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ReferenceDocumentService.delete(id),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["referenceDocument-list"] });
      client.invalidateQueries({ queryKey: ["referenceDocument", id] });
    },
  });
}

/** Data source type for this table — drives InMemoryDataBanner visibility. */
export const ReferenceDocument_DATA_SOURCE_TYPE = 'InMemory' as const;

export { ReferenceDocumentSchema, CreateReferenceDocumentSchema, UpdateReferenceDocumentSchema } from "../validators/reference-document-validator";
export type { ReferenceDocumentInput, CreateReferenceDocumentInput, UpdateReferenceDocumentInput } from "../validators/reference-document-validator";