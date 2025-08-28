import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { capabilitiesTable, jobLevelsTable, criteriaTable } from '../db/schema';
import { type CreateCapabilityInput } from '../schema';
import { createCapability } from '../handlers/create_capability';
import { eq } from 'drizzle-orm';

// Test data setup
const testJobLevel = {
  id: 'l1-l2',
  name: 'L1 / L2',
  primary_title: 'Engineer',
  description_summary: 'Junior engineering role',
  trajectory_note: 'Learning fundamentals'
};

const testCriterion = {
  id: 'craft-technical-expertise',
  category: 'Craft',
  sub_category: 'Technical Expertise'
};

const testInput: CreateCapabilityInput = {
  job_level_id: 'l1-l2',
  criterion_id: 'craft-technical-expertise',
  description: 'Demonstrates basic programming skills and understanding of fundamental concepts'
};

describe('createCapability', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create prerequisite data
  const createPrerequisites = async () => {
    // Create job level
    await db.insert(jobLevelsTable)
      .values(testJobLevel)
      .execute();

    // Create criterion
    await db.insert(criteriaTable)
      .values(testCriterion)
      .execute();
  };

  it('should create a capability with valid prerequisites', async () => {
    await createPrerequisites();
    
    const result = await createCapability(testInput);

    // Validate returned capability
    expect(result.job_level_id).toEqual('l1-l2');
    expect(result.criterion_id).toEqual('craft-technical-expertise');
    expect(result.description).toEqual(testInput.description);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save capability to database', async () => {
    await createPrerequisites();
    
    const result = await createCapability(testInput);

    // Query database to verify the capability was saved
    const capabilities = await db.select()
      .from(capabilitiesTable)
      .where(eq(capabilitiesTable.id, result.id))
      .execute();

    expect(capabilities).toHaveLength(1);
    expect(capabilities[0].job_level_id).toEqual('l1-l2');
    expect(capabilities[0].criterion_id).toEqual('craft-technical-expertise');
    expect(capabilities[0].description).toEqual(testInput.description);
    expect(capabilities[0].created_at).toBeInstanceOf(Date);
  });

  it('should throw error when job level does not exist', async () => {
    // Only create criterion, not job level
    await db.insert(criteriaTable)
      .values(testCriterion)
      .execute();

    const inputWithInvalidJobLevel: CreateCapabilityInput = {
      ...testInput,
      job_level_id: 'invalid-job-level'
    };

    await expect(createCapability(inputWithInvalidJobLevel))
      .rejects.toThrow(/job level with id 'invalid-job-level' does not exist/i);
  });

  it('should throw error when criterion does not exist', async () => {
    // Only create job level, not criterion
    await db.insert(jobLevelsTable)
      .values(testJobLevel)
      .execute();

    const inputWithInvalidCriterion: CreateCapabilityInput = {
      ...testInput,
      criterion_id: 'invalid-criterion'
    };

    await expect(createCapability(inputWithInvalidCriterion))
      .rejects.toThrow(/criterion with id 'invalid-criterion' does not exist/i);
  });

  it('should throw error when both job level and criterion do not exist', async () => {
    // Create capability without any prerequisites
    const inputWithInvalidReferences: CreateCapabilityInput = {
      job_level_id: 'non-existent-level',
      criterion_id: 'non-existent-criterion',
      description: 'Test description'
    };

    // Should fail on the first validation (job level)
    await expect(createCapability(inputWithInvalidReferences))
      .rejects.toThrow(/job level with id 'non-existent-level' does not exist/i);
  });

  it('should create multiple capabilities for the same job level', async () => {
    await createPrerequisites();
    
    // Create additional criterion
    const secondCriterion = {
      id: 'impact-delivery',
      category: 'Impact',
      sub_category: 'Delivery'
    };
    
    await db.insert(criteriaTable)
      .values(secondCriterion)
      .execute();

    // Create first capability
    const firstResult = await createCapability(testInput);

    // Create second capability for the same job level
    const secondInput: CreateCapabilityInput = {
      job_level_id: 'l1-l2',
      criterion_id: 'impact-delivery',
      description: 'Delivers small features with guidance'
    };
    
    const secondResult = await createCapability(secondInput);

    // Verify both capabilities exist and have different IDs
    expect(firstResult.id).not.toEqual(secondResult.id);
    expect(firstResult.job_level_id).toEqual(secondResult.job_level_id);
    expect(firstResult.criterion_id).not.toEqual(secondResult.criterion_id);

    // Verify both are saved in database
    const capabilities = await db.select()
      .from(capabilitiesTable)
      .where(eq(capabilitiesTable.job_level_id, 'l1-l2'))
      .execute();

    expect(capabilities).toHaveLength(2);
  });

  it('should create capabilities for different job levels with same criterion', async () => {
    await createPrerequisites();
    
    // Create additional job level
    const secondJobLevel = {
      id: 'l3',
      name: 'L3',
      primary_title: 'Senior Engineer',
      description_summary: 'Experienced engineering role',
      trajectory_note: null
    };
    
    await db.insert(jobLevelsTable)
      .values(secondJobLevel)
      .execute();

    // Create first capability
    const firstResult = await createCapability(testInput);

    // Create second capability for different job level
    const secondInput: CreateCapabilityInput = {
      job_level_id: 'l3',
      criterion_id: 'craft-technical-expertise',
      description: 'Demonstrates advanced technical skills and system design knowledge'
    };
    
    const secondResult = await createCapability(secondInput);

    // Verify both capabilities exist and have different characteristics
    expect(firstResult.id).not.toEqual(secondResult.id);
    expect(firstResult.job_level_id).not.toEqual(secondResult.job_level_id);
    expect(firstResult.criterion_id).toEqual(secondResult.criterion_id);
    expect(firstResult.description).not.toEqual(secondResult.description);
  });
});