import { useState, useContext } from 'react'
import { isEmail } from 'validator'
import { AuthContext } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

const Login = () => {

    const { login } = useContext(AuthContext)

    const navigate = useNavigate()

    const [userData, setUserData] = useState({
        email: "",
        password: ""
    })
    const [error, setError] = useState("")
    const [submitting, setSubmitting] = useState(false)

    function handleUserDataChange(e) {
        setError("")
        setUserData((prevUserdata) => {
            return {
                ...prevUserdata,
                [e.target.name]: e.target.value
            }
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")

        // Data validation
        if (!userData.email || !userData.password) {
            setError("Please fill in all fields")
            return
        }

        if (!isEmail(userData.email)) {
            setError("Please enter a valid email address")
            return
        }

        if (userData.password.length < 8) {
            setError("Password must be at least 8 characters long")
            return
        }

        try {
            setSubmitting(true)
            await login(userData.email, userData.password)

            setUserData({
                email: "",
                password: ""
            })
            navigate('/dashboard')
        } catch (error) {
            setError(error.response?.data?.message || "Login failed")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FFF8EE] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">

                {/* Heading */}
                <div className="mb-6 text-center">
                    <div className="inline-block rounded-full border-2 border-black bg-[#FFD166] px-4 py-2 text-sm font-bold shadow-[3px_3px_0px_#000]">
                        🔐 Welcome back
                    </div>

                    <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-900">
                        Welcome back!
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Log in to continue your COSH journey.
                    </p>
                </div>

                {/* Form Card */}
                <div className="rounded-3xl border-2 border-black bg-white p-7 shadow-[7px_7px_0px_#000]">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {error && <div className="rounded-xl border-2 border-black bg-[#FF6B6B] p-4 font-bold">{error}</div>}

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email-input"
                                className="mb-2 block text-sm font-bold text-gray-900"
                            >
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                id="email-input"
                                value={userData.email}
                                onChange={handleUserDataChange}
                                placeholder="you@example.com"
                                className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 text-gray-900 outline-none transition focus:-translate-y-0.5 focus:shadow-[3px_3px_0px_#000]"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password-input"
                                className="mb-2 block text-sm font-bold text-gray-900"
                            >
                                Password
                            </label>

                            <input
                                type="password"
                                name="password"
                                id="password-input"
                                value={userData.password}
                                onChange={handleUserDataChange}
                                placeholder="Your password"
                                className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 text-gray-900 outline-none transition focus:-translate-y-0.5 focus:shadow-[3px_3px_0px_#000]"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-xl border-2 border-black bg-[#FF6B6B] px-4 py-3.5 font-black text-white shadow-[4px_4px_0px_#000] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-[2px_2px_0px_#000] disabled:opacity-50"
                        >
                            {submitting ? "Logging in..." : "Log In 🚀"}
                        </button>

                    </form>
                </div>

                <p className="mt-6 text-center font-medium text-gray-600">
                    New to COSH?{' '}
                    <button type="button" onClick={() => navigate('/register')} className="font-black text-gray-900 underline">
                        Create an account
                    </button>
                </p>

                <button type="button" onClick={() => navigate('/')} className="mt-4 block w-full text-center font-black hover:underline">← Home</button>

            </div>
        </div>
    )
}

export default Login
