import { db } from '../db';
import { 
  jobLevelsTable, 
  criteriaTable, 
  capabilitiesTable, 
  editHistoryTable, 
  overviewContentTable 
} from '../db/schema';
import { type EngineeringJobMatrixData } from '../schema';
import { eq } from 'drizzle-orm';

export async function seedData(data: EngineeringJobMatrixData): Promise<void> {
  try {
    // Step 1: Insert job levels first (referenced by capabilities)
    if (data.jobLevels.length > 0) {
      await db.insert(jobLevelsTable)
        .values(data.jobLevels.map(level => ({
          id: level.id,
          name: level.name,
          primary_title: level.primary_title,
          description_summary: level.description_summary,
          trajectory_note: level.trajectory_note
        })))
        .execute();
    }

    // Step 2: Insert criteria (referenced by capabilities)
    if (data.criteria.length > 0) {
      await db.insert(criteriaTable)
        .values(data.criteria.map(criterion => ({
          id: criterion.id,
          category: criterion.category,
          sub_category: criterion.sub_category
        })))
        .execute();
    }

    // Step 3: Process and resolve "As L#" references in capability descriptions
    const processedCapabilities = await resolveCapabilityReferences(data.capabilities);

    // Step 4: Insert capabilities with resolved references
    if (processedCapabilities.length > 0) {
      await db.insert(capabilitiesTable)
        .values(processedCapabilities.map(capability => ({
          job_level_id: capability.job_level_id,
          criterion_id: capability.criterion_id,
          description: capability.description
        })))
        .execute();
    }

    // Step 5: Insert edit history
    if (data.editHistory.length > 0) {
      await db.insert(editHistoryTable)
        .values(data.editHistory.map(entry => ({
          date: entry.date,
          description: entry.description
        })))
        .execute();
    }

    // Step 6: Insert overview content (goals and principles)
    const overviewEntries: Array<{
      type: 'goal' | 'principle';
      content: string;
      order: number;
    }> = [];
    
    // Add goals with order
    data.overview.goals.forEach((goal, index) => {
      overviewEntries.push({
        type: 'goal' as const,
        content: goal,
        order: index + 1
      });
    });

    // Add principles with order (continuing from goals)
    data.overview.principles.forEach((principle, index) => {
      overviewEntries.push({
        type: 'principle' as const,
        content: principle,
        order: data.overview.goals.length + index + 1
      });
    });

    if (overviewEntries.length > 0) {
      await db.insert(overviewContentTable)
        .values(overviewEntries)
        .execute();
    }

  } catch (error) {
    console.error('Data seeding failed:', error);
    throw error;
  }
}

/**
 * Resolves "As L#" references in capability descriptions by looking up
 * the referenced capability and replacing the reference with the actual text
 */
async function resolveCapabilityReferences(capabilities: any[]): Promise<any[]> {
  // Create a lookup map for quick reference resolution
  const capabilityMap = new Map<string, string>();
  
  // First pass: collect all capabilities without references
  capabilities.forEach(capability => {
    const key = `${capability.job_level_id}-${capability.criterion_id}`;
    if (!capability.description.includes('As L')) {
      capabilityMap.set(key, capability.description);
    }
  });

  // Process capabilities and resolve references
  const processedCapabilities = capabilities.map(capability => {
    let description = capability.description;
    
    // Check if this description contains "As L#" references
    const asPattern = /As (L\d+(?:-L\d+)?)/g;
    const matches = [...description.matchAll(asPattern)];
    
    if (matches.length > 0) {
      // Replace each "As L#" reference with the actual capability text
      matches.forEach(match => {
        const referencedLevel = match[1];
        const referencedKey = `${referencedLevel.toLowerCase()}-${capability.criterion_id}`;
        const referencedDescription = capabilityMap.get(referencedKey);
        
        if (referencedDescription) {
          description = description.replace(match[0], referencedDescription);
        }
      });
    }
    
    return {
      ...capability,
      description
    };
  });

  return processedCapabilities;
}