import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { db } from '@/db';
import { projectsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
export const appRouter = createTRPCRouter({
  projects: baseProcedure
    .input(
      z.object({
        url: z.string(),
      }),
    )
    .query( async ({input}) => {
      
      const [project] = await db.select().from(projectsTable).where(eq(projectsTable.url, input.url))

      return project

    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;