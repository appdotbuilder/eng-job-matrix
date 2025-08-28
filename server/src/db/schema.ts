import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Job Levels table - represents engineering job levels and roles
export const jobLevelsTable = pgTable('job_levels', {
  id: text('id').primaryKey(), // Unique string identifier like 'l1-l2', 'tl1', 'em1'
  name: text('name').notNull(), // Display name like 'L1 / L2', 'TL1'
  primary_title: text('primary_title').notNull(), // Role title like 'Engineer', 'Lead Engineer'
  description_summary: text('description_summary').notNull(), // One-sentence description
  trajectory_note: text('trajectory_note'), // Optional progression information
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Criteria table - represents categories and sub-categories of evaluation criteria
export const criteriaTable = pgTable('criteria', {
  id: text('id').primaryKey(), // Unique string identifier like 'craft-technical-expertise'
  category: text('category').notNull(), // Main category like 'Craft', 'Impact'
  sub_category: text('sub_category').notNull(), // Sub-category like 'Technical Expertise'
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Capabilities table - represents the detailed descriptions for JobLevel-Criterion combinations
export const capabilitiesTable = pgTable('capabilities', {
  id: serial('id').primaryKey(),
  job_level_id: text('job_level_id').notNull().references(() => jobLevelsTable.id),
  criterion_id: text('criterion_id').notNull().references(() => criteriaTable.id),
  description: text('description').notNull(), // The detailed capability description
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Edit History table - tracks changes and updates to the matrix
export const editHistoryTable = pgTable('edit_history', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(), // Date string in format like '2024-05-20'
  description: text('description').notNull(), // Description of the change
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Overview Content table - stores goals and principles from the overview section
export const overviewContentTable = pgTable('overview_content', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // 'goal' or 'principle'
  content: text('content').notNull(), // The actual content text
  order: serial('order'), // Order for display purposes
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations between tables
export const jobLevelsRelations = relations(jobLevelsTable, ({ many }) => ({
  capabilities: many(capabilitiesTable),
}));

export const criteriaRelations = relations(criteriaTable, ({ many }) => ({
  capabilities: many(capabilitiesTable),
}));

export const capabilitiesRelations = relations(capabilitiesTable, ({ one }) => ({
  jobLevel: one(jobLevelsTable, {
    fields: [capabilitiesTable.job_level_id],
    references: [jobLevelsTable.id],
  }),
  criterion: one(criteriaTable, {
    fields: [capabilitiesTable.criterion_id],
    references: [criteriaTable.id],
  }),
}));

// TypeScript types for the table schemas
export type JobLevel = typeof jobLevelsTable.$inferSelect;
export type NewJobLevel = typeof jobLevelsTable.$inferInsert;

export type Criterion = typeof criteriaTable.$inferSelect;
export type NewCriterion = typeof criteriaTable.$inferInsert;

export type Capability = typeof capabilitiesTable.$inferSelect;
export type NewCapability = typeof capabilitiesTable.$inferInsert;

export type EditHistoryEntry = typeof editHistoryTable.$inferSelect;
export type NewEditHistoryEntry = typeof editHistoryTable.$inferInsert;

export type OverviewContent = typeof overviewContentTable.$inferSelect;
export type NewOverviewContent = typeof overviewContentTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = {
  jobLevels: jobLevelsTable,
  criteria: criteriaTable,
  capabilities: capabilitiesTable,
  editHistory: editHistoryTable,
  overviewContent: overviewContentTable
};

export const tableRelations = {
  jobLevelsRelations,
  criteriaRelations,
  capabilitiesRelations
};