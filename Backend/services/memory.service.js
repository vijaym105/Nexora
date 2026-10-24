import mongoose from "mongoose";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/msg.model.js";


const MEMORY_CHAT_COUNT = () => Math.max(0, Number(process.env.MEMORY_CHAT_COUNT ?? 4));
const MESSAGES_PER_CHAT = 6;
const MAX_CHARS_PER_MESSAGE = 200;

const clip = (text = "") => {
    const flat = String(text).replace(/\s+/g, " ").trim();
    return flat.length > MAX_CHARS_PER_MESSAGE ? flat.slice(0, MAX_CHARS_PER_MESSAGE) + "…" : flat;
};

export async function buildMemoryContext({ userId, currentChatId }) {
    const limit = MEMORY_CHAT_COUNT();
    if (!limit) return "";

    const chatFilter = { user: userId };
    if (currentChatId) chatFilter._id = { $ne: currentChatId };

    const chats = await chatModel.find(chatFilter).select("_id title").lean();
    if (!chats.length) return "";

    const titleById = new Map(chats.map((c) => [String(c._id), c.title]));

    // most recently active chats = the ones whose newest message is newest
    const recent = await messageModel.aggregate([
        { $match: { chat: { $in: chats.map((c) => new mongoose.Types.ObjectId(String(c._id))) } } },
        { $group: { _id: "$chat", lastMessageAt: { $max: "$createdAt" } } },
        { $sort: { lastMessageAt: -1 } },
        { $limit: limit },
    ]);
    if (!recent.length) return "";

    const blocks = await Promise.all(
        recent.map(async ({ _id }) => {
            const latest = await messageModel
                .find({ chat: _id })
                .sort({ createdAt: -1 })
                .limit(MESSAGES_PER_CHAT)
                .select("role content")
                .lean();

            const transcript = latest
                .reverse()
                .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${clip(m.content)}`)
                .join("\n");

            return `### Earlier chat: "${titleById.get(String(_id)) ?? "Untitled"}"\n${transcript}`;
        })
    );

    return blocks.join("\n\n");
}
