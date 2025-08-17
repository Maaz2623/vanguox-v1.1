"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { startTransition, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { TypeAnimation } from "react-type-animation";
import { api } from "../../../../../convex/_generated/api";

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

import {
  FileArchiveIcon,
  FileAudioIcon,
  FileCodeIcon,
  FileIcon,
  FileImageIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileVideoIcon,
  MicIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { models } from "@/models";

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

// ✅ File Icon helper
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

// ✅ Files preview
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

    // reset <input> so you can re-upload the same file if needed
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

export const NewChatTemplateView = ({ userId }: { userId: string }) => {
  const [loading, setLoading] = useState(false);
  const createChat = useMutation(api.chats.createConvexChat);
  const router = useRouter();

  const [model, setModel] = useState<string>(models[0].id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileList | undefined>(undefined);

  const [prompt, setPrompt] = useState("");

  const onSubmit = async () => {
    if (!prompt.trim() && !files?.length) return;
    setLoading(true);
    const currentPrompt = prompt;
    const fileParts = files ? await convertFilesToDataURLs(files) : [];

    console.log(fileParts);

    setPrompt("");
    setFiles(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Create the chat entry in the DB
    startTransition(async () => {
      const data = await createChat({
        userId: userId,
      });

      // Pass both text + files in query string (files can later be handled in ChatView)
      const params = new URLSearchParams({ message: currentPrompt });
      router.push(`/chats/${data}?${params.toString()}`);
    });
  };

  const subText =
    "A powerful AI system designed to enhance ideas and streamline creation.";

  return (
    <div className="h-screen">
      <SidebarTrigger className="absolute top-3 left-3 size-10" />
      <AnimatePresence mode="wait" initial={true}>
        <motion.div
          key="new-messages-view-logo"
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full h-[300px] flex flex-col justify-center mt-20 items-center text-center"
        >
          <Image src="/logo.svg" alt="logo" width={100} height={100} priority />
          <h1 className="text-4xl font-semibold mt-4">Vanguox AI</h1>
          <p className="text-md text-muted-foreground mt-2 px-2">
            <TypeAnimation sequence={[subText]} speed={80} cursor={false} />
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="mx-auto w-3/4">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          accept="image/*,application/pdf"
          onChange={(e) => e.target.files && setFiles(e.target.files)}
        />

        <PromptInput onSubmit={onSubmit} className="mt-4 mx-auto">
          {files && <FilesPreview files={files} setFiles={setFiles} />}

          <TextAreaAutoSize
            rows={1}
            disabled={loading}
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
                  onSubmit();
                }
              }
            }}
          />

          <PromptInputToolbar className="p-2">
            <PromptInputTools>
              <Button
                variant="ghost"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <PlusIcon size={16} />
              </Button>
              <PromptInputButton>
                <MicIcon size={16} />
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
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              status={loading ? "submitted" : "ready"}
              disabled={!prompt && !files?.length}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};
