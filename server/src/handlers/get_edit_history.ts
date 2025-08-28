import { db } from '../db';
import { editHistoryTable } from '../db/schema';
import { type EditHistoryEntry } from '../schema';
import { desc } from 'drizzle-orm';

export const getEditHistory = async (): Promise<EditHistoryEntry[]> => {
  try {
    // Fetch all edit history entries ordered by date descending (newest first)
    const results = await db.select()
      .from(editHistoryTable)
      .orderBy(desc(editHistoryTable.date), desc(editHistoryTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch edit history:', error);
    throw error;
  }
};