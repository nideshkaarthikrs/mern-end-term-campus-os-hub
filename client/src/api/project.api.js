import api from "./api.js";

export const getProjects = (filters = {}) => {
    return api.get('/projects', { params: filters })
}

export const createProject = (projectData) => {
    return api.post('/projects', projectData)
}

export const getProjectDetails = (projectId) => {
    return api.get(`/projects/${projectId}`)
}

export const updateProject = (projectId, projectData) => {
    return api.put(`/projects/${projectId}`, projectData)
}

export const deleteProject = (projectId) => {
    return api.delete(`/projects/${projectId}`)
}
