import { createContext, useEffect, useState } from 'react'
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../api/auth.api.js'

export const AuthContext = createContext(null)

export const AuthContextProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCurrentUser() {
            try {
                const user = await getCurrentUser()
                setUser(user.data)
            } catch (error) {
                console.log(error.response?.data?.message || "Not authenticated")
            } finally {
                setLoading(false)
            }
        }

        fetchCurrentUser()
    }, [])

    async function login(email, password) {
        await loginUser({email, password})
        const currentUser = await getCurrentUser()
        setUser(currentUser.data)
        return currentUser.data
    }

    async function logout() {
        await logoutUser()
        setUser(null)
    }

    async function register(name, email, password, role) {
        await registerUser({name, email, password, role})
        const currentUser = await getCurrentUser()
        setUser(currentUser.data)
        return currentUser.data
    }

  return (
    <AuthContext.Provider value={{user, login, register, logout, loading}}>
        {children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider
