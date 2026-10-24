import { generateResponse, AiTitle } from "../services/ai.service.js";
import { AllKeysBusyError } from "../services/keyFallback.service.js";
import { buildMemoryContext } from "../services/memory.service.js";
import { sendEmail } from "../services/mail.service.js";
import { userComposedEmail } from "../services/email.templates.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/msg.model.js";


// ---- very small in-memory limiter for the "send email" feature ----
// (per user, per server instance; resets when the server restarts)
const EMAIL_LIMIT = 10;
const EMAIL_WINDOW_MS = 60 * 60 * 1000;
const emailSends = new Map();

function isEmailRateLimited(userId) {
    const now = Date.now();
    const recent = (emailSends.get(userId) ?? []).filter((t) => now - t < EMAIL_WINDOW_MS);
    emailSends.set(userId, recent);
    return recent.length >= EMAIL_LIMIT;
}

function recordEmailSend(userId) {
    emailSends.set(userId, [...(emailSends.get(userId) ?? []), Date.now()]);
}


export async function sendMessage(req, res) {

    const { message, chat: chatId } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({
            message: "Message is required"
        })
    }

    let title = null, chat = null;

    if (chatId) {
        const existingChat = await chatModel.findOne({
            _id: chatId,
            user: req.user.id
        })

        if (!existingChat) {
            return res.status(404).json({
                message: "Chat not found"
            })
        }
    } else {
        try {
            title = await AiTitle(message);
        } catch (err) {
            title = message.trim().slice(0, 40);
        }

        chat = await chatModel.create({
            user: req.user.id,
            title
        })
    }

    const activeChatId = chatId || chat._id;

    const userMessage = await messageModel.create({
        chat: activeChatId,
        content: message,
        role: 'user'
    })

    // full history (including the message just saved) so the AI has context
    const messages = await messageModel.find({ chat: activeChatId }).sort({ createdAt: 1 });

    // what the AI remembers from the user's other recent chats; never blocks the answer
    let memory = "";
    try {
        memory = await buildMemoryContext({ userId: req.user.id, currentChatId: activeChatId });
    } catch (err) {
        console.error("Could not load chat memory:", err.message);
    }

    let text, emailDraft;
    try {
        ({ text, emailDraft } = await generateResponse(messages, memory));
    } catch (err) {
        // nothing was answered, so undo what this request saved (the user can simply resend)
        await messageModel.deleteOne({ _id: userMessage._id }).catch(() => {});
        if (chat) await chatModel.deleteOne({ _id: chat._id }).catch(() => {});

        console.error("AI request failed:", err.message);

        if (err instanceof AllKeysBusyError) {
            return res.status(503).json({
                message: "Nexora is busy right now. Please try again in a minute."
            })
        }
        return res.status(502).json({
            message: "Nexora couldn't answer that. Please try again."
        })
    }

    const Aimsg = await messageModel.create({
        chat: activeChatId,
        content: text,
        role: 'ai',
        ...(emailDraft ? { emailDraft } : {})
    })

    // keep the chat's updatedAt fresh so the sidebar order reflects recent activity
    await chatModel.updateOne({ _id: activeChatId }, { $set: { updatedAt: new Date() } });

    res.status(201).json({
        title,
        chat,
        Aimsg
    });
}

/**
 * @route POST api/chats/send-email
 * @body { messageId, to, subject, body }
 * Sends an email the AI drafted, after the user reviewed (and maybe edited) it.
 */
export async function sendEmailDraft(req, res) {
    const { messageId, to, subject, body } = req.body;
    const userId = req.user.id;

    const aiMessage = await messageModel.findById(messageId);

    // the draft must exist and belong to a chat owned by this user
    const chat = aiMessage?.emailDraft
        ? await chatModel.findOne({ _id: aiMessage.chat, user: userId })
        : null;

    if (!aiMessage || !chat) {
        return res.status(404).json({
            message: "Email draft not found",
            success: false
        })
    }

    if (aiMessage.emailDraft.status === "sent") {
        return res.status(409).json({
            message: "This email has already been sent",
            success: false
        })
    }

    if (isEmailRateLimited(userId)) {
        return res.status(429).json({
            message: "You've reached the limit of 10 emails per hour. Please try again later.",
            success: false
        })
    }

    // newlines in a subject would let someone inject extra mail headers
    const cleanSubject = subject.replace(/[\r\n]+/g, " ").trim();

    const { html, text } = userComposedEmail({
        senderName: req.user.username,
        senderEmail: req.user.email,
        body
    });

    try {
        await sendEmail(to, cleanSubject, html, { text, replyTo: req.user.email });
    } catch (err) {
        console.error("Could not send user email:", err.message);
        return res.status(502).json({
            message: "The email could not be sent. Please try again in a moment.",
            success: false
        })
    }

    recordEmailSend(userId);

    aiMessage.emailDraft = {
        to,
        subject: cleanSubject,
        body,
        status: "sent",
        sentAt: new Date()
    };
    await aiMessage.save();

    res.status(200).json({
        message: `Email sent to ${to}`,
        success: true,
        emailDraft: aiMessage.emailDraft
    })
}

/**
 * @route GET api/chats/email-drafts
 * Every email the AI drafted for this user (unsent and sent), newest first,
 * across all of their chats. Powers the "Email drafts" section.
 */
export async function listEmailDrafts(req, res) {
    const chats = await chatModel.find({ user: req.user.id }).select("_id title").lean();

    if (!chats.length) {
        return res.status(200).json({ message: "Email drafts retrieved successfully", drafts: [] });
    }

    const titleById = new Map(chats.map((c) => [String(c._id), c.title]));

    const messages = await messageModel
        .find({ chat: { $in: chats.map((c) => c._id) }, emailDraft: { $exists: true } })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    const drafts = messages.map((m) => ({
        messageId: m._id,
        chatId: m.chat,
        chatTitle: titleById.get(String(m.chat)) ?? "Untitled",
        emailDraft: m.emailDraft,
        createdAt: m.createdAt,
    }));

    res.status(200).json({
        message: "Email drafts retrieved successfully",
        drafts
    })
}

export async function retriveChats(req, res) {
    const user = req.user;

    const chats = await chatModel.find({ user: user.id }).sort({ updatedAt: -1 });

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}

export async function retriveMessages(req, res) {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages
    })
}

export async function deleteChats(req, res) {
    const { chatId } = req.params

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    await messageModel.deleteMany({
        chat: chatId
    })

    res.status(200).json({
        message: "Chat deleted successfully"
    })
}
