import { configureStore } from '@reduxjs/toolkit';
import  authRed  from '../features/auth/services/auth.slice';
import chatReducer from '../features/chat/chat.slice';

export const store = configureStore({
    reducer: {
        auth: authRed,
        chat: chatReducer,
    },
})
