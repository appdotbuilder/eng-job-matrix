import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import schemas
import { 
  matrixFiltersSchema,
  createJobLevelInputSchema,
  createCriterionInputSchema,
  createCapabilityInputSchema,
  createEditHistoryEntryInputSchema,
  createOverviewContentInputSchema,
  engineeringJobMatrixDataSchema
} from './schema';

// Import handlers
import { getJobLevels } from './handlers/get_job_levels';
import { getCriteria } from './handlers/get_criteria';
import { getCapabilities } from './handlers/get_capabilities';
import { getMatrixData } from './handlers/get_matrix_data';
import { searchCapabilities } from './handlers/search_capabilities';
import { getEditHistory } from './handlers/get_edit_history';
import { getOverviewContent } from './handlers/get_overview_content';
import { createJobLevel } from './handlers/create_job_level';
import { createCriterion } from './handlers/create_criterion';
import { createCapability } from './handlers/create_capability';
import { seedData } from './handlers/seed_data';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Core data retrieval endpoints
  getJobLevels: publicProcedure
    .query(() => getJobLevels()),

  getCriteria: publicProcedure
    .query(() => getCriteria()),

  getCapabilities: publicProcedure
    .input(matrixFiltersSchema.optional())
    .query(({ input }) => getCapabilities(input)),

  // Main matrix data endpoint with filtering support
  getMatrixData: publicProcedure
    .input(matrixFiltersSchema.optional())
    .query(({ input }) => getMatrixData(input)),

  // Search functionality
  searchCapabilities: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      filters: z.object({
        levels: z.array(z.string()).optional(),
        categories: z.array(z.string()).optional(),
        subCategories: z.array(z.string()).optional()
      }).optional()
    }))
    .query(({ input }) => searchCapabilities(input.query, input.filters)),

  // Overview and history endpoints
  getEditHistory: publicProcedure
    .query(() => getEditHistory()),

  getOverviewContent: publicProcedure
    .query(() => getOverviewContent()),

  // Administrative/seeding endpoints
  createJobLevel: publicProcedure
    .input(createJobLevelInputSchema)
    .mutation(({ input }) => createJobLevel(input)),

  createCriterion: publicProcedure
    .input(createCriterionInputSchema)
    .mutation(({ input }) => createCriterion(input)),

  createCapability: publicProcedure
    .input(createCapabilityInputSchema)
    .mutation(({ input }) => createCapability(input)),

  // Bulk data seeding endpoint
  seedData: publicProcedure
    .input(engineeringJobMatrixDataSchema)
    .mutation(({ input }) => seedData(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`Engineering Job Matrix TRPC server listening at port: ${port}`);
}

start();