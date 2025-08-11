import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const result = await generateText({
            model: google('gemini-2.0-flash-exp'),
            providerOptions: {
                google: { responseModalities: ['IMAGE', 'TEXT'] },
            },
            prompt: prompt,
            });

            console.log(result.files)

  return Response.json({
    base64: result.files[0].base64
  })
}