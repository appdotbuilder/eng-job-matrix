import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobLevelsTable } from '../db/schema';
import { type CreateJobLevelInput } from '../schema';
import { getJobLevels } from '../handlers/get_job_levels';

// Test data for job levels
const testJobLevels: CreateJobLevelInput[] = [
  {
    id: 'l1-l2',
    name: 'L1 / L2',
    primary_title: 'Engineer',
    description_summary: 'Entry-level engineer focused on learning and contributing to straightforward tasks',
    trajectory_note: 'Typically 0-2 years of experience'
  },
  {
    id: 'l3',
    name: 'L3',
    primary_title: 'Engineer',
    description_summary: 'Competent engineer who can work independently on well-defined projects',
    trajectory_note: null
  },
  {
    id: 'tl1',
    name: 'TL1',
    primary_title: 'Tech Lead',
    description_summary: 'Technical leader who guides team decisions and mentors other engineers',
    trajectory_note: 'Leadership track with strong technical skills'
  }
];

describe('getJobLevels', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no job levels exist', async () => {
    const result = await getJobLevels();
    expect(result).toEqual([]);
  });

  it('should return all job levels', async () => {
    // Insert test job levels
    for (const jobLevel of testJobLevels) {
      await db.insert(jobLevelsTable)
        .values(jobLevel)
        .execute();
    }

    const result = await getJobLevels();

    expect(result).toHaveLength(3);
    
    // Verify all job levels are returned
    const resultIds = result.map(jl => jl.id).sort();
    const expectedIds = testJobLevels.map(jl => jl.id).sort();
    expect(resultIds).toEqual(expectedIds);

    // Verify structure of returned job levels
    result.forEach(jobLevel => {
      expect(jobLevel.id).toBeDefined();
      expect(jobLevel.name).toBeDefined();
      expect(jobLevel.primary_title).toBeDefined();
      expect(jobLevel.description_summary).toBeDefined();
      expect(jobLevel.created_at).toBeInstanceOf(Date);
      
      // trajectory_note can be null
      expect(typeof jobLevel.trajectory_note === 'string' || jobLevel.trajectory_note === null).toBe(true);
    });
  });

  it('should return job levels ordered by created_at', async () => {
    // Insert job levels with slight delay to ensure different timestamps
    await db.insert(jobLevelsTable)
      .values(testJobLevels[0])
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(jobLevelsTable)
      .values(testJobLevels[1])
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    await db.insert(jobLevelsTable)
      .values(testJobLevels[2])
      .execute();

    const result = await getJobLevels();

    expect(result).toHaveLength(3);

    // Verify ordering by created_at (should be in insertion order)
    expect(result[0].id).toEqual('l1-l2');
    expect(result[1].id).toEqual('l3');
    expect(result[2].id).toEqual('tl1');

    // Verify timestamps are in ascending order
    expect(result[0].created_at <= result[1].created_at).toBe(true);
    expect(result[1].created_at <= result[2].created_at).toBe(true);
  });

  it('should handle job levels with null trajectory_note', async () => {
    await db.insert(jobLevelsTable)
      .values(testJobLevels[1]) // This one has null trajectory_note
      .execute();

    const result = await getJobLevels();

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual('l3');
    expect(result[0].trajectory_note).toBeNull();
  });

  it('should handle job levels with non-null trajectory_note', async () => {
    await db.insert(jobLevelsTable)
      .values(testJobLevels[0]) // This one has a trajectory_note
      .execute();

    const result = await getJobLevels();

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual('l1-l2');
    expect(result[0].trajectory_note).toEqual('Typically 0-2 years of experience');
  });

  it('should return complete job level data', async () => {
    await db.insert(jobLevelsTable)
      .values(testJobLevels[0])
      .execute();

    const result = await getJobLevels();

    expect(result).toHaveLength(1);
    const jobLevel = result[0];

    // Verify all fields are present and correct
    expect(jobLevel.id).toEqual('l1-l2');
    expect(jobLevel.name).toEqual('L1 / L2');
    expect(jobLevel.primary_title).toEqual('Engineer');
    expect(jobLevel.description_summary).toEqual('Entry-level engineer focused on learning and contributing to straightforward tasks');
    expect(jobLevel.trajectory_note).toEqual('Typically 0-2 years of experience');
    expect(jobLevel.created_at).toBeInstanceOf(Date);
  });
});