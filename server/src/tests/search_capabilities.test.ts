import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobLevelsTable, criteriaTable, capabilitiesTable } from '../db/schema';
import { searchCapabilities } from '../handlers/search_capabilities';

// Test data setup
const testJobLevel = {
  id: 'l1-l2',
  name: 'L1 / L2',
  primary_title: 'Engineer',
  description_summary: 'Entry-level software engineer',
  trajectory_note: 'Focus on learning fundamentals'
};

const testJobLevel2 = {
  id: 'l3',
  name: 'L3',
  primary_title: 'Senior Engineer',
  description_summary: 'Experienced software engineer',
  trajectory_note: null
};

const testCriterion1 = {
  id: 'craft-technical-expertise',
  category: 'Craft',
  sub_category: 'Technical Expertise'
};

const testCriterion2 = {
  id: 'impact-delivery',
  category: 'Impact',
  sub_category: 'Delivery'
};

const testCapability1 = {
  job_level_id: 'l1-l2',
  criterion_id: 'craft-technical-expertise',
  description: 'Demonstrates basic programming skills and follows established patterns. Writes clean, readable code with proper documentation.'
};

const testCapability2 = {
  job_level_id: 'l1-l2',
  criterion_id: 'impact-delivery',
  description: 'Completes assigned tasks on time with minimal supervision. Participates actively in team meetings and code reviews.'
};

const testCapability3 = {
  job_level_id: 'l3',
  criterion_id: 'craft-technical-expertise',
  description: 'Architects and implements complex technical solutions. Mentors junior developers and leads technical discussions.'
};

describe('searchCapabilities', () => {
  beforeEach(async () => {
    await createDB();
    
    // Insert test data - job levels first
    await db.insert(jobLevelsTable).values([testJobLevel, testJobLevel2]).execute();
    
    // Insert criteria
    await db.insert(criteriaTable).values([testCriterion1, testCriterion2]).execute();
    
    // Insert capabilities
    await db.insert(capabilitiesTable).values([
      testCapability1,
      testCapability2,
      testCapability3
    ]).execute();
  });

  afterEach(resetDB);

  it('should return all capabilities when no query or filters provided', async () => {
    const results = await searchCapabilities('');

    expect(results).toHaveLength(3);
    expect(results[0].description).toBeDefined();
    expect(results[0].job_level_id).toBeDefined();
    expect(results[0].criterion_id).toBeDefined();
    expect(results[0].created_at).toBeInstanceOf(Date);
  });

  it('should perform case-insensitive search in descriptions', async () => {
    const results = await searchCapabilities('PROGRAMMING');

    expect(results).toHaveLength(1);
    expect(results[0].description).toContain('programming skills');
    expect(results[0].job_level_id).toEqual('l1-l2');
  });

  it('should search for partial matches in descriptions', async () => {
    const results = await searchCapabilities('technical');

    expect(results).toHaveLength(1);
    expect(results.every(r => r.description.toLowerCase().includes('technical'))).toBe(true);
    expect(results[0].job_level_id).toEqual('l3');
  });

  it('should return empty array when search query has no matches', async () => {
    const results = await searchCapabilities('nonexistent search term');

    expect(results).toHaveLength(0);
  });

  it('should filter by job levels', async () => {
    const results = await searchCapabilities('', {
      levels: ['l1-l2']
    });

    expect(results).toHaveLength(2);
    expect(results.every(r => r.job_level_id === 'l1-l2')).toBe(true);
  });

  it('should filter by multiple job levels', async () => {
    const results = await searchCapabilities('', {
      levels: ['l1-l2', 'l3']
    });

    expect(results).toHaveLength(3);
    expect(results.some(r => r.job_level_id === 'l1-l2')).toBe(true);
    expect(results.some(r => r.job_level_id === 'l3')).toBe(true);
  });

  it('should filter by categories', async () => {
    const results = await searchCapabilities('', {
      categories: ['Craft']
    });

    expect(results).toHaveLength(2);
    expect(results.every(r => r.criterion_id === 'craft-technical-expertise')).toBe(true);
  });

  it('should filter by sub-categories', async () => {
    const results = await searchCapabilities('', {
      subCategories: ['Delivery']
    });

    expect(results).toHaveLength(1);
    expect(results[0].criterion_id).toEqual('impact-delivery');
    expect(results[0].description).toContain('Completes assigned tasks');
  });

  it('should combine search query with level filters', async () => {
    const results = await searchCapabilities('code', {
      levels: ['l1-l2']
    });

    expect(results).toHaveLength(2);
    expect(results.every(r => r.job_level_id === 'l1-l2')).toBe(true);
    expect(results.every(r => r.description.toLowerCase().includes('code'))).toBe(true);
  });

  it('should combine multiple filter types', async () => {
    const results = await searchCapabilities('technical', {
      levels: ['l3'],
      categories: ['Craft']
    });

    expect(results).toHaveLength(1);
    expect(results[0].job_level_id).toEqual('l3');
    expect(results[0].criterion_id).toEqual('craft-technical-expertise');
    expect(results[0].description).toContain('technical solutions');
  });

  it('should handle empty filter arrays', async () => {
    const results = await searchCapabilities('', {
      levels: [],
      categories: [],
      subCategories: []
    });

    expect(results).toHaveLength(3);
  });

  it('should handle whitespace-only search queries', async () => {
    const results = await searchCapabilities('   ');

    expect(results).toHaveLength(3);
  });

  it('should return capabilities with all required fields', async () => {
    const results = await searchCapabilities('programming');

    expect(results).toHaveLength(1);
    const capability = results[0];
    
    expect(capability.id).toBeDefined();
    expect(typeof capability.id).toBe('number');
    expect(capability.job_level_id).toEqual('l1-l2');
    expect(capability.criterion_id).toEqual('craft-technical-expertise');
    expect(capability.description).toContain('programming skills');
    expect(capability.created_at).toBeInstanceOf(Date);
  });

  it('should filter correctly when no results match all criteria', async () => {
    const results = await searchCapabilities('mentors', {
      levels: ['l1-l2'] // mentors is only in l3 capability
    });

    expect(results).toHaveLength(0);
  });
});