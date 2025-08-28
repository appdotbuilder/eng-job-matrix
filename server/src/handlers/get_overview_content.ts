import { db } from '../db';
import { overviewContentTable } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

export async function getOverviewContent(): Promise<{
  goals: string[];
  principles: string[];
}> {
  try {
    // Fetch all overview content ordered by the 'order' field
    const overviewData = await db.select()
      .from(overviewContentTable)
      .orderBy(asc(overviewContentTable.order))
      .execute();

    // Separate goals and principles into their respective arrays
    const goals = overviewData
      .filter(item => item.type === 'goal')
      .map(item => item.content);

    const principles = overviewData
      .filter(item => item.type === 'principle')
      .map(item => item.content);

    return {
      goals,
      principles
    };
  } catch (error) {
    console.error('Failed to fetch overview content:', error);
    throw error;
  }
}