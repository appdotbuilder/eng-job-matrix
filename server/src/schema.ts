import { z } from 'zod';

// Job Level schema - represents a specific engineering job level or role
export const jobLevelSchema = z.object({
  id: z.string(), // Unique identifier (e.g., 'l1-l2', 'l3', 'tl1', 'em1')
  name: z.string(), // Display name (e.g., 'L1 / L2', 'L3', 'TL1', 'EM3,EM4,EM5')
  primary_title: z.string(), // High-level role title (e.g., 'Engineer', 'Lead Engineer')
  description_summary: z.string(), // A 1-sentence description of the level
  trajectory_note: z.string().nullable(), // Information about progression at this level
  created_at: z.coerce.date()
});

export type JobLevel = z.infer<typeof jobLevelSchema>;

// Criterion schema - represents a category and sub-category of criteria
export const criterionSchema = z.object({
  id: z.string(), // Unique identifier (e.g., 'craft-technical-expertise')
  category: z.string(), // Main category (e.g., 'Craft', 'Impact', 'Collaboration')
  sub_category: z.string(), // Specific sub-category within the main category
  created_at: z.coerce.date()
});

export type Criterion = z.infer<typeof criterionSchema>;

// Capability schema - represents detailed description for JobLevel and Criterion combination
export const capabilitySchema = z.object({
  id: z.number(),
  job_level_id: z.string(), // References JobLevel.id
  criterion_id: z.string(), // References Criterion.id
  description: z.string(), // The detailed text description for this capability
  created_at: z.coerce.date()
});

export type Capability = z.infer<typeof capabilitySchema>;

// Edit History Entry schema - represents an entry in the edit history
export const editHistoryEntrySchema = z.object({
  id: z.number(),
  date: z.string(), // Date of the edit (e.g., '2024-05-20')
  description: z.string(), // Description of the change
  created_at: z.coerce.date()
});

export type EditHistoryEntry = z.infer<typeof editHistoryEntrySchema>;

// Overview Content schema - represents key points from the overview
export const overviewContentSchema = z.object({
  id: z.number(),
  type: z.enum(['goal', 'principle']), // Type of content
  content: z.string(), // The actual content text
  order: z.number().int(), // Order for display
  created_at: z.coerce.date()
});

export type OverviewContent = z.infer<typeof overviewContentSchema>;

// Input schemas for creating entities
export const createJobLevelInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  primary_title: z.string(),
  description_summary: z.string(),
  trajectory_note: z.string().nullable()
});

export type CreateJobLevelInput = z.infer<typeof createJobLevelInputSchema>;

export const createCriterionInputSchema = z.object({
  id: z.string(),
  category: z.string(),
  sub_category: z.string()
});

export type CreateCriterionInput = z.infer<typeof createCriterionInputSchema>;

export const createCapabilityInputSchema = z.object({
  job_level_id: z.string(),
  criterion_id: z.string(),
  description: z.string()
});

export type CreateCapabilityInput = z.infer<typeof createCapabilityInputSchema>;

export const createEditHistoryEntryInputSchema = z.object({
  date: z.string(),
  description: z.string()
});

export type CreateEditHistoryEntryInput = z.infer<typeof createEditHistoryEntryInputSchema>;

export const createOverviewContentInputSchema = z.object({
  type: z.enum(['goal', 'principle']),
  content: z.string(),
  order: z.number().int()
});

export type CreateOverviewContentInput = z.infer<typeof createOverviewContentInputSchema>;

// Filter and search schemas
export const matrixFiltersSchema = z.object({
  levels: z.array(z.string()).optional(), // Job level IDs to filter by
  categories: z.array(z.string()).optional(), // Categories to filter by
  subCategories: z.array(z.string()).optional(), // Sub-categories to filter by
  search: z.string().optional() // Search query
});

export type MatrixFilters = z.infer<typeof matrixFiltersSchema>;

// Complete data model for the application
export const engineeringJobMatrixDataSchema = z.object({
  jobLevels: z.array(jobLevelSchema),
  criteria: z.array(criterionSchema),
  capabilities: z.array(capabilitySchema),
  editHistory: z.array(editHistoryEntrySchema),
  overview: z.object({
    goals: z.array(z.string()),
    principles: z.array(z.string())
  })
});

export type EngineeringJobMatrixData = z.infer<typeof engineeringJobMatrixDataSchema>;