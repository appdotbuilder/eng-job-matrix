import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { overviewContentTable } from '../db/schema';
import { type CreateOverviewContentInput } from '../schema';
import { getOverviewContent } from '../handlers/get_overview_content';

// Test data for overview content
const testGoals: CreateOverviewContentInput[] = [
  {
    type: 'goal',
    content: 'Foster continuous learning and growth',
    order: 2
  },
  {
    type: 'goal',
    content: 'Provide clear career progression paths',
    order: 1
  },
  {
    type: 'goal',
    content: 'Enable effective performance evaluation',
    order: 3
  }
];

const testPrinciples: CreateOverviewContentInput[] = [
  {
    type: 'principle',
    content: 'Growth is non-linear and context-dependent',
    order: 1
  },
  {
    type: 'principle',
    content: 'Focus on impact over tenure',
    order: 3
  },
  {
    type: 'principle',
    content: 'Encourage diverse skill development',
    order: 2
  }
];

describe('getOverviewContent', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty arrays when no content exists', async () => {
    const result = await getOverviewContent();

    expect(result.goals).toEqual([]);
    expect(result.principles).toEqual([]);
  });

  it('should fetch and organize overview content correctly', async () => {
    // Insert test data
    await db.insert(overviewContentTable)
      .values([...testGoals, ...testPrinciples])
      .execute();

    const result = await getOverviewContent();

    // Verify goals are returned in correct order
    expect(result.goals).toEqual([
      'Provide clear career progression paths', // order: 1
      'Foster continuous learning and growth',  // order: 2
      'Enable effective performance evaluation' // order: 3
    ]);

    // Verify principles are returned in correct order
    expect(result.principles).toEqual([
      'Growth is non-linear and context-dependent', // order: 1
      'Encourage diverse skill development',         // order: 2
      'Focus on impact over tenure'                  // order: 3
    ]);
  });

  it('should handle only goals without principles', async () => {
    // Insert only goals
    await db.insert(overviewContentTable)
      .values(testGoals)
      .execute();

    const result = await getOverviewContent();

    expect(result.goals).toHaveLength(3);
    expect(result.goals).toEqual([
      'Provide clear career progression paths',
      'Foster continuous learning and growth',
      'Enable effective performance evaluation'
    ]);
    expect(result.principles).toEqual([]);
  });

  it('should handle only principles without goals', async () => {
    // Insert only principles
    await db.insert(overviewContentTable)
      .values(testPrinciples)
      .execute();

    const result = await getOverviewContent();

    expect(result.goals).toEqual([]);
    expect(result.principles).toHaveLength(3);
    expect(result.principles).toEqual([
      'Growth is non-linear and context-dependent',
      'Encourage diverse skill development',
      'Focus on impact over tenure'
    ]);
  });

  it('should maintain correct ordering across mixed content types', async () => {
    // Insert mixed data with various order values
    const mixedData: CreateOverviewContentInput[] = [
      { type: 'goal', content: 'Goal Z', order: 10 },
      { type: 'principle', content: 'Principle A', order: 1 },
      { type: 'goal', content: 'Goal A', order: 2 },
      { type: 'principle', content: 'Principle Z', order: 20 },
      { type: 'goal', content: 'Goal M', order: 5 }
    ];

    await db.insert(overviewContentTable)
      .values(mixedData)
      .execute();

    const result = await getOverviewContent();

    // Verify goals are ordered correctly within their type
    expect(result.goals).toEqual([
      'Goal A',  // order: 2
      'Goal M',  // order: 5
      'Goal Z'   // order: 10
    ]);

    // Verify principles are ordered correctly within their type
    expect(result.principles).toEqual([
      'Principle A', // order: 1
      'Principle Z'  // order: 20
    ]);
  });

  it('should verify data is correctly saved in database', async () => {
    // Insert test data
    await db.insert(overviewContentTable)
      .values([testGoals[0], testPrinciples[0]])
      .execute();

    // Verify data exists in database
    const dbData = await db.select()
      .from(overviewContentTable)
      .execute();

    expect(dbData).toHaveLength(2);
    
    const goalItem = dbData.find(item => item.type === 'goal');
    const principleItem = dbData.find(item => item.type === 'principle');
    
    expect(goalItem).toBeDefined();
    expect(goalItem?.content).toEqual('Foster continuous learning and growth');
    expect(goalItem?.order).toEqual(2);
    expect(goalItem?.created_at).toBeInstanceOf(Date);
    
    expect(principleItem).toBeDefined();
    expect(principleItem?.content).toEqual('Growth is non-linear and context-dependent');
    expect(principleItem?.order).toEqual(1);
    expect(principleItem?.created_at).toBeInstanceOf(Date);
  });
});