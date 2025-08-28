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
import { type EngineeringJobMatrixData } from '../schema';
import { seedData } from '../handlers/seed_data';
import { eq, and } from 'drizzle-orm';

// Test data setup
const testData: EngineeringJobMatrixData = {
  jobLevels: [
    {
      id: 'l1-l2',
      name: 'L1 / L2',
      primary_title: 'Engineer',
      description_summary: 'Entry-level engineers learning the fundamentals',
      trajectory_note: 'Focus on building technical skills',
      created_at: new Date()
    },
    {
      id: 'l3',
      name: 'L3',
      primary_title: 'Engineer',
      description_summary: 'Competent engineers with solid technical foundation',
      trajectory_note: null,
      created_at: new Date()
    },
    {
      id: 'tl1',
      name: 'TL1',
      primary_title: 'Lead Engineer',
      description_summary: 'Technical leads with mentoring responsibilities',
      trajectory_note: 'Focus on leadership and technical excellence',
      created_at: new Date()
    }
  ],
  criteria: [
    {
      id: 'craft-technical-expertise',
      category: 'Craft',
      sub_category: 'Technical Expertise',
      created_at: new Date()
    },
    {
      id: 'impact-delivery',
      category: 'Impact',
      sub_category: 'Delivery',
      created_at: new Date()
    }
  ],
  capabilities: [
    {
      id: 1,
      job_level_id: 'l1-l2',
      criterion_id: 'craft-technical-expertise',
      description: 'Learns new technologies with guidance and support',
      created_at: new Date()
    },
    {
      id: 2,
      job_level_id: 'l3',
      criterion_id: 'craft-technical-expertise',
      description: 'Demonstrates solid understanding of core technologies',
      created_at: new Date()
    },
    {
      id: 3,
      job_level_id: 'tl1',
      criterion_id: 'craft-technical-expertise',
      description: 'As L3, plus mentors others in technical best practices',
      created_at: new Date()
    },
    {
      id: 4,
      job_level_id: 'l1-l2',
      criterion_id: 'impact-delivery',
      description: 'Delivers small features with supervision',
      created_at: new Date()
    }
  ],
  editHistory: [
    {
      id: 1,
      date: '2024-01-15',
      description: 'Initial matrix creation',
      created_at: new Date()
    },
    {
      id: 2,
      date: '2024-02-10',
      description: 'Added TL1 level capabilities',
      created_at: new Date()
    }
  ],
  overview: {
    goals: [
      'Provide clear career progression paths',
      'Enable consistent performance evaluation'
    ],
    principles: [
      'Focus on impact over years of experience',
      'Encourage continuous learning and growth'
    ]
  }
};

