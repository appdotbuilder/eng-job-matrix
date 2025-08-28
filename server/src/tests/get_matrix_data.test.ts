import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { 
  jobLevelsTable, 
  criteriaTable, 
  capabilitiesTable, 
  editHistoryTable, 
  overviewContentTable 
} from '../db/schema';
import { getMatrixData } from '../handlers/get_matrix_data';
import type { MatrixFilters } from '../schema';

// Test data
const testJobLevel = {
  id: 'l1-l2',
  name: 'L1 / L2',
  primary_title: 'Engineer',
  description_summary: 'Entry-level engineers focused on learning and contributing to projects.',
  trajectory_note: 'Progressing from L1 to L2 typically takes 1-2 years'
};

const testJobLevel2 = {
  id: 'l3',
  name: 'L3',
  primary_title: 'Senior Engineer',
  description_summary: 'Experienced engineers who can work independently on complex projects.',
  trajectory_note: null
};

const testCriterion = {
  id: 'craft-technical-expertise',
  category: 'Craft',
  sub_category: 'Technical Expertise'
};

const testCriterion2 = {
  id: 'impact-project-delivery',
  category: 'Impact',
  sub_category: 'Project Delivery'
};

const testCapability = {
  job_level_id: 'l1-l2',
  criterion_id: 'craft-technical-expertise',
  description: 'Has basic understanding of programming fundamentals and can write simple code with guidance.'
};

const testCapability2 = {
  job_level_id: 'l3',
  criterion_id: 'craft-technical-expertise',
  description: 'Demonstrates strong technical skills and can solve complex problems independently.'
};

const testCapability3 = {
  job_level_id: 'l1-l2',
  criterion_id: 'impact-project-delivery',
  description: 'Contributes to project deliverables under supervision.'
};

const testEditHistory = {
  date: '2024-05-20',
  description: 'Updated technical expertise criteria for L1/L2 levels'
};

const testEditHistory2 = {
  date: '2024-05-15',
  description: 'Added new job level definitions'
};

const testOverviewGoal = {
  type: 'goal' as const,
  content: 'Provide clear career progression pathways',
  order: 1
};

const testOverviewPrinciple = {
  type: 'principle' as const,
  content: 'Focus on impact and growth over time in role',
  order: 1
};

