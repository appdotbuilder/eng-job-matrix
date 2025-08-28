import { db } from '../db';
import { criteriaTable } from '../db/schema';
import { type CreateCriterionInput, type Criterion } from '../schema';

export const createCriterion = async (input: CreateCriterionInput): Promise<Criterion> => {
  try {
    // Insert criterion record
    const result = await db.insert(criteriaTable)
      .values({
        id: input.id,
        category: input.category,
        sub_category: input.sub_category
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Criterion creation failed:', error);
    throw error;
  }
};