"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { startTransition, useState } from "react";
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

import { GlobeIcon, MicIcon } from "lucide-react";
import { models } from "@/models";

export const NewChatTemplateView = ({ userId }: { userId: string }) => {
  const [loading, setLoading] = useState(false);

  const createChat = useMutation(api.chats.createConvexChat);

  const router = useRouter();

  const [model, setModel] = useState<string>(models[0].id);

  const [prompt, setPrompt] = useState("");

  const onSubmit = async () => {
    setLoading(true);
    const currentPrompt = prompt; // Save the prompt
    setPrompt("");

    // Create the chat entry in the DB
    startTransition(async () => {
      const data = await createChat({
        userId: userId,
      });
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
        <PromptInput onSubmit={onSubmit} className="mt-4 mx-auto">
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
              <PromptInputButton>
                <MicIcon size={16} />
              </PromptInputButton>
              <PromptInputButton>
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
                      {model.name}
                    </PromptInputModelSelectItem>
                  ))}
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>
            <PromptInputSubmit
              status={loading ? "submitted" : "ready"}
              disabled={!prompt}
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};