describe('getMatrixData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty data structure when no data exists', async () => {
    const result = await getMatrixData();

    expect(result.jobLevels).toHaveLength(0);
    expect(result.criteria).toHaveLength(0);
    expect(result.capabilities).toHaveLength(0);
    expect(result.editHistory).toHaveLength(0);
    expect(result.overview.goals).toHaveLength(0);
    expect(result.overview.principles).toHaveLength(0);
  });

  it('should fetch complete matrix data without filters', async () => {
    // Create test data
    await db.insert(jobLevelsTable).values([testJobLevel, testJobLevel2]).execute();
    await db.insert(criteriaTable).values([testCriterion, testCriterion2]).execute();
    await db.insert(capabilitiesTable).values([testCapability, testCapability2, testCapability3]).execute();
    await db.insert(editHistoryTable).values([testEditHistory, testEditHistory2]).execute();
    await db.insert(overviewContentTable).values([testOverviewGoal, testOverviewPrinciple]).execute();

    const result = await getMatrixData();

    // Verify job levels
    expect(result.jobLevels).toHaveLength(2);
    expect(result.jobLevels.map(jl => jl.id)).toContain('l1-l2');
    expect(result.jobLevels.map(jl => jl.id)).toContain('l3');

    // Verify criteria
    expect(result.criteria).toHaveLength(2);
    expect(result.criteria.map(c => c.id)).toContain('craft-technical-expertise');
    expect(result.criteria.map(c => c.id)).toContain('impact-project-delivery');

    // Verify capabilities
    expect(result.capabilities).toHaveLength(3);
    const capabilityIds = result.capabilities.map(c => `${c.job_level_id}-${c.criterion_id}`);
    expect(capabilityIds).toContain('l1-l2-craft-technical-expertise');
    expect(capabilityIds).toContain('l3-craft-technical-expertise');
    expect(capabilityIds).toContain('l1-l2-impact-project-delivery');

    // Verify edit history (should be ordered by date desc)
    expect(result.editHistory).toHaveLength(2);
    expect(result.editHistory[0].date).toEqual('2024-05-20'); // Most recent first
    expect(result.editHistory[1].date).toEqual('2024-05-15');

    // Verify overview
    expect(result.overview.goals).toHaveLength(1);
    expect(result.overview.goals[0]).toEqual('Provide clear career progression pathways');
    expect(result.overview.principles).toHaveLength(1);
    expect(result.overview.principles[0]).toEqual('Focus on impact and growth over time in role');
  });

  it('should filter by job levels', async () => {
    // Create test data
    await db.insert(jobLevelsTable).values([testJobLevel, testJobLevel2]).execute();
    await db.insert(criteriaTable).values([testCriterion, testCriterion2]).execute();
    await db.insert(capabilitiesTable).values([testCapability, testCapability2, testCapability3]).execute();

    const filters: MatrixFilters = {
      levels: ['l1-l2']
    };

    const result = await getMatrixData(filters);

    // Should return all job levels and criteria (not filtered)
    expect(result.jobLevels).toHaveLength(2);
    expect(result.criteria).toHaveLength(2);

    // Should only return capabilities for l1-l2 level
    expect(result.capabilities).toHaveLength(2);
    result.capabilities.forEach(cap => {
      expect(cap.job_level_id).toEqual('l1-l2');
    });
  });

  it('should filter by categories', async () => {
    // Create test data
    await db.insert(jobLevelsTable).values([testJobLevel, testJobLevel2]).execute();
    await db.insert(criteriaTable).values([testCriterion, testCriterion2]).execute();
    await db.insert(capabilitiesTable).values([testCapability, testCapability2, testCapability3]).execute();

    const filters: MatrixFilters = {
      categories: ['Craft']
    };

    const result = await getMatrixData(filters);

    // Should only return capabilities for Craft category
    expect(result.capabilities).toHaveLength(2);
    result.capabilities.forEach(cap => {
      expect(cap.criterion_id).toEqual('craft-technical-expertise');
    });
  });

  it('should filter by sub-categories', async () => {
    // Create test data
    await db.insert(jobLevelsTable).values([testJobLevel, testJobLevel2]).execute();
    await db.insert(criteriaTable).values([testCriterion, testCriterion2]).execute();
    await db.insert(capabilitiesTable).values([testCapability, testCapability2, testCapability3]).execute();

    const filters: MatrixFilters = {
      subCategories: ['Project Delivery']
    };

    const result = await getMatrixData(filters);

    // Should only return capabilities for Project Delivery sub-category
    expect(result.capabilities).toHaveLength(1);
    expect(result.capabilities[0].criterion_id).toEqual('impact-project-delivery');
  });

  it('should filter by search query', async () => {
    // Create test data
    await db.insert(jobLevelsTable).values([testJobLevel, testJobLevel2]).execute();
    await db.insert(criteriaTable).values([testCriterion, testCriterion2]).execute();
    await db.insert(capabilitiesTable).values([testCapability, testCapability2, testCapability3]).execute();

    // Search for "complex" which appears in testCapability2 description
    const filters: MatrixFilters = {
      search: 'complex'
    };

    const result = await getMatrixData(filters);

    // Should only return capability with "complex" in description
    expect(result.capabilities).toHaveLength(1);
    expect(result.capabilities[0].description).toContain('complex');
    expect(result.capabilities[0].job_level_id).toEqual('l3');
  });

  it('should search across multiple fields', async () => {
    // Create test data
    await db.insert(jobLevelsTable).values([testJobLevel, testJobLevel2]).execute();
    await db.insert(criteriaTable).values([testCriterion, testCriterion2]).execute();
    await db.insert(capabilitiesTable).values([testCapability, testCapability2, testCapability3]).execute();

    // Search for "Impact" which appears in criterion category
    const filters: MatrixFilters = {
      search: 'Impact'
    };

    const result = await getMatrixData(filters);

    // Should return capability that matches the Impact category
    expect(result.capabilities).toHaveLength(1);
    expect(result.capabilities[0].criterion_id).toEqual('impact-project-delivery');
  });

  it('should combine multiple filters', async () => {
    // Create test data
    await db.insert(jobLevelsTable).values([testJobLevel, testJobLevel2]).execute();
    await db.insert(criteriaTable).values([testCriterion, testCriterion2]).execute();
    await db.insert(capabilitiesTable).values([testCapability, testCapability2, testCapability3]).execute();

    const filters: MatrixFilters = {
      levels: ['l1-l2'],
      categories: ['Craft']
    };

    const result = await getMatrixData(filters);

    // Should return only capabilities that match both level AND category
    expect(result.capabilities).toHaveLength(1);
    expect(result.capabilities[0].job_level_id).toEqual('l1-l2');
    expect(result.capabilities[0].criterion_id).toEqual('craft-technical-expertise');
  });

  it('should return empty capabilities when filters match nothing', async () => {
    // Create test data
    await db.insert(jobLevelsTable).values([testJobLevel]).execute();
    await db.insert(criteriaTable).values([testCriterion]).execute();
    await db.insert(capabilitiesTable).values([testCapability]).execute();

    const filters: MatrixFilters = {
      levels: ['nonexistent-level']
    };

    const result = await getMatrixData(filters);

    // Should return all job levels and criteria, but no capabilities
    expect(result.jobLevels).toHaveLength(1);
    expect(result.criteria).toHaveLength(1);
    expect(result.capabilities).toHaveLength(0);
  });

  it('should handle empty search query', async () => {
    // Create test data
    await db.insert(jobLevelsTable).values([testJobLevel]).execute();
    await db.insert(criteriaTable).values([testCriterion]).execute();
    await db.insert(capabilitiesTable).values([testCapability]).execute();

    const filters: MatrixFilters = {
      search: '   ' // Empty/whitespace search
    };

    const result = await getMatrixData(filters);

    // Should return all data (search filter ignored when empty/whitespace)
    expect(result.capabilities).toHaveLength(1);
  });
});