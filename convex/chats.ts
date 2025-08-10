import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const getChat = query({
  args: {
    chatId: v.string()
  },
  handler: async (ctx, {chatId}) => {
    const id = chatId as Id<"chats">

    const chat = await ctx.db.get(id)

    if(!chat) {
      throw new Error("Not Found")
    }


    return chat

  }
})

export const updateConvexChatTitle = mutation({
  args: {
    title: v.string(),
    chatId: v.string(), // this is a string but we'll cast it to Id<"chats">
  },
  handler: async (ctx, { title, chatId }) => {
    const id = chatId as Id<"chats">;

    // Optional: You can fetch the chat if you want to validate ownership
    const chat = await ctx.db.get(id);
    if (!chat) {
      throw new Error("Chat not found");
    }

    // Patch the chat
    await ctx.db.patch(id, { title });

    return chat
  },
});

export const createConvexChat = mutation({
    args: {
        userId: v.string()
    },
    handler: async (ctx, {userId}) => {
        const chatId = await ctx.db.insert("chats", {
            title: "Untitled",
            userId: userId
        })

        return chatId
    }
})


export const getChats = query({
    args: {
        userId: v.string()
    },
    handler: async (ctx, {userId}) => {
        const data = await ctx.db.query("chats").withIndex("by_userId", (q) => q.eq("userId", userId)).order("desc").collect()
        return data
    }
})