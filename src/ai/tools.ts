import { db } from "@/db";
import { filesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { google } from "@ai-sdk/google";
import { generateText, tool } from "ai";
import { headers } from "next/headers";
import { v0 } from "v0-sdk";
import z from "zod";
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi({
  // ...options,
});


async function base64ToFile(base64: string, mimeType: string, filename: string): Promise<File> {
  const byteString = atob(base64);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const intArray = new Uint8Array(arrayBuffer);
  for (let i = 0; i < byteString.length; i++) {
    intArray[i] = byteString.charCodeAt(i);
  }
  return new File([intArray], filename, { type: mimeType });
}

export const myToolSet = {
  imageGenerator: tool({
    description: "You are an advanced ai image generator.",
    inputSchema: z.object({
      prompt: z.string().describe("The prompt to generate the image from.")
    }),
     execute: async ({prompt}) => {
        try {

            const data = await auth.api.getSession({
                headers: await headers()
            })


            if(!data) {
                throw new Error("Unauthorized")
            }

            console.log(data?.user.id)
            
            const result = await generateText({
            model: google('gemini-2.0-flash-exp'),
            providerOptions: {
                google: { responseModalities: ['IMAGE', 'TEXT'] },
            },
            prompt: prompt,
            });


           for (const file of result.files) {
                if (file.mediaType.startsWith('image/')) {
                    const readableFile = await base64ToFile(file.base64, file.mediaType, `file-${Date.now()}.png`)                    // The file object provides multiple data formats:
                    const [uploaded] = await utapi.uploadFiles([readableFile])
                    if(!uploaded.data) {
                        throw new Error("Something went wrong")
                    }

                    await db.insert(filesTable).values({
                        userId: data.user.id,
                        url: uploaded.data.ufsUrl,
                        mediaType: file.mediaType
                    })

                    return {
                      url: uploaded.data.ufsUrl
                    }

                }
            }
        } catch (error) {
            console.log(error)
        }
    }
  }),
  appBuilder: tool({
    description:
      "You are an expert coder. After building the app describe it well in a paragraph. Do not return any code. You can build apps only with nextjs and cannot build apps that use different tech or language.",
    inputSchema: z.object({
      prompt: z.string().describe("The prompt to build the app from."),
    }),
    execute: async ({ prompt }) => {
      const result = await v0.chats.create({
        system: "You are an expert coder",
        message: prompt,
        modelConfiguration: {
          modelId: "v0-1.5-sm",
          imageGenerations: false,
          thinking: false,
        },
      });

      return {
        webUrl: result.demo,
        files: result.files,
      };
    },
  }),
};

export type AppBuilder = Awaited<
  ReturnType<NonNullable<(typeof myToolSet)["appBuilder"]["execute"]>>
>;

export type ImageGenerator = Awaited<ReturnType<NonNullable<(typeof myToolSet)["imageGenerator"]["execute"]>>>
