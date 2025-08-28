import { db } from '../db';
import { capabilitiesTable, jobLevelsTable, criteriaTable } from '../db/schema';
import { type Capability } from '../schema';
import { eq, and, inArray, ilike, SQL } from 'drizzle-orm';

export async function searchCapabilities(query: string, filters?: {
  levels?: string[];
  categories?: string[];
  subCategories?: string[];
}): Promise<Capability[]> {
  try {
    // Start with base query joining all necessary tables for filtering
    let baseQuery = db.select({
      id: capabilitiesTable.id,
      job_level_id: capabilitiesTable.job_level_id,
      criterion_id: capabilitiesTable.criterion_id,
      description: capabilitiesTable.description,
      created_at: capabilitiesTable.created_at
    })
    .from(capabilitiesTable)
    .innerJoin(jobLevelsTable, eq(capabilitiesTable.job_level_id, jobLevelsTable.id))
    .innerJoin(criteriaTable, eq(capabilitiesTable.criterion_id, criteriaTable.id));

    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    // Add search query condition - case-insensitive search in description
    if (query.trim()) {
      conditions.push(ilike(capabilitiesTable.description, `%${query.trim()}%`));
    }

    // Add level filters
    if (filters?.levels && filters.levels.length > 0) {
      conditions.push(inArray(jobLevelsTable.id, filters.levels));
    }

    // Add category filters
    if (filters?.categories && filters.categories.length > 0) {
      conditions.push(inArray(criteriaTable.category, filters.categories));
    }

    // Add sub-category filters
    if (filters?.subCategories && filters.subCategories.length > 0) {
      conditions.push(inArray(criteriaTable.sub_category, filters.subCategories));
    }

    // Apply all conditions if any exist
    const finalQuery = conditions.length > 0 
      ? baseQuery.where(conditions.length === 1 ? conditions[0] : and(...conditions))
      : baseQuery;

    // Execute query and get results
    const results = await finalQuery.execute();

    // Return the capabilities - no numeric conversions needed as all fields are text/int
    return results;
  } catch (error) {
    console.error('Search capabilities failed:', error);
    throw error;
  }
}