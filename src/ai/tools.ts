import { google } from "@ai-sdk/google";
import { tool, generateText, ToolCallUnion, ToolResultUnion } from "ai";
import { UTApi } from "uploadthing/server";
import z from "zod";
import { base64ToFile } from "./functions";
import { db } from "@/db";
import { filesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


export const utapi = new UTApi({
  // ...options,
});

export const myToolSet = {
    generateImage: tool({
        description: "Use this tool to generate an image when the user explicitly asks for an image, picture, or visual content. Generate the image and describe it in a about 4 lines. Do not return the url of the generated image.",    inputSchema: z.object({
        prompt: z.string().describe('The prompt to generate the image from.')
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

                    return uploaded.data.ufsUrl

                }
            }
        } catch (error) {
            console.log(error)
        }
    }
})
}


export type MyToolCall = ToolCallUnion<typeof myToolSet>;
export type MyToolResult = ToolResultUnion<typeof myToolSet>;
