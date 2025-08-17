"use client";
import {
  DefaultChatTransport,
  UIMessage,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";

import {
  PromptInput,
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
  FileIcon,
  FileImageIcon,
  FileTextIcon,
  FileArchiveIcon,
  FileCodeIcon,
  FileAudioIcon,
  FileVideoIcon,
  FileSpreadsheetIcon,
  XIcon,
} from "lucide-react";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import { CheckIcon, CopyIcon, PlusIcon, RefreshCcwIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface Props {
  chatId: string;
  initialMessages: UIMessage[];
}

// ✅ File conversion helper
async function convertFilesToDataURLs(files: FileList) {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<{
          type: "file";
          mediaType: string;
          url: string;
        }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              type: "file",
              mediaType: file.type,
              url: reader.result as string,
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    )
  );
}

export const ChatView = ({ chatId, initialMessages }: Props) => {
  const searchParams = useSearchParams();

  const [webSearch] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileList | undefined>(undefined);

  const [model, setModel] = useState<string>(models[0].id);
  const initialMessage = searchParams.get("message");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (!initialMessage || hasSentInitialMessage.current) return;
    sendMessage({ text: initialMessage });
    hasSentInitialMessage.current = true;

    const url = new URL(window.location.href);
    url.searchParams.delete("message");
    window.history.replaceState({}, "", url.toString());
  }, [initialMessage, sendMessage]);

  // ✅ updated handleSubmit with file support
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "streaming") {
      stop();
      return;
    }
    if (!prompt.trim() && !files?.length) return;

    const fileParts =
      files && files.length > 0 ? await convertFilesToDataURLs(files) : [];

    sendMessage(
      {
        role: "user",
        parts: [{ type: "text", text: prompt }, ...fileParts],
      },
      {
        body: {
          model: model,
          webSearch: webSearch,
        },
      }
    );

    setPrompt("");
    setFiles(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex w-full h-screen">
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            setFiles(event.target.files);
          }
        }}
        multiple
        ref={fileInputRef}
      />

      {/* Chat section */}
      <div
        className={cn(
          "flex flex-col h-full px-8 transition-all duration-300 w-full"
        )}
      >
        <Conversation className="flex-1 overflow-y-auto">
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
                                <div key={i}>
                                  <Response>{part.text}</Response>
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
                            case "file":
                              if (part.mediaType?.startsWith("image/")) {
                                return (
                                  <Image
                                    key={`${message.id}-image-${i}`}
                                    src={part.url}
                                    width={400}
                                    height={400}
                                    alt={`attachment-${i}`}
                                    className="rounded-lg"
                                  />
                                );
                              }
                              if (part.mediaType === "application/pdf") {
                                return (
                                  <iframe
                                    key={`${message.id}-pdf-${i}`}
                                    src={part.url}
                                    width={500}
                                    height={600}
                                    className="rounded-lg border"
                                    title={`pdf-${i}`}
                                  />
                                );
                              }
                              return null;
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
                            case "tool-webSearcher":
                              return part.state === "input-available" ? (
                                <div key={i}>Searching the web...</div>
                              ) : null;
                            case "tool-emailSender":
                              if (part.state === "input-streaming")
                                return <div key={i}>Drafting email...</div>;
                              if (part.state === "input-available")
                                return <div key={i}>Sending your email...</div>;
                              return null;
                            case "tool-imageGenerator":
                              if (part.state === "input-available")
                                return (
                                  <div key={i}>Generating your image...</div>
                                );
                              return null;
                            case "tool-appBuilder":
                              if (part.state === "input-available")
                                return <AppBuilderLoader key={i} />;
                              return null;
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
        <PromptInput onSubmit={handleSubmit} className="w-3/4 mx-auto p-1 mb-2">
          {files && (
            <div>
              <FilesPreview files={files} setFiles={setFiles} />
            </div>
          )}

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
              {/* File upload button */}
              <Button
                variant="ghost"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <PlusIcon size={16} />
              </Button>
              <PromptInputModelSelect
                onValueChange={(value) => setModel(value)}
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

const getFileIcon = (file: File) => {
  if (file.type.startsWith("image/"))
    return <FileImageIcon className="w-5 h-5 text-blue-500" />;
  if (file.type.startsWith("video/"))
    return <FileVideoIcon className="w-5 h-5 text-purple-500" />;
  if (file.type.startsWith("audio/"))
    return <FileAudioIcon className="w-5 h-5 text-pink-500" />;
  if (file.type === "application/pdf")
    return <FileTextIcon className="w-5 h-5 text-red-500" />;
  if (
    file.type === "application/zip" ||
    file.type === "application/x-zip-compressed"
  )
    return <FileArchiveIcon className="w-5 h-5 text-yellow-500" />;

  if (
    file.type.includes("spreadsheet") ||
    file.name.endsWith(".xls") ||
    file.name.endsWith(".xlsx")
  )
    return <FileSpreadsheetIcon className="w-5 h-5 text-green-500" />;

  if (
    file.type.includes("json") ||
    file.type.includes("javascript") ||
    file.type.includes("typescript") ||
    file.type.includes("html") ||
    file.type.includes("css")
  )
    return <FileCodeIcon className="w-5 h-5 text-gray-600" />;

  return <FileIcon className="w-5 h-5 text-gray-400" />;
};

const FilesPreview = ({
  files,
  setFiles,
}: {
  files: FileList;
  setFiles: React.Dispatch<React.SetStateAction<FileList | undefined>>;
}) => {
  const fileArray = Array.from(files);

  const handleRemove = (index: number) => {
    const dt = new DataTransfer();
    fileArray.forEach((f, i) => {
      if (i !== index) dt.items.add(f);
    });

    const updatedFiles = dt.files;
    setFiles(updatedFiles.length > 0 ? updatedFiles : undefined);

    // also reset <input> so you can re-upload the same file if needed
    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (input) input.files = updatedFiles;
  };

  return (
    <div className="flex gap-2 flex-wrap p-2 max-h-[400px] overflow-y-auto">
      {fileArray.map((file, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg text-sm shadow-sm"
        >
          {getFileIcon(file)}
          <span className="truncate max-w-[150px]">{file.name}</span>
          <XIcon
            className="w-4 h-4 cursor-pointer text-gray-500 hover:text-red-500"
            onClick={() => handleRemove(index)}
          />
        </div>
      ))}
    </div>
  );
};
