import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { criteriaTable } from '../db/schema';
import { getCriteria } from '../handlers/get_criteria';

describe('getCriteria', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no criteria exist', async () => {
    const result = await getCriteria();
    
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(0);
  });

  it('should return all criteria when they exist', async () => {
    // Insert test criteria
    await db.insert(criteriaTable)
      .values([
        {
          id: 'craft-technical-expertise',
          category: 'Craft',
          sub_category: 'Technical Expertise'
        },
        {
          id: 'impact-business-value',
          category: 'Impact',
          sub_category: 'Business Value'
        },
        {
          id: 'collaboration-communication',
          category: 'Collaboration',
          sub_category: 'Communication'
        }
      ])
      .execute();

    const result = await getCriteria();

    expect(result).toHaveLength(3);
    
    // Verify structure of returned criteria
    result.forEach(criterion => {
      expect(criterion.id).toBeDefined();
      expect(typeof criterion.id).toBe('string');
      expect(criterion.category).toBeDefined();
      expect(typeof criterion.category).toBe('string');
      expect(criterion.sub_category).toBeDefined();
      expect(typeof criterion.sub_category).toBe('string');
      expect(criterion.created_at).toBeInstanceOf(Date);
    });

    // Verify specific test data
    const craftCriterion = result.find(c => c.id === 'craft-technical-expertise');
    expect(craftCriterion).toBeDefined();
    expect(craftCriterion!.category).toBe('Craft');
    expect(craftCriterion!.sub_category).toBe('Technical Expertise');

    const impactCriterion = result.find(c => c.id === 'impact-business-value');
    expect(impactCriterion).toBeDefined();
    expect(impactCriterion!.category).toBe('Impact');
    expect(impactCriterion!.sub_category).toBe('Business Value');

    const collaborationCriterion = result.find(c => c.id === 'collaboration-communication');
    expect(collaborationCriterion).toBeDefined();
    expect(collaborationCriterion!.category).toBe('Collaboration');
    expect(collaborationCriterion!.sub_category).toBe('Communication');
  });

  it('should return criteria grouped by categories', async () => {
    // Insert multiple criteria with same category but different sub-categories
    await db.insert(criteriaTable)
      .values([
        {
          id: 'craft-technical-expertise',
          category: 'Craft',
          sub_category: 'Technical Expertise'
        },
        {
          id: 'craft-code-quality',
          category: 'Craft',
          sub_category: 'Code Quality'
        },
        {
          id: 'craft-architecture',
          category: 'Craft',
          sub_category: 'Architecture'
        },
        {
          id: 'impact-delivery',
          category: 'Impact',
          sub_category: 'Delivery'
        }
      ])
      .execute();

    const result = await getCriteria();

    expect(result).toHaveLength(4);

    // Verify we have multiple Craft criteria
    const craftCriteria = result.filter(c => c.category === 'Craft');
    expect(craftCriteria).toHaveLength(3);
    
    const subCategories = craftCriteria.map(c => c.sub_category).sort();
    expect(subCategories).toEqual(['Architecture', 'Code Quality', 'Technical Expertise']);

    // Verify Impact category
    const impactCriteria = result.filter(c => c.category === 'Impact');
    expect(impactCriteria).toHaveLength(1);
    expect(impactCriteria[0].sub_category).toBe('Delivery');
  });

  it('should handle special characters in criteria data', async () => {
    // Insert criterion with special characters
    await db.insert(criteriaTable)
      .values({
        id: 'special-chars-test',
        category: 'Test & Validation',
        sub_category: 'Quality Assurance (QA)'
      })
      .execute();

    const result = await getCriteria();

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('Test & Validation');
    expect(result[0].sub_category).toBe('Quality Assurance (QA)');
  });

  it('should preserve insertion order by id', async () => {
    // Insert criteria in specific order
    await db.insert(criteriaTable)
      .values([
        {
          id: 'z-last',
          category: 'Z Category',
          sub_category: 'Last Item'
        },
        {
          id: 'a-first',
          category: 'A Category',
          sub_category: 'First Item'
        },
        {
          id: 'm-middle',
          category: 'M Category',
          sub_category: 'Middle Item'
        }
      ])
      .execute();

    const result = await getCriteria();

    expect(result).toHaveLength(3);
    
    // Results should be in insertion order, not alphabetical
    expect(result[0].id).toBe('z-last');
    expect(result[1].id).toBe('a-first');
    expect(result[2].id).toBe('m-middle');
  });
});