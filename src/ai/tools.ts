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

import { Resend } from 'resend';
import { saveProject } from "./functions";
import { webSearcher } from "@/prompt";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  webSearcher: tool({
    description: "Search through the web.",
    inputSchema: z.object({
      prompt: z.string("The prompt to search the web for")
    }),
    execute: async ({prompt}) => {
      try {
        const result = await generateText({
          model: 'perplexity/sonar',
          prompt: prompt,
          system: webSearcher
        })
        return result.content
      } catch (error) {
        console.log(error)
      }
    } 
  }),
  emailSender: tool({
    description: "Send an email to any recipient.",
    inputSchema: z.object({
      to: z.email().describe("The recipient's email address."),
      subject: z.string().describe("The subject of the email."),
      message: z.string().describe("The plain text body of the email."),
    }),
    execute: async ({ to, subject, message }) => {
      try {

        const authData = await auth.api.getSession({
          headers: await headers()
        })

        const senderName = authData?.user.name

        const data = await resend.emails.send({
          from: `${senderName || 'Your App'} ^${authData?.user.email}^ <no-reply@vanguox.com>`, // must be your verified domain
          to: [to],
          subject,
          text: message,
        });

        console.log(data)

        return {
          message: "Email sent successfully."
        };
      } catch (error) {
        console.error("Email send failed:", error);
        return {
          success: false,
          error: (error as Error).message
        };
      }
    }
  }),
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
      "You are an expert coder.",
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

      await saveProject(
        result.demo as string,
        result.files,
        result.title as string
      )

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
