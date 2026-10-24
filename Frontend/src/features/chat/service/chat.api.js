import axios from "axios";
import { API_URL } from "../../../app/config";

const api = axios.create({
    baseURL: `${API_URL}/api/chats`,
    withCredentials: true,
})


export const sendMessage = async ({ message, chatId }) => {
    const response = await api.post("/send-message", { message, chat: chatId })
    return response.data
}

export const getChats = async () => {
    const response = await api.get("/retrive-chats")
    return response.data
}

export const getMessages = async (chatId) => {
    const response = await api.get(`/retrive-msg/${chatId}`)
    return response.data
}

export const getEmailDrafts = async () => {
    const response = await api.get("/email-drafts")
    return response.data
}

export const sendEmailDraft = async ({ messageId, to, subject, body }) => {
    const response = await api.post("/send-email", { messageId, to, subject, body })
    return response.data
}

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/delete/${chatId}`)
    return response.data
}
