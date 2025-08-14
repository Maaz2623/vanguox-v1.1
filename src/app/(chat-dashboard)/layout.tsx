import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ChatViewSidebar } from "@/modules/chat/ui/components/chat-view-sidebar";
import { HomeView } from "@/modules/home/ui/views/home-view";

export default async function ChatViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <>
      {!data ? (
        <HomeView />
      ) : (
        <SidebarProvider
          className="bg-background!"
          style={
            {
              // "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <ChatViewSidebar
            auth={true}
            name={data.user.name}
            email={data.user.email}
            image={data.user.image}
            userId={data.user.id}
            variant="inset"
            className="border-r"
          />
          <SidebarInset className="bg-background relative shadow-none! m-0! rounded-none! border-none!">
            {children}
          </SidebarInset>
        </SidebarProvider>
      )}
    </>
  );
}
