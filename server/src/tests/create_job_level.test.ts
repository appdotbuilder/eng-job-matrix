import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobLevelsTable } from '../db/schema';
import { type CreateJobLevelInput } from '../schema';
import { createJobLevel } from '../handlers/create_job_level';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateJobLevelInput = {
  id: 'l1-l2',
  name: 'L1 / L2',
  primary_title: 'Software Engineer',
  description_summary: 'Entry-level engineers learning the fundamentals',
  trajectory_note: 'Focus on building technical skills and domain knowledge'
};

// Test input with nullable field
const testInputWithNullTrajectory: CreateJobLevelInput = {
  id: 'tl1',
  name: 'TL1',
  primary_title: 'Tech Lead',
  description_summary: 'Technical leadership with hands-on coding',
  trajectory_note: null
};

describe('createJobLevel', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a job level with all fields', async () => {
    const result = await createJobLevel(testInput);

    // Verify all fields are correctly set
    expect(result.id).toEqual('l1-l2');
    expect(result.name).toEqual('L1 / L2');
    expect(result.primary_title).toEqual('Software Engineer');
    expect(result.description_summary).toEqual('Entry-level engineers learning the fundamentals');
    expect(result.trajectory_note).toEqual('Focus on building technical skills and domain knowledge');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should create a job level with null trajectory_note', async () => {
    const result = await createJobLevel(testInputWithNullTrajectory);

    // Verify nullable field handling
    expect(result.id).toEqual('tl1');
    expect(result.name).toEqual('TL1');
    expect(result.primary_title).toEqual('Tech Lead');
    expect(result.description_summary).toEqual('Technical leadership with hands-on coding');
    expect(result.trajectory_note).toBeNull();
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save job level to database', async () => {
    const result = await createJobLevel(testInput);

    // Query database to verify persistence
    const jobLevels = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, result.id))
      .execute();

    expect(jobLevels).toHaveLength(1);
    expect(jobLevels[0].id).toEqual('l1-l2');
    expect(jobLevels[0].name).toEqual('L1 / L2');
    expect(jobLevels[0].primary_title).toEqual('Software Engineer');
    expect(jobLevels[0].description_summary).toEqual('Entry-level engineers learning the fundamentals');
    expect(jobLevels[0].trajectory_note).toEqual('Focus on building technical skills and domain knowledge');
    expect(jobLevels[0].created_at).toBeInstanceOf(Date);
  });

  it('should create multiple job levels with unique IDs', async () => {
    // Create first job level
    const result1 = await createJobLevel(testInput);
    
    // Create second job level with different ID
    const input2: CreateJobLevelInput = {
      id: 'em1',
      name: 'EM1',
      primary_title: 'Engineering Manager',
      description_summary: 'First-line engineering management',
      trajectory_note: 'Learning to manage people and projects'
    };
    const result2 = await createJobLevel(input2);

    // Verify both are created and distinct
    expect(result1.id).toEqual('l1-l2');
    expect(result2.id).toEqual('em1');

    // Verify both exist in database
    const allJobLevels = await db.select()
      .from(jobLevelsTable)
      .execute();

    expect(allJobLevels).toHaveLength(2);
    const ids = allJobLevels.map(jl => jl.id);
    expect(ids).toContain('l1-l2');
    expect(ids).toContain('em1');
  });

  it('should reject duplicate job level IDs', async () => {
    // Create first job level
    await createJobLevel(testInput);

    // Try to create another job level with same ID
    const duplicateInput: CreateJobLevelInput = {
      id: 'l1-l2', // Same ID as testInput
      name: 'Duplicate Level',
      primary_title: 'Duplicate Title',
      description_summary: 'This should fail',
      trajectory_note: null
    };

    // Should throw error for duplicate primary key
    expect(createJobLevel(duplicateInput)).rejects.toThrow(/duplicate key value/i);
  });
});