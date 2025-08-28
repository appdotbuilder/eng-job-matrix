import { db } from '../db';
import { jobLevelsTable } from '../db/schema';
import { type CreateJobLevelInput, type JobLevel } from '../schema';

export const createJobLevel = async (input: CreateJobLevelInput): Promise<JobLevel> => {
  try {
    // Insert job level record
    const result = await db.insert(jobLevelsTable)
      .values({
        id: input.id,
        name: input.name,
        primary_title: input.primary_title,
        description_summary: input.description_summary,
        trajectory_note: input.trajectory_note
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Job level creation failed:', error);
    throw error;
  }
};