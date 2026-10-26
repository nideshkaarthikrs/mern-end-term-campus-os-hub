import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext.jsx"

const Landing = () => {
    const { user, loading } = useContext(AuthContext)
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#FFF8EE] px-5 py-8 md:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">
                <nav className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black bg-[#FFD166] text-xl shadow-[3px_3px_0px_#000]">🚀</div>
                        <span className="text-2xl font-black tracking-tight">COSH</span>
                    </div>
                    {!loading && (
                        <button type="button" onClick={() => navigate(user ? '/dashboard' : '/login')} className="rounded-xl border-2 border-black bg-white px-5 py-2.5 font-black shadow-[3px_3px_0px_#000]">
                            {user ? "Dashboard →" : "Log in →"}
                        </button>
                    )}
                </nav>

                <main className="mt-16 md:mt-24">
                    <div className="inline-block rounded-full border-2 border-black bg-[#FFD166] px-4 py-2 text-sm font-black shadow-[3px_3px_0px_#000]">
                        CAMPUS OPEN-SOURCE HUB
                    </div>
                    <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
                        Find a project. Make a contribution.
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-gray-700 md:text-xl">
                        Discover open-source projects from your campus community, find an issue that fits your skills, and build a verified contribution history.
                    </p>

                    {!loading && (
                        <div className="mt-8 flex flex-wrap gap-4">
                            <button type="button" onClick={() => navigate(user ? '/projects' : '/register')} className="rounded-xl border-2 border-black bg-[#FF6B6B] px-6 py-3 font-black shadow-[4px_4px_0px_#000]">
                                {user ? "Explore projects →" : "Get started →"}
                            </button>
                            <button type="button" onClick={() => navigate(user ? '/issues' : '/login')} className="rounded-xl border-2 border-black bg-white px-6 py-3 font-black shadow-[4px_4px_0px_#000]">
                                {user ? "Browse issues" : "I already have an account"}
                            </button>
                        </div>
                    )}

                    <div className="mt-16 grid gap-6 md:grid-cols-3">
                        <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000]">
                            <span className="text-3xl">🔎</span>
                            <h2 className="mt-4 text-2xl font-black">Discover</h2>
                            <p className="mt-2 font-medium text-gray-600">Explore projects and issues from your campus community.</p>
                        </div>
                        <div className="rounded-3xl border-2 border-black bg-[#FFD166] p-6 shadow-[6px_6px_0px_#000]">
                            <span className="text-3xl">🛠️</span>
                            <h2 className="mt-4 text-2xl font-black">Contribute</h2>
                            <p className="mt-2 font-medium text-gray-700">Claim an open issue and work with its maintainer.</p>
                        </div>
                        <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000]">
                            <span className="text-3xl">🏅</span>
                            <h2 className="mt-4 text-2xl font-black">Build your history</h2>
                            <p className="mt-2 font-medium text-gray-600">Keep a record of contributions verified by maintainers.</p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Landing
