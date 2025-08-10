"use client";

import { IconCirclePlusFilled } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, FilesIcon, HistoryIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "convex/react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { api } from "../../../../../convex/_generated/api";

export function ChatViewNavMain({ userId }: { userId: string }) {
  const router = useRouter();

  const chats = useQuery(api.chats.getChats, {
    userId: userId,
  });

  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              onClick={() => router.push(`/`)}
              tooltip="Quick Create"
              className="bg-primary transition-colors duration-300 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>New Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              onClick={() => router.push(`/files`)}
              className={cn(
                "",
                pathname === "/files" &&
                  "dark:bg-neutral-800 bg-neutral-200 font-semibold"
              )}
            >
              <span>
                <FilesIcon />
                Files
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <Collapsible
            asChild
            defaultOpen={false}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={`History`}>
                  <HistoryIcon />
                  <span>History</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ScrollArea className="h-[200px]">
                  <SidebarMenuSub>
                    {chats?.map((item) => {
                      const isActive = pathname === `/chats/${item._id}`;
                      return (
                        <SidebarMenuSubItem key={Math.random()}>
                          <SidebarMenuSubButton
                            className={cn(
                              "",
                              isActive && "bg-neutral-500/10 font-semibold"
                            )}
                            asChild
                          >
                            <Link href={`/chats/${item._id}`}>
                              <span className="w-[150px] truncate">
                                {item.title}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </ScrollArea>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
