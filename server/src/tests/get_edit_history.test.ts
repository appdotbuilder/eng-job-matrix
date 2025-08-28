import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { editHistoryTable } from '../db/schema';
import { type CreateEditHistoryEntryInput } from '../schema';
import { getEditHistory } from '../handlers/get_edit_history';
import { desc } from 'drizzle-orm';

// Test data for edit history entries
const testEntries: CreateEditHistoryEntryInput[] = [
  {
    date: '2024-01-15',
    description: 'Initial matrix creation with basic job levels'
  },
  {
    date: '2024-02-10', 
    description: 'Added technical expertise criteria and capabilities'
  },
  {
    date: '2024-03-05',
    description: 'Updated leadership capabilities for senior levels'
  },
  {
    date: '2024-03-20',
    description: 'Refined communication skills descriptions'
  }
];

describe('getEditHistory', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no edit history exists', async () => {
    const result = await getEditHistory();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all edit history entries', async () => {
    // Insert test entries
    await db.insert(editHistoryTable)
      .values(testEntries)
      .execute();

    const result = await getEditHistory();

    expect(result).toHaveLength(4);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('date');
    expect(result[0]).toHaveProperty('description');
    expect(result[0]).toHaveProperty('created_at');
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return entries ordered by date descending (newest first)', async () => {
    // Insert test entries
    await db.insert(editHistoryTable)
      .values(testEntries)
      .execute();

    const result = await getEditHistory();

    // Verify ordering - newest dates should come first
    expect(result[0].date).toBe('2024-03-20'); // Most recent
    expect(result[1].date).toBe('2024-03-05');
    expect(result[2].date).toBe('2024-02-10');
    expect(result[3].date).toBe('2024-01-15'); // Oldest

    // Verify the ordering is consistent across all entries
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].date >= result[i + 1].date).toBe(true);
    }
  });

  it('should handle entries with same date correctly', async () => {
    // Create entries with same date but different creation times
    const sameDate = '2024-03-15';
    const entriesWithSameDate = [
      { date: sameDate, description: 'First edit on March 15th' },
      { date: sameDate, description: 'Second edit on March 15th' },
      { date: sameDate, description: 'Third edit on March 15th' }
    ];

    // Insert them one by one to ensure different created_at timestamps
    for (const entry of entriesWithSameDate) {
      await db.insert(editHistoryTable)
        .values(entry)
        .execute();
      // Small delay to ensure different created_at times
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const result = await getEditHistory();

    expect(result).toHaveLength(3);
    // All should have the same date
    result.forEach(entry => {
      expect(entry.date).toBe(sameDate);
    });

    // Should be ordered by created_at descending when dates are equal
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].created_at >= result[i + 1].created_at).toBe(true);
    }
  });

  it('should preserve all field data correctly', async () => {
    const singleEntry = {
      date: '2024-04-01',
      description: 'Comprehensive update to engineering progression paths and skill requirements'
    };

    await db.insert(editHistoryTable)
      .values(singleEntry)
      .execute();

    const result = await getEditHistory();

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe(singleEntry.date);
    expect(result[0].description).toBe(singleEntry.description);
    expect(typeof result[0].id).toBe('number');
    expect(result[0].id).toBeGreaterThan(0);
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle mixed date formats in chronological order', async () => {
    // Mix of dates across different months and years
    const mixedDates = [
      { date: '2023-12-31', description: 'Year-end matrix review' },
      { date: '2024-01-01', description: 'New year matrix updates' },
      { date: '2024-12-01', description: 'Latest updates' },
      { date: '2024-06-15', description: 'Mid-year refinements' }
    ];

    await db.insert(editHistoryTable)
      .values(mixedDates)
      .execute();

    const result = await getEditHistory();

    // Should be in descending date order
    expect(result[0].date).toBe('2024-12-01'); // Latest
    expect(result[1].date).toBe('2024-06-15');
    expect(result[2].date).toBe('2024-01-01');
    expect(result[3].date).toBe('2023-12-31'); // Earliest
  });

  it('should work correctly with database directly', async () => {
    // Test that our handler matches direct database queries
    await db.insert(editHistoryTable)
      .values(testEntries)
      .execute();

    // Direct database query for comparison
    const directQuery = await db.select()
      .from(editHistoryTable)
      .orderBy(desc(editHistoryTable.date), desc(editHistoryTable.created_at))
      .execute();

    const handlerResult = await getEditHistory();

    expect(handlerResult).toEqual(directQuery);
    expect(handlerResult).toHaveLength(directQuery.length);
  });
});