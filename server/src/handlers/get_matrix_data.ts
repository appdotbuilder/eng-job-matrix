import { db } from '../db';
import { 
  jobLevelsTable, 
  criteriaTable, 
  capabilitiesTable, 
  editHistoryTable, 
  overviewContentTable 
} from '../db/schema';
import { type EngineeringJobMatrixData, type MatrixFilters } from '../schema';
import { eq, and, inArray, or, ilike, desc, asc, SQL } from 'drizzle-orm';

export async function getMatrixData(filters?: MatrixFilters): Promise<EngineeringJobMatrixData> {
  try {
    // Fetch all job levels
    const jobLevels = await db.select().from(jobLevelsTable).execute();

    // Fetch all criteria
    const criteria = await db.select().from(criteriaTable).execute();

    // Build base query for capabilities
    const baseQuery = db.select({
      id: capabilitiesTable.id,
      job_level_id: capabilitiesTable.job_level_id,
      criterion_id: capabilitiesTable.criterion_id,
      description: capabilitiesTable.description,
      created_at: capabilitiesTable.created_at,
      // Include related data for filtering
      job_level_name: jobLevelsTable.name,
      criterion_category: criteriaTable.category,
      criterion_sub_category: criteriaTable.sub_category
    })
    .from(capabilitiesTable)
    .innerJoin(jobLevelsTable, eq(capabilitiesTable.job_level_id, jobLevelsTable.id))
    .innerJoin(criteriaTable, eq(capabilitiesTable.criterion_id, criteriaTable.id));

    // Build conditions array for filtering
    const conditions: SQL<unknown>[] = [];

    // Apply filters if provided
    if (filters) {
      // Filter by job levels
      if (filters.levels && filters.levels.length > 0) {
        conditions.push(inArray(capabilitiesTable.job_level_id, filters.levels));
      }

      // Filter by categories
      if (filters.categories && filters.categories.length > 0) {
        conditions.push(inArray(criteriaTable.category, filters.categories));
      }

      // Filter by sub-categories
      if (filters.subCategories && filters.subCategories.length > 0) {
        conditions.push(inArray(criteriaTable.sub_category, filters.subCategories));
      }

      // Filter by search query (search in description, job level name, category, sub-category)
      if (filters.search && filters.search.trim()) {
        const searchTerm = `%${filters.search.trim()}%`;
        conditions.push(
          or(
            ilike(capabilitiesTable.description, searchTerm),
            ilike(jobLevelsTable.name, searchTerm),
            ilike(criteriaTable.category, searchTerm),
            ilike(criteriaTable.sub_category, searchTerm)
          )!
        );
      }
    }

    // Execute query with or without conditions
    const capabilitiesResults = conditions.length > 0
      ? await baseQuery.where(
          conditions.length === 1 ? conditions[0] : and(...conditions)
        ).execute()
      : await baseQuery.execute();

    // Transform capabilities results back to the expected format
    const capabilities = capabilitiesResults.map(result => ({
      id: result.id,
      job_level_id: result.job_level_id,
      criterion_id: result.criterion_id,
      description: result.description,
      created_at: result.created_at
    }));

    // Fetch edit history ordered by date descending
    const editHistory = await db.select()
      .from(editHistoryTable)
      .orderBy(desc(editHistoryTable.date))
      .execute();

    // Fetch overview content ordered by order field
    const overviewContentResults = await db.select()
      .from(overviewContentTable)
      .orderBy(asc(overviewContentTable.order))
      .execute();

    // Group overview content by type
    const goals: string[] = [];
    const principles: string[] = [];

    overviewContentResults.forEach(item => {
      if (item.type === 'goal') {
        goals.push(item.content);
      } else if (item.type === 'principle') {
        principles.push(item.content);
      }
    });

    return {
      jobLevels,
      criteria,
      capabilities,
      editHistory,
      overview: {
        goals,
        principles
      }
    };
  } catch (error) {
    console.error('Failed to fetch matrix data:', error);
    throw error;
  }
}