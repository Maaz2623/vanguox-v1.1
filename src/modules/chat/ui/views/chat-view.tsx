"use client";
import {
  DefaultChatTransport,
  UIMessage,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";

import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import TextAreaAutoSize from "react-textarea-autosize";

import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { models } from "@/models";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import { CopyIcon, GlobeIcon, MicIcon, RefreshCcwIcon } from "lucide-react";
import { Response } from "@/components/ai-elements/response";
import { Action, Actions } from "@/components/ai-elements/actions";
import { cn } from "@/lib/utils";
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from "@/components/ai-elements/source";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import Image from "next/image";

interface Props {
  chatId: string;
  initialMessages: UIMessage[];
}

export const ChatView = ({ chatId, initialMessages }: Props) => {
  const searchParams = useSearchParams();

  const [webSearch, setWebsearch] = useState(false);

  const [model, setModel] = useState<string>(models[0].id);

  const initialMessage = searchParams.get("message");

  const { messages, status, sendMessage, stop, regenerate } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        model: model,
        id: chatId,
        webSearch: webSearch,
      },
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
  });

  const hasSentInitialMessage = useRef(false);

  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (!initialMessage || hasSentInitialMessage.current) return;

    sendMessage({ text: initialMessage });
    hasSentInitialMessage.current = true;

    // Remove the query param from the URL
    const url = new URL(window.location.href);
    url.searchParams.delete("message");
    window.history.replaceState({}, "", url.toString());
  }, [initialMessage, sendMessage]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "streaming") {
      stop();
      return;
    }

    if (!prompt.trim()) return; // Avoid sending empty messages
    sendMessage(
      { text: prompt },
      {
        body: {
          model: model,
          webSearch: webSearch,
        },
      }
    );
    setPrompt("");
  };

  return (
    <div className="w-full pb-2 mx-auto relative size-full h-screen">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            <div className="w-3/4 mx-auto pb-32">
              {messages.map((message) => (
                <div key={message.id} className="flex items-start">
                  <Message
                    from={message.role}
                    key={message.id}
                    className="flex"
                  >
                    <MessageContent
                      className={cn(
                        "text-[15px]",
                        message.role === "assistant" && "bg-white!"
                      )}
                    >
                      {message.role === "assistant" && (
                        <div className="flex gap-x-3 -ml-4">
                          <MessageAvatar src="/logo.svg" className="size-5" />
                          <span className="font-semibold">Vanguox </span>
                        </div>
                      )}
                      <div
                        className={cn(
                          "",
                          message.role === "assistant" && "ml-4 mt-4"
                        )}
                      >
                        {message.parts.map((part, i) => {
                          switch (part.type) {
                            case "text":
                              return (
                                <div className="" key={i}>
                                  <Response key={`${message.id}-${i}`}>
                                    {part.text}
                                  </Response>
                                  {message.role === "assistant" && (
                                    <Actions className="mt-2 -ml-2">
                                      <Action
                                        onClick={() => regenerate()}
                                        label="Retry"
                                      >
                                        <RefreshCcwIcon className="size-3" />
                                      </Action>
                                      <Action
                                        onClick={() =>
                                          navigator.clipboard.writeText(
                                            part.text
                                          )
                                        }
                                        label="Copy"
                                      >
                                        <CopyIcon className="size-3" />
                                      </Action>
                                    </Actions>
                                  )}
                                </div>
                              );
                            case "reasoning":
                              return (
                                <Reasoning
                                  key={`${message.id}-${i}`}
                                  className="w-full"
                                  isStreaming={status === "streaming"}
                                >
                                  <ReasoningTrigger />
                                  <ReasoningContent>
                                    {part.text}
                                  </ReasoningContent>
                                </Reasoning>
                              );
                            default:
                              return null;
                          }
                        })}
                      </div>
                    </MessageContent>
                  </Message>
                </div>
              ))}
              {status === "submitted" && <Loader />}
            </div>
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="w-3/4 mx-auto p-1">
          <TextAreaAutoSize
            rows={1}
            disabled={status === "submitted"}
            maxRows={3}
            autoFocus={true}
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
            className="p-4 resize-none text-sm border-none w-full outline-none"
            placeholder="Ask me anything..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (e.shiftKey) return; // Allow newline
                e.preventDefault();
                if (e.ctrlKey || !e.metaKey) {
                  handleSubmit;
                }
              }
            }}
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputButton
                variant={webSearch ? "default" : "ghost"}
                onClick={() => setWebsearch(!webSearch)}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <PromptInputModelSelect
                onValueChange={(value) => {
                  setModel(value);
                }}
                value={model}
              >
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  {models.map((model) => (
                    <PromptInputModelSelectItem key={model.id} value={model.id}>
                      <div className="flex gap-x-2">
                        <Image
                          src={model.icon}
                          alt={model.name}
                          height={20}
                          width={20}
                          className="rounded-full"
                        />
                        {model.name}
                      </div>
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              disabled={status === "submitted"}
              status={status}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};
