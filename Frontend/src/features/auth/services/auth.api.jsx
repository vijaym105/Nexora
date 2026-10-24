import axios from 'axios';
import { API_URL } from '../../../app/config';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true
})

export async function register({ username, email, password }){
    const resp = await api.post("/auth/register", {username, email, password});
    return resp.data
}

export async function login({ email, password }) {
    const resp = await api.post("/auth/login", {
        email,
        password
    });

    return resp.data;
}

export async function getMe(){
    const resp = await api.get("/auth/getMe");
    return resp.data;
}

export async function verifyEmail(token) {
    const resp = await api.post("/auth/verify-email", { token });
    return resp.data;
}

export async function resendVerification(email) {
    const resp = await api.post("/auth/resend-verification", { email });
    return resp.data;
}

export async function forgotPassword(email) {
    const resp = await api.post("/auth/forgot-password", { email });
    return resp.data;
}

export async function resetPassword({ token, password }) {
    const resp = await api.post("/auth/reset-password", { token, password });
    return resp.data;
}
