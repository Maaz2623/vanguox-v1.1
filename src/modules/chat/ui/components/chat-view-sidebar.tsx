"use client";

import * as React from "react";
import {
  IconHelp,
  IconSearch,
  IconSettings,
  IconHistory,
  IconFiles,
} from "@tabler/icons-react";

import { ChatViewNavMain } from "./chat-view-nav-main";
import { ChatViewNavUser } from "./chat-view-nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChatViewSwitcher } from "./chat-view-switcher";
import { ChatViewNavSecondary } from "./chat-view-nav-secondary";
import { Skeleton } from "@/components/ui/skeleton";

const data = {
  navMain: [
    {
      title: "Files",
      url: "/files",
      icon: IconFiles,
    },
    {
      title: "History",
      url: "#",
      icon: IconHistory,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
};

interface ChatViewSidebarProps extends React.ComponentProps<typeof Sidebar> {
  auth: boolean;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
}
export function ChatViewSidebar({
  userId,
  auth,
  name,
  email,
  image,
  ...props
}: ChatViewSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <ChatViewSwitcher />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <ChatViewNavMain userId={userId} />
        <ChatViewNavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {auth ? (
          <ChatViewNavUser name={name} email={email} image={image} />
        ) : (
          <Skeleton className="h-12 dark:bg-neutral-800" />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
