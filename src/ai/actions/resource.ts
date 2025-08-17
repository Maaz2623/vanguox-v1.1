'use server';

import {
  NewResourceParams,
  embeddingsTable,
  insertResourceSchema,
  resources,
} from '@/db/schema';

import { db } from '@/db';
import { generateEmbeddings } from '../embedding';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export const createResource = async (input: NewResourceParams) => {
  try {
    const { content } = insertResourceSchema.parse(input);

    const authData = await auth.api.getSession({
      headers: await headers()
    })

    if(!authData) {
      throw new Error("Unauthorized")
    }

    const [resource] = await db
      .insert(resources)
      .values({ content, userId: authData.user.id })
      .returning();

       const embeddings = await generateEmbeddings(content);
    await db.insert(embeddingsTable).values(
      embeddings.map(embedding => ({
        resourceId: resource.id,
        ...embedding,
      })),
    );

    return 'Resource successfully created and embedded.';
  } catch (e) {
    if (e instanceof Error)
      return e.message.length > 0 ? e.message : 'Error, please try again.';
  }
};