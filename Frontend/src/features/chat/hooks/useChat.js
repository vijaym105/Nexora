import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat, sendEmailDraft, getEmailDrafts } from "../service/chat.api";
import {
    setChats,
    setCurrentChatId,
    setError,
    setLoading,
    createNewChat,
    renameChat,
    removeChat,
    addNewMessage,
    updateEmailDraft,
    setEmailDrafts,
    setEmailDraftsLoading,
    addMessages,
} from "../chat.slice";
import { useDispatch } from "react-redux";

// id used for a brand new chat until the server gives us the real one
export const TEMP_CHAT_ID = "__new__";

const formatTime = (date = new Date()) =>
    new Date(date).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });


export const useChat = () => {

    const dispatch = useDispatch()


    async function handleSendMessage({ message, chatId }) {
        const isNewChat = !chatId || chatId === TEMP_CHAT_ID
        let activeChatId = chatId

        dispatch(setError(null))
        dispatch(setLoading(true))

        // show the user's message straight away
        if (!chatId) {
            activeChatId = TEMP_CHAT_ID
            dispatch(createNewChat({ chatId: TEMP_CHAT_ID, title: "New conversation" }))
            dispatch(setCurrentChatId(TEMP_CHAT_ID))
        }
        dispatch(addNewMessage({
            chatId: activeChatId,
            content: message,
            role: "user",
            time: formatTime(),
        }))

        try {
            const data = await sendMessage({
                message,
                chatId: isNewChat ? undefined : chatId,
            })
            const { chat, Aimsg } = data

            if (isNewChat) {
                dispatch(renameChat({ from: TEMP_CHAT_ID, to: chat._id, title: chat.title }))
                activeChatId = chat._id
            }

            dispatch(addNewMessage({
                chatId: activeChatId,
                content: Aimsg.content,
                role: Aimsg.role,
                time: formatTime(Aimsg.createdAt),
                id: Aimsg._id,
                emailDraft: Aimsg.emailDraft,
            }))
            dispatch(setCurrentChatId(activeChatId))
        } catch (error) {
            const reason = error.response?.data?.message || "Something went wrong. Please try again."
            dispatch(setError(reason))
            dispatch(addNewMessage({
                chatId: activeChatId,
                content: reason,
                role: "ai",
                time: formatTime(),
            }))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetChats() {
        try {
            const data = await getChats()
            const { chats } = data
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[ chat._id ] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    loaded: false,
                    lastUpdated: chat.updatedAt,
                }
                return acc
            }, {})))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Could not load chats"))
        }
    }

    async function handleOpenChat(chatId, chats) {
        if (chatId !== TEMP_CHAT_ID && !chats[ chatId ]?.loaded) {
            try {
                const data = await getMessages(chatId)
                const { messages } = data

                dispatch(addMessages({
                    chatId,
                    messages: messages.map(msg => ({
                        content: msg.content,
                        role: msg.role,
                        time: formatTime(msg.createdAt),
                        id: msg._id,
                        emailDraft: msg.emailDraft,
                    })),
                }))
            } catch (error) {
                dispatch(setError(error.response?.data?.message || "Could not load messages"))
                return
            }
        }
        dispatch(setCurrentChatId(chatId))
    }

    function handleNewChat() {
        dispatch(removeChat(TEMP_CHAT_ID))
        dispatch(setCurrentChatId(null))
    }

    // Loads every email the AI drafted for the user (for the "Email drafts" section).
    async function handleGetEmailDrafts() {
        dispatch(setEmailDraftsLoading(true))
        try {
            const data = await getEmailDrafts()
            dispatch(setEmailDrafts(data.drafts))
        } catch (error) {
            dispatch(setEmailDraftsLoading(false))
            dispatch(setError(error.response?.data?.message || "Could not load email drafts"))
        }
    }

    // Sends an AI-drafted email. Errors are thrown so the draft card can show them.
    async function handleSendEmail({ chatId, messageId, to, subject, body }) {
        const data = await sendEmailDraft({ messageId, to, subject, body })
        dispatch(updateEmailDraft({ chatId, messageId, emailDraft: data.emailDraft }))
        return data
    }

    async function handleDeleteChat(chatId) {
        try {
            await deleteChat(chatId)
            dispatch(removeChat(chatId))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Could not delete chat"))
            throw error // let the Dashboard tell the user
        }
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleNewChat,
        handleSendEmail,
        handleGetEmailDrafts,
        handleDeleteChat,
    }

}
