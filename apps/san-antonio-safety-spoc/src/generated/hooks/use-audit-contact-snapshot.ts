import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuditContactSnapshotService } from "../services/audit-contact-snapshot-service";
import type { AuditContactSnapshot } from "../models/audit-contact-snapshot-model";
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve all AuditContactSnapshot records with optional filtering and sorting.
 * @param options Optional filtering and sorting options
 *   Available properties for sorting: id, auditContactSnapshotName, additionalRecipient, address, city, postalCode, safetyOfficerSpecialist, state, supervisorEmail, supervisorName, supervisorNotDisplayed
 *   Filtering supports OData syntax, e.g., "status eq 'active'"
 */
export function useAuditContactSnapshotList(options?: IOperationOptions) {
  return useQuery({
    queryKey: ["auditContactSnapshot-list", options],
    queryFn: () => AuditContactSnapshotService.getAll(options),
  });
}

/**
 * Retrieve a single AuditContactSnapshot record by its unique identifier.
 * @param id The id of the record (must be a valid UUID)
 */
export function useAuditContactSnapshot(id: string) {
  return useQuery({
    queryKey: ["auditContactSnapshot", id],
    queryFn: () => AuditContactSnapshotService.get(id),
    enabled: !!id && UUID_REGEX.test(id),
  });
}

/**
 * Create a new AuditContactSnapshot record.
 * @remarks Form validation: use CreateAuditContactSnapshotSchema with zodResolver for type-safe create forms
 */
export function useCreateAuditContactSnapshot() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AuditContactSnapshot, "id">) => AuditContactSnapshotService.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["auditContactSnapshot-list"] });
    },
  });
}

/**
 * Update an existing AuditContactSnapshot record.
 * @remarks Form validation: use UpdateAuditContactSnapshotSchema.partial().omit({ id: true }) with zodResolver for edit forms (matches changedFields input)
 */
export function useUpdateAuditContactSnapshot() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<AuditContactSnapshot, "id">>;
    }) => AuditContactSnapshotService.update(id, changedFields),
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["auditContactSnapshot-list"] });
      client.invalidateQueries({ queryKey: ["auditContactSnapshot", variables.id] });
    },
  });
}

/**
 * Delete a AuditContactSnapshot record by its unique identifier.
 */
export function useDeleteAuditContactSnapshot() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AuditContactSnapshotService.delete(id),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["auditContactSnapshot-list"] });
      client.invalidateQueries({ queryKey: ["auditContactSnapshot", id] });
    },
  });
}

/** Data source type for this table — drives InMemoryDataBanner visibility. */
export const AuditContactSnapshot_DATA_SOURCE_TYPE = 'InMemory' as const;

export { AuditContactSnapshotSchema, CreateAuditContactSnapshotSchema, UpdateAuditContactSnapshotSchema } from "../validators/audit-contact-snapshot-validator";
export type { AuditContactSnapshotInput, CreateAuditContactSnapshotInput, UpdateAuditContactSnapshotInput } from "../validators/audit-contact-snapshot-validator";