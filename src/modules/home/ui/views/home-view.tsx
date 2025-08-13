"use client";
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
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { TypeAnimation } from "react-type-animation";
import TextAreaAutoSize from "react-textarea-autosize";
import { GlobeIcon, MicIcon } from "lucide-react";
import { models } from "@/models";
import { useState } from "react";

export const HomeView = () => {
  return (
    <div className="bg-sidebar h-screen flex flex-col justify-center items-center">
      <Form />
    </div>
  );
};

const Form = () => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const [model, setModel] = useState<string>(models[0].id);

  const [prompt, setPrompt] = useState("");

  const onSubmit = async () => {
    setLoading(true);
    setPrompt("");
    router.push(`/auth`);
  };

  const subText =
    "A powerful AI system designed to enhance ideas and streamline creation.";

  return (
    <div className="h-screen w-3/4">
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
