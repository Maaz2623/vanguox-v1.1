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
import { CheckIcon, CopyIcon, GlobeIcon, RefreshCcwIcon } from "lucide-react";
import { Response } from "@/components/ai-elements/response";
import { Action, Actions } from "@/components/ai-elements/actions";
import { cn } from "@/lib/utils";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Loader } from "@/components/ai-elements/loader";
import Image from "next/image";
import { AppBuilderLoader } from "@/ai/components/app-builder-loader";
import { AIWebPreview } from "@/ai/components/web-preview";
import { FragmentSelector } from "@/ai/components/fragment-selector";
import { AppBuilder, ImageGenerator } from "@/ai/tools";

interface Props {
  chatId: string;
  initialMessages: UIMessage[];
}

export const ChatView = ({ chatId, initialMessages }: Props) => {
  const searchParams = useSearchParams();

  const [webSearch, setWebsearch] = useState(false);

  const [model, setModel] = useState<string>(models[0].id);

  const initialMessage = searchParams.get("message");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [fragmentOpen, setFragmentOpen] = useState(false);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

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

  const [appPreview, setAppPreview] = useState(false);

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

  const [previewUrl, setPreviewUrl] = useState<AppBuilder["webUrl"]>(undefined);

  const [files, setFiles] = useState<AppBuilder["files"]>(undefined);

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

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    let webUrl: string | null = null;
    let files: AppBuilder["files"] | null = undefined;
    const lastHasOutput =
      lastMessage?.parts?.some((p) => {
        if (p.type === "tool-appBuilder" && p.state === "output-available") {
          webUrl =
            (
              p.output as {
                webUrl: string;
              }
            ).webUrl ?? null;
          files = (p.output as AppBuilder).files ?? null;
          return true;
        }
        return false;
      }) ?? false;

    if (lastHasOutput && webUrl) {
      setAppPreview(true);
      setPreviewUrl(webUrl);
      setFiles(files);
      setFragmentOpen(true);
    } else {
      setAppPreview(false);
      setPreviewUrl(undefined);
      setFiles(undefined);
    }
  }, [messages]);

  return (
    <div className="flex w-full h-screen">
      {/* Chat section */}
      <div
        className={cn(
          "flex flex-col h-full px-8 transition-all duration-300 w-full"
        )}
      >
        <Conversation className="flex-1 overflow-y-auto">
          <ConversationContent>
            <div className={cn("w-3/4 mx-auto pb-32")}>
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
                          <span className="font-semibold">Vanguox</span>
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
                                        <RefreshCcwIcon className="size-3.5" />
                                      </Action>
                                      <Action
                                        onClick={() =>
                                          handleCopy(
                                            `${message.id}-${i}`,
                                            part.text
                                          )
                                        }
                                        label="Copy"
                                      >
                                        {copiedId === `${message.id}-${i}` ? (
                                          <CheckIcon className="size-3.5" />
                                        ) : (
                                          <CopyIcon className="size-3.5" />
                                        )}
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
                            case "tool-imageGenerator":
                              switch (part.state) {
                                case "input-available":
                                  return (
                                    <div key={i}>Generating your image...</div>
                                  );
                                case "output-available":
                                  const output = part.output as ImageGenerator;
                                  return (
                                    <div key={i}>
                                      {/* {output && output.url && (
                                        <Image
                                          src={output.url}
                                          alt="Base64 Image"
                                          width={400}
                                          height={400}
                                        />
                                      )} */}
                                    </div>
                                  );
                              }
                            case "tool-appBuilder":
                              switch (part.state) {
                                case "input-available":
                                  return <AppBuilderLoader key={i} />;
                                case "output-available":
                                  const output = part.output as AppBuilder;
                                  return (
                                    <div className="my-3" key={output.webUrl}>
                                      <FragmentSelector
                                        files={output.files}
                                        previewUrl={previewUrl}
                                        setAppPreview={setAppPreview}
                                        setPreviewUrl={setPreviewUrl}
                                        setFiles={setFiles}
                                        webUrl={output.webUrl}
                                        key={output.webUrl}
                                        setOpen={setFragmentOpen}
                                        open={fragmentOpen}
                                      />
                                    </div>
                                  );
                              }
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

        {/* Input bar */}
        <PromptInput
          onSubmit={handleSubmit}
          className={cn("w-3/4 mx-auto p-1 mb-2")}
        >
          <TextAreaAutoSize
            rows={1}
            disabled={status === "submitted"}
            maxRows={3}
            autoFocus={true}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="p-4 resize-none text-sm border-none w-full outline-none"
            placeholder="Ask me anything..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (e.shiftKey) return;
                e.preventDefault();
                if (e.ctrlKey || !e.metaKey) {
                  handleSubmit(
                    e as unknown as React.FormEvent<HTMLFormElement>
                  );
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
      {appPreview && previewUrl && (
        <AIWebPreview
          open={fragmentOpen}
          setOpen={setFragmentOpen}
          files={files}
          setAppPreview={setAppPreview}
          url={previewUrl}
          setPreviewUrl={setPreviewUrl}
        />
      )}
    </div>
  );
};
