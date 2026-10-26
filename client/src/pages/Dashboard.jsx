import { useContext } from "react"
import { AuthContext } from "../context/AuthContext.jsx"
import { useNavigate } from "react-router-dom"

const Dashboard = () => {

    const { user, logout } = useContext(AuthContext)
    const navigate = useNavigate()

    async function handleLogout() {
        await logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-[#FFF8EE] px-5 py-8">

            {/* Navbar */}
            <nav className="mx-auto flex max-w-6xl items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black bg-[#FFD166] text-xl shadow-[3px_3px_0px_#000]">
                        🚀
                    </div>

                    <span className="text-2xl font-black tracking-tight">
                        COSH
                    </span>
                </div>

                <button
                    onClick={handleLogout}
                    className="rounded-xl border-2 border-black bg-white px-4 py-2.5 font-black text-gray-900 shadow-[3px_3px_0px_#000] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-y-1 active:shadow-[1px_1px_0px_#000]"
                >
                    Logout
                </button>
            </nav>

            {/* Main Content */}
            <main className="mx-auto mt-12 max-w-6xl">

                {/* Welcome */}
                <div className="mb-10">
                    <div className="mb-4 inline-block rounded-full border-2 border-black bg-[#FFD166] px-4 py-2 text-sm font-bold shadow-[3px_3px_0px_#000]">
                        👋 You're logged in
                    </div>

                    <h1 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
                        Welcome, {user.name}!
                    </h1>

                    <p className="mt-3 max-w-2xl text-lg text-gray-600">
                        Welcome to COSH — your campus hub for discovering and
                        contributing to open-source projects.
                    </p>
                </div>

                {/* Profile Card */}
                <div className="grid gap-6 md:grid-cols-2">

                    <div className="rounded-3xl border-2 border-black bg-white p-7 shadow-[7px_7px_0px_#000]">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-2xl font-black">
                                Your Account
                            </h2>

                            <div className="rounded-full border-2 border-black bg-[#A7F3D0] px-3 py-1 text-xs font-black">
                                {user.role}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-bold text-gray-500">
                                    NAME
                                </p>
                                <p className="mt-1 text-lg font-bold text-gray-900">
                                    {user.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-bold text-gray-500">
                                    EMAIL
                                </p>
                                <p className="mt-1 break-all text-lg font-bold text-gray-900">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <button type="button" onClick={() => navigate('/contributions')} className="mt-6 rounded-xl border-2 border-black bg-[#FFD166] px-4 py-2 font-black shadow-[3px_3px_0px_#000]">
                            View contribution history →
                        </button>
                    </div>

                    {/* Coming Soon Card */}
                    <div className="rounded-3xl border-2 border-black bg-[#FF6B6B] p-7 shadow-[7px_7px_0px_#000]">
                        <div className="mb-5 text-4xl">
                            🛠️
                        </div>

                        <h2 className="text-2xl font-black text-white">
                            Your open-source journey starts here.
                        </h2>

                        <p className="mt-3 font-medium leading-relaxed text-white/90">
                            Explore campus projects and find something worth
                            contributing to.
                        </p>

                        <button onClick={() => navigate('/projects')} className="mt-6 inline-block rounded-xl border-2 border-black bg-white px-4 py-2 text-sm font-black text-gray-900">
                            Explore projects →
                        </button>
                    </div>

                </div>

            </main>
        </div>
    )
}

export default Dashboard
