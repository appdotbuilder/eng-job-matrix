import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobLevelsTable, criteriaTable, capabilitiesTable } from '../db/schema';
import { type MatrixFilters } from '../schema';
import { getCapabilities } from '../handlers/get_capabilities';

describe('getCapabilities', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Setup test data
  const setupTestData = async () => {
    // Create job levels
    await db.insert(jobLevelsTable).values([
      {
        id: 'l1-l2',
        name: 'L1 / L2',
        primary_title: 'Engineer',
        description_summary: 'Entry level engineer',
        trajectory_note: null
      },
      {
        id: 'l3',
        name: 'L3',
        primary_title: 'Engineer',
        description_summary: 'Mid-level engineer',
        trajectory_note: 'Focus on growth'
      },
      {
        id: 'tl1',
        name: 'TL1',
        primary_title: 'Tech Lead',
        description_summary: 'Technical leader',
        trajectory_note: null
      }
    ]).execute();

    // Create criteria
    await db.insert(criteriaTable).values([
      {
        id: 'craft-technical',
        category: 'Craft',
        sub_category: 'Technical Expertise'
      },
      {
        id: 'craft-quality',
        category: 'Craft',
        sub_category: 'Quality'
      },
      {
        id: 'impact-delivery',
        category: 'Impact',
        sub_category: 'Delivery'
      },
      {
        id: 'collaboration-teamwork',
        category: 'Collaboration',
        sub_category: 'Teamwork'
      }
    ]).execute();

    // Create capabilities
    await db.insert(capabilitiesTable).values([
      {
        job_level_id: 'l1-l2',
        criterion_id: 'craft-technical',
        description: 'Basic programming skills and understanding of fundamental concepts'
      },
      {
        job_level_id: 'l1-l2',
        criterion_id: 'craft-quality',
        description: 'Writes clean code with guidance and follows team standards'
      },
      {
        job_level_id: 'l3',
        criterion_id: 'craft-technical',
        description: 'Strong technical skills with ability to solve complex problems independently'
      },
      {
        job_level_id: 'l3',
        criterion_id: 'impact-delivery',
        description: 'Consistently delivers features on time with minimal supervision'
      },
      {
        job_level_id: 'tl1',
        criterion_id: 'collaboration-teamwork',
        description: 'Leads technical discussions and mentors junior developers effectively'
      },
      {
        job_level_id: 'tl1',
        criterion_id: 'craft-technical',
        description: 'Expert-level technical knowledge across multiple domains and technologies'
      }
    ]).execute();
  };

  it('should return all capabilities when no filters provided', async () => {
    await setupTestData();

    const result = await getCapabilities();

    expect(result).toHaveLength(6);
    expect(result[0].id).toBeDefined();
    expect(result[0].job_level_id).toBeDefined();
    expect(result[0].criterion_id).toBeDefined();
    expect(result[0].description).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return empty array when no capabilities exist', async () => {
    const result = await getCapabilities();

    expect(result).toHaveLength(0);
  });

  it('should filter capabilities by job level IDs', async () => {
    await setupTestData();

    const filters: MatrixFilters = {
      levels: ['l1-l2']
    };

    const result = await getCapabilities(filters);

    expect(result).toHaveLength(2);
    result.forEach(capability => {
      expect(capability.job_level_id).toBe('l1-l2');
    });
  });

  it('should filter capabilities by multiple job level IDs', async () => {
    await setupTestData();

    const filters: MatrixFilters = {
      levels: ['l1-l2', 'tl1']
    };

    const result = await getCapabilities(filters);

    expect(result).toHaveLength(4);
    result.forEach(capability => {
      expect(['l1-l2', 'tl1']).toContain(capability.job_level_id);
    });
  });

  it('should filter capabilities by category names', async () => {
    await setupTestData();

    const filters: MatrixFilters = {
      categories: ['Craft']
    };

    const result = await getCapabilities(filters);

    expect(result).toHaveLength(4); // 2 L1-L2 craft + 1 L3 craft + 1 TL1 craft
    
    // Verify all returned capabilities belong to Craft category
    const craftCriteriaIds = ['craft-technical', 'craft-quality'];
    result.forEach(capability => {
      expect(craftCriteriaIds).toContain(capability.criterion_id);
    });
  });

  it('should filter capabilities by sub-category names', async () => {
    await setupTestData();

    const filters: MatrixFilters = {
      subCategories: ['Technical Expertise']
    };

    const result = await getCapabilities(filters);

    expect(result).toHaveLength(3); // L1-L2, L3, TL1 all have technical expertise
    result.forEach(capability => {
      expect(capability.criterion_id).toBe('craft-technical');
    });
  });

  it('should perform case-insensitive search in capability descriptions', async () => {
    await setupTestData();

    const filters: MatrixFilters = {
      search: 'TECHNICAL'
    };

    const result = await getCapabilities(filters);

    expect(result.length).toBeGreaterThan(0);
    result.forEach(capability => {
      expect(capability.description.toLowerCase()).toContain('technical');
    });
  });

  it('should search for partial matches in descriptions', async () => {
    await setupTestData();

    const filters: MatrixFilters = {
      search: 'programming'
    };

    const result = await getCapabilities(filters);

    expect(result).toHaveLength(1);
    expect(result[0].description).toContain('programming');
    expect(result[0].job_level_id).toBe('l1-l2');
  });

  it('should return empty array when search term is not found', async () => {
    await setupTestData();

    const filters: MatrixFilters = {
      search: 'nonexistent term'
    };

    const result = await getCapabilities(filters);

    expect(result).toHaveLength(0);
  });

  it('should ignore empty search strings', async () => {
    await setupTestData();

    const filters: MatrixFilters = {
      search: '   '  // Only whitespace
    };

    const result = await getCapabilities(filters);

    expect(result).toHaveLength(6); // Should return all capabilities
  });

  it('should apply multiple filters cumulatively (AND logic)', async () => {
    await setupTestData();

    const filters: MatrixFilters = {
      levels: ['l3', 'tl1'],
      categories: ['Craft'],
      search: 'technical'
    };

    const result = await getCapabilities(filters);

    expect(result).toHaveLength(2); // L3 and TL1 craft-technical capabilities
    result.forEach(capability => {
      expect(['l3', 'tl1']).toContain(capability.job_level_id);
      expect(capability.criterion_id).toBe('craft-technical');
      expect(capability.description.toLowerCase()).toContain('technical');
    });
  });

  it('should handle complex filtering scenario', async () => {
    await setupTestData();

    const filters: MatrixFilters = {
      levels: ['l1-l2'],
      categories: ['Craft'],
      subCategories: ['Quality'],
      search: 'clean'
    };

    const result = await getCapabilities(filters);

    expect(result).toHaveLength(1);
    expect(result[0].job_level_id).toBe('l1-l2');
    expect(result[0].criterion_id).toBe('craft-quality');
    expect(result[0].description).toContain('clean');
  });

  it('should return empty array when filters exclude all results', async () => {
    await setupTestData();

    const filters: MatrixFilters = {
      levels: ['l1-l2'],
      categories: ['Collaboration'] // L1-L2 has no Collaboration capabilities
    };

    const result = await getCapabilities(filters);

    expect(result).toHaveLength(0);
  });

  it('should handle empty filter arrays correctly', async () => {
    await setupTestData();

    const filters: MatrixFilters = {
      levels: [],
      categories: [],
      subCategories: []
    };

    const result = await getCapabilities(filters);

    expect(result).toHaveLength(6); // Should return all capabilities
  });
});