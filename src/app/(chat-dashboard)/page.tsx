import { auth } from "@/lib/auth";
import { NewChatTemplateView } from "@/modules/home/ui/views/new-chat-template";
import { headers } from "next/headers";
import React from "react";

const HomePage = async () => {
  const authData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!authData) {
    return;
  }

  return <NewChatTemplateView userId={authData.user.id} />;
};

export default HomePage;
