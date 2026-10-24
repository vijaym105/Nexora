import { createBrowserRouter, Navigate } from 'react-router';
import Login from '../features/auth/pages/Login.jsx';
import Register from '../features/auth/pages/Register.jsx';
import Protected from '../features/auth/components/Proctected.jsx';
import Dashboard from '../features/chat/pages/Dashboard.jsx';
import VerifyEmail from '../features/auth/pages/VerifyEmail.jsx';
import ForgotPassword from '../features/auth/pages/ForgotPassword.jsx';
import ResetPassword from '../features/auth/pages/ResetPassword.jsx';

export const route = createBrowserRouter([
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/verify-email',
        element: <VerifyEmail />
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />
    },
    {
        path: '/reset-password',
        element: <ResetPassword />
    },
    {
        path: '/',
        element: <Protected>
            <Dashboard />
        </Protected>
    },
    {
        path: '/dashboard',
        element: <Navigate to='/' replace />
    }
])