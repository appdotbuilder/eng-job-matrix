import { db } from '../db';
import { criteriaTable } from '../db/schema';
import { type Criterion } from '../schema';

export const getCriteria = async (): Promise<Criterion[]> => {
  try {
    // Fetch all criteria from the database
    const results = await db.select()
      .from(criteriaTable)
      .execute();

    // Return criteria with proper type conversion for dates
    return results.map(criterion => ({
      ...criterion,
      created_at: criterion.created_at // timestamp is already a Date object
    }));
  } catch (error) {
    console.error('Failed to fetch criteria:', error);
    throw error;
  }
};