import { db } from '../db';
import { jobLevelsTable } from '../db/schema';
import { type JobLevel } from '../schema';

export const getJobLevels = async (): Promise<JobLevel[]> => {
  try {
    const results = await db.select()
      .from(jobLevelsTable)
      .orderBy(jobLevelsTable.created_at)
      .execute();

    // Return the results as-is since no numeric conversions are needed
    // All fields are text or timestamp types
    return results;
  } catch (error) {
    console.error('Failed to fetch job levels:', error);
    throw error;
  }
};