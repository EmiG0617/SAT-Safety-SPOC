import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuditSectionService } from "../services/audit-section-service";
import type { AuditSection } from "../models/audit-section-model";
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve all AuditSection records with optional filtering and sorting.
 * @param options Optional filtering and sorting options
 *   Available properties for sorting: id, auditSectionName, applicable, completionStatusKey, inspectionTypeSnapshot
 *   Filtering supports OData syntax, e.g., "status eq 'active'"
 */
export function useAuditSectionList(options?: IOperationOptions) {
  return useQuery({
    queryKey: ["auditSection-list", options],
    queryFn: () => AuditSectionService.getAll(options),
  });
}

/**
 * Retrieve a single AuditSection record by its unique identifier.
 * @param id The id of the record (must be a valid UUID)
 */
export function useAuditSection(id: string) {
  return useQuery({
    queryKey: ["auditSection", id],
    queryFn: () => AuditSectionService.get(id),
    enabled: !!id && UUID_REGEX.test(id),
  });
}

/**
 * Create a new AuditSection record.
 * @remarks Form validation: use CreateAuditSectionSchema with zodResolver for type-safe create forms
 */
export function useCreateAuditSection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AuditSection, "id">) => AuditSectionService.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["auditSection-list"] });
    },
  });
}

/**
 * Update an existing AuditSection record.
 * @remarks Form validation: use UpdateAuditSectionSchema.partial().omit({ id: true }) with zodResolver for edit forms (matches changedFields input)
 */
export function useUpdateAuditSection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<AuditSection, "id">>;
    }) => AuditSectionService.update(id, changedFields),
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["auditSection-list"] });
      client.invalidateQueries({ queryKey: ["auditSection", variables.id] });
    },
  });
}

/**
 * Delete a AuditSection record by its unique identifier.
 */
export function useDeleteAuditSection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AuditSectionService.delete(id),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["auditSection-list"] });
      client.invalidateQueries({ queryKey: ["auditSection", id] });
    },
  });
}

/** Data source type for this table — drives InMemoryDataBanner visibility. */
export const AuditSection_DATA_SOURCE_TYPE = 'InMemory' as const;

export { AuditSectionSchema, CreateAuditSectionSchema, UpdateAuditSectionSchema } from "../validators/audit-section-validator";
export type { AuditSectionInput, CreateAuditSectionInput, UpdateAuditSectionInput } from "../validators/audit-section-validator";