describe('seedData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should seed all job levels', async () => {
    await seedData(testData);

    const jobLevels = await db.select()
      .from(jobLevelsTable)
      .execute();

    expect(jobLevels).toHaveLength(3);
    
    const l1l2 = jobLevels.find(level => level.id === 'l1-l2');
    expect(l1l2).toBeDefined();
    expect(l1l2?.name).toEqual('L1 / L2');
    expect(l1l2?.primary_title).toEqual('Engineer');
    expect(l1l2?.description_summary).toEqual('Entry-level engineers learning the fundamentals');
    expect(l1l2?.trajectory_note).toEqual('Focus on building technical skills');
    expect(l1l2?.created_at).toBeInstanceOf(Date);

    const l3 = jobLevels.find(level => level.id === 'l3');
    expect(l3?.trajectory_note).toBeNull();
  });

  it('should seed all criteria', async () => {
    await seedData(testData);

    const criteria = await db.select()
      .from(criteriaTable)
      .execute();

    expect(criteria).toHaveLength(2);
    
    const craftCriterion = criteria.find(c => c.id === 'craft-technical-expertise');
    expect(craftCriterion).toBeDefined();
    expect(craftCriterion?.category).toEqual('Craft');
    expect(craftCriterion?.sub_category).toEqual('Technical Expertise');
    expect(craftCriterion?.created_at).toBeInstanceOf(Date);
  });

  it('should seed capabilities with resolved references', async () => {
    await seedData(testData);

    const capabilities = await db.select()
      .from(capabilitiesTable)
      .execute();

    expect(capabilities).toHaveLength(4);

    // Check that the "As L3" reference was resolved
    const tl1Capability = capabilities.find(c => 
      c.job_level_id === 'tl1' && c.criterion_id === 'craft-technical-expertise'
    );
    expect(tl1Capability).toBeDefined();
    expect(tl1Capability?.description).toEqual(
      'Demonstrates solid understanding of core technologies, plus mentors others in technical best practices'
    );

    // Check a capability without references remains unchanged
    const l1l2Capability = capabilities.find(c => 
      c.job_level_id === 'l1-l2' && c.criterion_id === 'craft-technical-expertise'
    );
    expect(l1l2Capability?.description).toEqual('Learns new technologies with guidance and support');
  });

  it('should seed edit history entries', async () => {
    await seedData(testData);

    const editEntries = await db.select()
      .from(editHistoryTable)
      .execute();

    expect(editEntries).toHaveLength(2);
    
    const firstEntry = editEntries.find(e => e.date === '2024-01-15');
    expect(firstEntry).toBeDefined();
    expect(firstEntry?.description).toEqual('Initial matrix creation');
    expect(firstEntry?.created_at).toBeInstanceOf(Date);
  });

  it('should seed overview content with correct types and order', async () => {
    await seedData(testData);

    const overviewContent = await db.select()
      .from(overviewContentTable)
      .execute();

    expect(overviewContent).toHaveLength(4);

    // Check goals
    const goals = overviewContent.filter(item => item.type === 'goal');
    expect(goals).toHaveLength(2);
    expect(goals[0].content).toEqual('Provide clear career progression paths');
    expect(goals[0].order).toEqual(1);
    expect(goals[1].content).toEqual('Enable consistent performance evaluation');
    expect(goals[1].order).toEqual(2);

    // Check principles
    const principles = overviewContent.filter(item => item.type === 'principle');
    expect(principles).toHaveLength(2);
    expect(principles[0].content).toEqual('Focus on impact over years of experience');
    expect(principles[0].order).toEqual(3); // Continues from goals
    expect(principles[1].content).toEqual('Encourage continuous learning and growth');
    expect(principles[1].order).toEqual(4);
  });

  it('should handle empty data gracefully', async () => {
    const emptyData: EngineeringJobMatrixData = {
      jobLevels: [],
      criteria: [],
      capabilities: [],
      editHistory: [],
      overview: {
        goals: [],
        principles: []
      }
    };

    await seedData(emptyData);

    // Verify no data was inserted
    const jobLevels = await db.select().from(jobLevelsTable).execute();
    const criteria = await db.select().from(criteriaTable).execute();
    const capabilities = await db.select().from(capabilitiesTable).execute();
    const editHistory = await db.select().from(editHistoryTable).execute();
    const overview = await db.select().from(overviewContentTable).execute();

    expect(jobLevels).toHaveLength(0);
    expect(criteria).toHaveLength(0);
    expect(capabilities).toHaveLength(0);
    expect(editHistory).toHaveLength(0);
    expect(overview).toHaveLength(0);
  });

  it('should preserve referential integrity', async () => {
    await seedData(testData);

    // Verify foreign key relationships are maintained
    const capabilities = await db.select()
      .from(capabilitiesTable)
      .execute();

    for (const capability of capabilities) {
      // Check job level exists
      const jobLevel = await db.select()
        .from(jobLevelsTable)
        .where(eq(jobLevelsTable.id, capability.job_level_id))
        .execute();
      expect(jobLevel).toHaveLength(1);

      // Check criterion exists
      const criterion = await db.select()
        .from(criteriaTable)
        .where(eq(criteriaTable.id, capability.criterion_id))
        .execute();
      expect(criterion).toHaveLength(1);
    }
  });

  it('should handle complex reference resolution', async () => {
    const complexReferenceData: EngineeringJobMatrixData = {
      jobLevels: [
        { id: 'l1', name: 'L1', primary_title: 'Engineer', description_summary: 'Junior', trajectory_note: null, created_at: new Date() },
        { id: 'l2', name: 'L2', primary_title: 'Engineer', description_summary: 'Mid-level', trajectory_note: null, created_at: new Date() }
      ],
      criteria: [
        { id: 'test-criterion', category: 'Test', sub_category: 'Test', created_at: new Date() }
      ],
      capabilities: [
        {
          id: 1,
          job_level_id: 'l1',
          criterion_id: 'test-criterion',
          description: 'Base capability for L1',
          created_at: new Date()
        },
        {
          id: 2,
          job_level_id: 'l2',
          criterion_id: 'test-criterion',
          description: 'As L1, but with additional responsibilities',
          created_at: new Date()
        }
      ],
      editHistory: [],
      overview: { goals: [], principles: [] }
    };

    await seedData(complexReferenceData);

    const capabilities = await db.select()
      .from(capabilitiesTable)
      .where(eq(capabilitiesTable.job_level_id, 'l2'))
      .execute();

    expect(capabilities[0].description).toEqual('Base capability for L1, but with additional responsibilities');
  });
});