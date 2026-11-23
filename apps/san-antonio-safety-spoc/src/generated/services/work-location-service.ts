import { getClient } from '../../../app-gen-sdk/data';
import type { WorkLocation } from '../models/work-location-model';
import type { IOperationOptions } from '../../../app-gen-sdk/data/common/types';

const DATA_SOURCE_NAME = 'WorkLocation';

export class WorkLocationService {
  static async create(record: Omit<WorkLocation, 'id'>): Promise<WorkLocation> {
    const result = await getClient().createRecordAsync(DATA_SOURCE_NAME, record);
    if (!result.success) throw result.error;
    return result.data as WorkLocation;
  }

  static async update(
    id: string,
    changedFields: Partial<Omit<WorkLocation, 'id'>>
  ): Promise<WorkLocation> {
    const result = await getClient().updateRecordAsync(DATA_SOURCE_NAME, id, changedFields);
    if (!result.success) throw result.error;
    return result.data as WorkLocation;
  }

  static async delete(id: string): Promise<void> {
    const result = await getClient().deleteRecordAsync(DATA_SOURCE_NAME, id);
    if (!result.success) throw result.error;
  }

  static async get(id: string): Promise<WorkLocation> {
    const result = await getClient().retrieveRecordAsync(DATA_SOURCE_NAME, id);
    if (!result.success) throw result.error;
    return result.data as WorkLocation;
  }

  static async getAll(options?: IOperationOptions): Promise<WorkLocation[]> {
    const result = await getClient().retrieveMultipleRecordsAsync(DATA_SOURCE_NAME, options);
    if (!result.success) throw result.error;
    return result.data as WorkLocation[];
  }
}