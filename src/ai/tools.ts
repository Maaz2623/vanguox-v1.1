import { tool } from "ai";
import { v0 } from "v0-sdk";
import z from "zod";


export const myToolSet = {
    appBuilder: tool({
        description: "You are an expert coder. After building the app describe it well in a paragraph.",
        inputSchema: z.object({
            prompt: z.string().describe("The prompt to build the app from.")
        }),
        execute: async ({prompt}) => {
            const result = await v0.chats.create({
                system: 'You are an expert coder',
                message: prompt,
                modelConfiguration: {
                modelId: 'v0-1.5-sm',
                imageGenerations: false,
                thinking: false,
                },
            });

            return {
                webUrl: result.demo
            }
        }
    })
}