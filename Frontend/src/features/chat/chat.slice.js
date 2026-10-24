import { createSlice } from '@reduxjs/toolkit';

// Shape of the state:
// chats = {
//     [chatId]: {
//         id, title, lastUpdated,
//         messages: [ { role: "user" | "ai", content, time, id?, emailDraft? } ],
//         loaded: boolean   // true once the messages were fetched from the server
//     }
// }
//
// emailDrafts.items = [ { messageId, chatId, chatTitle, emailDraft, createdAt } ]  (newest first)
//   every email the AI drafted for the user, across all chats (the "Email drafts" section)

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: {},
        currentChatId: null,
        isLoading: false,
        error: null,
        emailDrafts: { items: [], loading: false, loaded: false },
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload
            state.chats[ chatId ] = {
                id: chatId,
                title,
                messages: [],
                loaded: true,
                lastUpdated: new Date().toISOString(),
            }
        },
        // swaps a temporary chat id for the real one returned by the server
        renameChat: (state, action) => {
            const { from, to, title } = action.payload
            const chat = state.chats[ from ]
            if (!chat) return
            delete state.chats[ from ]
            state.chats[ to ] = { ...chat, id: to, title: title || chat.title }
            if (state.currentChatId === from) state.currentChatId = to
        },
        removeChat: (state, action) => {
            delete state.chats[ action.payload ]
            if (state.currentChatId === action.payload) state.currentChatId = null
            // deleting a chat deletes its messages, and the drafts inside them
            state.emailDrafts.items = state.emailDrafts.items.filter((d) => d.chatId !== action.payload)
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role, time, id, emailDraft } = action.payload
            const chat = state.chats[ chatId ]
            if (!chat) return
            chat.messages.push({ content, role, time, id, emailDraft })
            chat.lastUpdated = new Date().toISOString()

            // a brand-new draft also shows up in the "Email drafts" section straight away
            if (emailDraft && id) {
                state.emailDrafts.items = [
                    { messageId: id, chatId, chatTitle: chat.title, emailDraft, createdAt: new Date().toISOString() },
                    ...state.emailDrafts.items.filter((d) => d.messageId !== id),
                ]
            }
        },
        // after an AI-drafted email is sent, store its final state on the message
        updateEmailDraft: (state, action) => {
            const { chatId, messageId, emailDraft } = action.payload
            const message = state.chats[ chatId ]?.messages.find((m) => m.id === messageId)
            if (message) message.emailDraft = emailDraft

            const item = state.emailDrafts.items.find((d) => d.messageId === messageId)
            if (item) item.emailDraft = emailDraft
        },
        setEmailDrafts: (state, action) => {
            state.emailDrafts = { items: action.payload, loading: false, loaded: true }
        },
        setEmailDraftsLoading: (state, action) => {
            state.emailDrafts.loading = action.payload
        },
        addMessages: (state, action) => {
            const { chatId, messages } = action.payload
            const chat = state.chats[ chatId ]
            if (!chat) return
            chat.messages = messages
            chat.loaded = true
        },
        setChats: (state, action) => {
            state.chats = action.payload
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    }
})

export const {
    setChats,
    setCurrentChatId,
    setLoading,
    setError,
    createNewChat,
    renameChat,
    removeChat,
    addNewMessage,
    updateEmailDraft,
    setEmailDrafts,
    setEmailDraftsLoading,
    addMessages,
} = chatSlice.actions
export default chatSlice.reducer
