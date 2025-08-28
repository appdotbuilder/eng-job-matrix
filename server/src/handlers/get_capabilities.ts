import { db } from '../db';
import { capabilitiesTable, jobLevelsTable, criteriaTable } from '../db/schema';
import { type Capability, type MatrixFilters } from '../schema';
import { eq, and, inArray, ilike, type SQL } from 'drizzle-orm';

export async function getCapabilities(filters?: MatrixFilters): Promise<Capability[]> {
  try {
    // Build conditions array for filters
    const conditions: SQL<unknown>[] = [];

    if (filters) {
      // Filter by job level IDs
      if (filters.levels && filters.levels.length > 0) {
        conditions.push(inArray(capabilitiesTable.job_level_id, filters.levels));
      }

      // Filter by category names
      if (filters.categories && filters.categories.length > 0) {
        conditions.push(inArray(criteriaTable.category, filters.categories));
      }

      // Filter by sub-category names
      if (filters.subCategories && filters.subCategories.length > 0) {
        conditions.push(inArray(criteriaTable.sub_category, filters.subCategories));
      }

      // Search within capability descriptions (case-insensitive)
      if (filters.search && filters.search.trim() !== '') {
        conditions.push(ilike(capabilitiesTable.description, `%${filters.search.trim()}%`));
      }
    }

    // Build query with conditional where clause
    let query = db.select({
      id: capabilitiesTable.id,
      job_level_id: capabilitiesTable.job_level_id,
      criterion_id: capabilitiesTable.criterion_id,
      description: capabilitiesTable.description,
      created_at: capabilitiesTable.created_at,
    })
      .from(capabilitiesTable)
      .innerJoin(jobLevelsTable, eq(capabilitiesTable.job_level_id, jobLevelsTable.id))
      .innerJoin(criteriaTable, eq(capabilitiesTable.criterion_id, criteriaTable.id));

    // Execute query with or without conditions
    const results = conditions.length > 0
      ? await query.where(conditions.length === 1 ? conditions[0] : and(...conditions)).execute()
      : await query.execute();

    // Transform results to match Capability schema
    return results.map(result => ({
      id: result.id,
      job_level_id: result.job_level_id,
      criterion_id: result.criterion_id,
      description: result.description,
      created_at: result.created_at,
    }));
  } catch (error) {
    console.error('Failed to get capabilities:', error);
    throw error;
  }
}