import { useSelector } from 'react-redux'
import { Navigate } from 'react-router'


const Protected = ({ children }) => {
    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-transparent bg-[conic-gradient(from_0deg,transparent,var(--color-blue-600))] bg-[length:100%_100%] bg-no-repeat [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] [padding:4px]" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }


    return children
}

export default Protected