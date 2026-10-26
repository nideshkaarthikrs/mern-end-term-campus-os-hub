import { useContext } from "react"
import { Navigate, Outlet } from "react-router-dom"
import { AuthContext } from "../context/AuthContext.jsx"

const ProtectedRoute = () => {

    const { user, loading } = useContext(AuthContext)

    if (loading) {
        return <div className="flex min-h-screen items-center justify-center bg-[#FFF8EE] font-black">Loading...</div>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
