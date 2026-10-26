import api from "./api.js"


export const registerUser = (user) => {
    return api.post('/auth/register', {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role
    })
}

export const loginUser = (userData) => {
    return api.post('/auth/login', {
        email: userData.email,
        password: userData.password
    })
}

export const getCurrentUser = () => {
    return api.get('/auth/me')
}

export const getMyContributions = () => {
    return api.get('/auth/me/contributions')
}

export const logoutUser = () => {
    return api.post('/auth/logout')
}
