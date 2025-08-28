import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { criteriaTable } from '../db/schema';
import { type CreateCriterionInput } from '../schema';
import { createCriterion } from '../handlers/create_criterion';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateCriterionInput = {
  id: 'craft-technical-expertise',
  category: 'Craft',
  sub_category: 'Technical Expertise'
};

describe('createCriterion', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a criterion', async () => {
    const result = await createCriterion(testInput);

    // Basic field validation
    expect(result.id).toEqual('craft-technical-expertise');
    expect(result.category).toEqual('Craft');
    expect(result.sub_category).toEqual('Technical Expertise');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save criterion to database', async () => {
    const result = await createCriterion(testInput);

    // Query using proper drizzle syntax
    const criteria = await db.select()
      .from(criteriaTable)
      .where(eq(criteriaTable.id, result.id))
      .execute();

    expect(criteria).toHaveLength(1);
    expect(criteria[0].id).toEqual('craft-technical-expertise');
    expect(criteria[0].category).toEqual('Craft');
    expect(criteria[0].sub_category).toEqual('Technical Expertise');
    expect(criteria[0].created_at).toBeInstanceOf(Date);
  });

  it('should create criterion with different categories', async () => {
    const impactInput: CreateCriterionInput = {
      id: 'impact-business-value',
      category: 'Impact',
      sub_category: 'Business Value'
    };

    const result = await createCriterion(impactInput);

    expect(result.id).toEqual('impact-business-value');
    expect(result.category).toEqual('Impact');
    expect(result.sub_category).toEqual('Business Value');
  });

  it('should create multiple criteria independently', async () => {
    const firstInput: CreateCriterionInput = {
      id: 'craft-code-quality',
      category: 'Craft',
      sub_category: 'Code Quality'
    };

    const secondInput: CreateCriterionInput = {
      id: 'collaboration-communication',
      category: 'Collaboration',
      sub_category: 'Communication'
    };

    const first = await createCriterion(firstInput);
    const second = await createCriterion(secondInput);

    // Verify both records exist in database
    const allCriteria = await db.select()
      .from(criteriaTable)
      .execute();

    expect(allCriteria).toHaveLength(2);
    
    const firstRecord = allCriteria.find(c => c.id === 'craft-code-quality');
    const secondRecord = allCriteria.find(c => c.id === 'collaboration-communication');

    expect(firstRecord).toBeDefined();
    expect(firstRecord?.category).toEqual('Craft');
    expect(firstRecord?.sub_category).toEqual('Code Quality');

    expect(secondRecord).toBeDefined();
    expect(secondRecord?.category).toEqual('Collaboration');
    expect(secondRecord?.sub_category).toEqual('Communication');
  });

  it('should handle duplicate id error', async () => {
    // Create first criterion
    await createCriterion(testInput);

    // Try to create duplicate - should throw error
    await expect(createCriterion(testInput)).rejects.toThrow(/duplicate key value/i);
  });

  it('should handle special characters in criterion data', async () => {
    const specialInput: CreateCriterionInput = {
      id: 'craft-api-design',
      category: 'Craft & Engineering',
      sub_category: 'API Design & Documentation'
    };

    const result = await createCriterion(specialInput);

    expect(result.category).toEqual('Craft & Engineering');
    expect(result.sub_category).toEqual('API Design & Documentation');

    // Verify in database
    const dbRecord = await db.select()
      .from(criteriaTable)
      .where(eq(criteriaTable.id, 'craft-api-design'))
      .execute();

    expect(dbRecord[0].category).toEqual('Craft & Engineering');
    expect(dbRecord[0].sub_category).toEqual('API Design & Documentation');
  });
});