import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApplicationUserService } from "../services/application-user-service";
import type { ApplicationUser } from "../models/application-user-model";
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Retrieve all ApplicationUser records with optional filtering and sorting.
 * @param options Optional filtering and sorting options
 *   Available properties for sorting: id, applicationUserName, active, email, phone, roleKey
 *   Filtering supports OData syntax, e.g., "status eq 'active'"
 */
export function useApplicationUserList(options?: IOperationOptions) {
  return useQuery({
    queryKey: ["applicationUser-list", options],
    queryFn: () => ApplicationUserService.getAll(options),
  });
}

/**
 * Retrieve a single ApplicationUser record by its unique identifier.
 * @param id The id of the record (must be a valid UUID)
 */
export function useApplicationUser(id: string) {
  return useQuery({
    queryKey: ["applicationUser", id],
    queryFn: () => ApplicationUserService.get(id),
    enabled: !!id && UUID_REGEX.test(id),
  });
}

/**
 * Create a new ApplicationUser record.
 * @remarks Form validation: use CreateApplicationUserSchema with zodResolver for type-safe create forms
 */
export function useCreateApplicationUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ApplicationUser, "id">) => ApplicationUserService.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["applicationUser-list"] });
    },
  });
}

/**
 * Update an existing ApplicationUser record.
 * @remarks Form validation: use UpdateApplicationUserSchema.partial().omit({ id: true }) with zodResolver for edit forms (matches changedFields input)
 */
export function useUpdateApplicationUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      changedFields,
    }: {
      id: string;
      changedFields: Partial<Omit<ApplicationUser, "id">>;
    }) => ApplicationUserService.update(id, changedFields),
    onSuccess: (_data, variables) => {
      client.invalidateQueries({ queryKey: ["applicationUser-list"] });
      client.invalidateQueries({ queryKey: ["applicationUser", variables.id] });
    },
  });
}

/**
 * Delete a ApplicationUser record by its unique identifier.
 */
export function useDeleteApplicationUser() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ApplicationUserService.delete(id),
    onSuccess: (_data, id) => {
      client.invalidateQueries({ queryKey: ["applicationUser-list"] });
      client.invalidateQueries({ queryKey: ["applicationUser", id] });
    },
  });
}

/** Data source type for this table — drives InMemoryDataBanner visibility. */
export const ApplicationUser_DATA_SOURCE_TYPE = 'InMemory' as const;

export { ApplicationUserSchema, CreateApplicationUserSchema, UpdateApplicationUserSchema } from "../validators/application-user-validator";
export type { ApplicationUserInput, CreateApplicationUserInput, UpdateApplicationUserInput } from "../validators/application-user-validator";