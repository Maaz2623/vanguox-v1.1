import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";



export default defineSchema({
    chats: defineTable({
        title: v.string(),
        userId: v.string()
    }).index("by_userId", ["userId"])
})