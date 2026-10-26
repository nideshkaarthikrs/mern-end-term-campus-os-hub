import { useState, useContext } from 'react'
import { isEmail } from 'validator'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'

const Register = () => {

    const [userData, setUserData] = useState({name:"", email:"", password:"", role:"student"})

    const { register } = useContext(AuthContext)

    const navigate = useNavigate()

    function handleUserDataChange(e) {
        setUserData((prevUserdata) => {
            return {...prevUserdata, [e.target.name]: e.target.value}
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        // Data validation
        if (!userData.name || !userData.email || !userData.password) {
            alert("Please fill in all fields")
            return
        }

        if (userData.name.trim() === "") {
            alert("Name cannot be empty")
            return
        }

        if (!isEmail(userData.email)) {
            alert("Please enter a valid email address")
            return
        }

        if (userData.password.length<8) {
            alert("Password must be at least 8 characters long")
            return
        }


        try {
        // API call
         await register(userData.name, userData.email, userData.password, userData.role)
         setUserData({name:"", email:"", password:"", role:"student"})
         navigate('/dashboard')
        }catch   (error) {
            alert(error.response?.data?.message || "Registration failed")
        }

    }

  return (
  <div className="min-h-screen bg-[#FFF8EE] flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md">

      {/* Heading */}
      <div className="mb-6 text-center">
        <div className="inline-block rounded-full border-2 border-black bg-[#FFD166] px-4 py-2 text-sm font-bold shadow-[3px_3px_0px_#000]">
          🚀 Join COSH
        </div>

        <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-900">
          Create your account
        </h1>

        <p className="mt-2 text-gray-600">
          Start contributing to open-source projects on campus.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl border-2 border-black bg-white p-7 shadow-[7px_7px_0px_#000]">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name */}
          <div>
            <label
              htmlFor="name-input"
              className="mb-2 block text-sm font-bold text-gray-900"
            >
              Name
            </label>

            <input
              type="text"
              name="name"
              id="name-input"
              value={userData.name}
              onChange={handleUserDataChange}
              placeholder="Your name"
              className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 text-gray-900 outline-none transition focus:-translate-y-0.5 focus:shadow-[3px_3px_0px_#000]"
            />
          </div>

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
              placeholder="At least 8 characters"
              className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 text-gray-900 outline-none transition focus:-translate-y-0.5 focus:shadow-[3px_3px_0px_#000]"
            />
          </div>

          {/* Submit */}
          <div>
            <label htmlFor="role-input" className="mb-2 block text-sm font-bold text-gray-900">
              Account type
            </label>
            <select
              id="role-input"
              name="role"
              value={userData.role}
              onChange={handleUserDataChange}
              className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 text-gray-900 outline-none"
            >
              <option value="student">Student</option>
              <option value="maintainer">Project maintainer</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl border-2 border-black bg-[#FF6B6B] px-4 py-3.5 font-black text-white shadow-[4px_4px_0px_#000] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000] active:translate-y-1 active:shadow-[2px_2px_0px_#000]"
          >
            Create Account 🚀
          </button>

        </form>
      </div>

      <p className="mt-6 text-center font-medium text-gray-600">
        Already have an account?{' '}
        <button type="button" onClick={() => navigate('/login')} className="font-black text-gray-900 underline">
          Log in
        </button>
      </p>

    </div>
  </div>
)
}

export default Register
