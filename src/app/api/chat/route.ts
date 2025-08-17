import { saveChat, updateChatTitle } from '@/ai/functions';
import { myToolSet } from '@/ai/tools';
import { auth } from '@/lib/auth';
import { systemPrompt } from '@/prompt';
import { streamText, UIMessage, convertToModelMessages, createIdGenerator, smoothStream } from 'ai';
import { headers } from 'next/headers';


export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
    id
  }: { messages: UIMessage[]; model: string; webSearch: boolean, id: string } =
    await req.json();

    const authData = await auth.api.getSession({
      headers: await headers()
    })

    if(!authData) throw new Error("Unauthorized")

  const result = streamText({
    model: webSearch ? 'perplexity/sonar' : model,
    messages: convertToModelMessages(messages),
    experimental_transform: smoothStream({
      delayInMs: 50,
      chunking: "word",
    }),
    tools: myToolSet,
    system: `${systemPrompt}. The name of the user is ${authData.user.name}`,
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
    originalMessages: messages,
     generateMessageId: createIdGenerator({
      prefix: "msg",
      size: 16,
    }),
    onFinish: async ({ messages: updatedMessages }) => {

  if (messages.length < 2) {
    updateChatTitle({
      chatId: id,
      messages,
    });
  }

  const reversed = [...updatedMessages].reverse();

  const assistantMessage = reversed.find(
    (m) =>
      m.role === "assistant" &&
      m.parts.some((p) => p.type === "text") &&
      m.parts.every((p) => p.type !== "tool-generateImage" || p.output !== undefined)
  );

  if (!assistantMessage) return;

  // Now find the user message that came before this assistant message
  const assistantIndex = updatedMessages.findIndex(
    (m) => m.id === assistantMessage.id
  );

  const userMessage = updatedMessages
    .slice(0, assistantIndex)
    .reverse()
    .find((m) => m.role === "user");

  if (!userMessage) return;

  await saveChat({
    chatId: id,
    messages: [userMessage, assistantMessage],
  });
}

  });
}