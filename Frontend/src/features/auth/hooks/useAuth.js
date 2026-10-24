import { useDispatch } from "react-redux";
import {
    register,
    login,
    getMe,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
} from "../services/auth.api";
import { setUser, setLoading, setError } from "../services/auth.slice";

export function useAuth() {
    const dispatch = useDispatch();

    async function handleRegister({ username, email, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            return await register({ username, email, password });

        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Registration Failed"))
            throw error;
        }
        finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ email, password }) {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));

            const data = await login({ email, password });

            dispatch(setUser(data.user));

        } catch (error) {
            dispatch(
                setError(
                    error.response?.data?.message || "Login Failed"
                )
            );

            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            const data = await getMe();
            dispatch(setUser(data.user));
        } catch {
            // a failed getMe just means nobody is logged in; don't surface it as an error
            dispatch(setUser(null))
        }
        finally {
            dispatch(setLoading(false))
        }
    }

    // The handlers below are used by the verify-email / forgot-password / reset-password
    // pages. They keep their own loading/error state, so they just return the API
    // response and let errors bubble up to the page.
    const handleVerifyEmail = (token) => verifyEmail(token)
    const handleResendVerification = (email) => resendVerification(email)
    const handleForgotPassword = (email) => forgotPassword(email)
    const handleResetPassword = ({ token, password }) => resetPassword({ token, password })

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleVerifyEmail,
        handleResendVerification,
        handleForgotPassword,
        handleResetPassword
    }

}

