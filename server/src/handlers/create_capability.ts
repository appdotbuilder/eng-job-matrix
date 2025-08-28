import { db } from '../db';
import { capabilitiesTable, jobLevelsTable, criteriaTable } from '../db/schema';
import { type CreateCapabilityInput, type Capability } from '../schema';
import { eq } from 'drizzle-orm';

export const createCapability = async (input: CreateCapabilityInput): Promise<Capability> => {
  try {
    // Validate that the referenced job level exists
    const jobLevel = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, input.job_level_id))
      .execute();

    if (jobLevel.length === 0) {
      throw new Error(`Job level with id '${input.job_level_id}' does not exist`);
    }

    // Validate that the referenced criterion exists
    const criterion = await db.select()
      .from(criteriaTable)
      .where(eq(criteriaTable.id, input.criterion_id))
      .execute();

    if (criterion.length === 0) {
      throw new Error(`Criterion with id '${input.criterion_id}' does not exist`);
    }

    // Insert the capability record
    const result = await db.insert(capabilitiesTable)
      .values({
        job_level_id: input.job_level_id,
        criterion_id: input.criterion_id,
        description: input.description
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Capability creation failed:', error);
    throw error;
  }
};