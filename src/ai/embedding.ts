import { db } from "@/db";
import { embeddingsTable, resources } from "@/db/schema";
import { embed, embedMany } from "ai";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";




const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '');
};


export const generateEmbeddings = async (value: string): Promise<Array<{embedding: number[]; content: string}>> => {
    const chunks = generateChunks(value)
    const {embeddings} = await embedMany({
        model: 'openai/text-embedding-ada-002',
        values: chunks
    })

    return embeddings.map((e, i) => ({
        content: chunks[i],
        embedding: e
    }))
}

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: 'openai/text-embedding-ada-002',
    value: input,
  });
  return embedding;
};


export const findRelevantContent = async (userQuery: string, userId: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);

  const similarity = sql<number>`1 - (${cosineDistance(
    embeddingsTable.embedding,
    userQueryEmbedded,
  )})`;

  const similarGuides = await db
    .select({
      name: embeddingsTable.content,
      similarity,
    })
    .from(embeddingsTable)
    .innerJoin(
      resources,
      eq(resources.id, embeddingsTable.resourceId) // 👈 join resources
    )
    .where(
      and(
        eq(resources.userId, userId), // 👈 now valid
        gt(similarity, 0.5)
      )
    )
    .orderBy(desc(similarity))
    .limit(4);

  return similarGuides;
};