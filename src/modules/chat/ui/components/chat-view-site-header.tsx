"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Typewriter } from "react-simple-typewriter";

export function ChatViewSiteHeader({ chatId }: { chatId: string }) {
  const data = useQuery(api.chats.getChat, { chatId });
  const updateTitle = useMutation(api.chats.updateConvexChatTitle);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [typewriterKey, setTypewriterKey] = useState(0);

  // Update title and reset animation when data.title changes
  useEffect(() => {
    if (data?.title) {
      setTitle(data.title);
      setTypewriterKey((prev) => prev + 1); // force remount Typewriter
    }
  }, [data?.title]);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const handleTitleSubmit = async () => {
    if (title.trim() && title !== data?.title) {
      await updateTitle({ chatId, title: title.trim() });
    }
    setIsEditing(false);
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 transition-[width,height] bg-neutral-100! dark:bg-neutral-900! ease-linear ">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {data ? (
          <div className="text-base font-medium items-center gap-x-2 flex dark:text-neutral-400 text-neutral-600 w-full max-w-xs">
            {isEditing ? (
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleTitleSubmit();
                  } else if (e.key === "Escape") {
                    setIsEditing(false);
                    setTitle(data.title); // reset on escape
                  }
                }}
                className="h-7 ring-0 focus-visible:ring-0 text-sm"
              />
            ) : (
              <div
                onClick={() => setIsEditing(true)}
                className="cursor-pointer flex items-center gap-x-2"
              >
                <span key={typewriterKey}>
                  <Typewriter
                    words={[data.title]}
                    typeSpeed={50}
                    deleteSpeed={0}
                    delaySpeed={1000}
                  />
                </span>
              </div>
            )}
          </div>
        ) : (
          <Skeleton className="h-8 dark:bg-neutral-800 bg-neutral-200 w-32" />
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
