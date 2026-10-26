import api from "./api.js"

export const getIssues = (projectId) => {
    return api.get(`/projects/${projectId}/issues`)
}

export const createIssue = (projectId, issueData) => {
    return api.post(`/projects/${projectId}/issues`, issueData)
}

export const getIssueDetails = (projectId, issueId) => {
    return api.get(`/projects/${projectId}/issues/${issueId}`)
}

export const updateIssue = (projectId, issueId, issueData) => {
    return api.put(`/projects/${projectId}/issues/${issueId}`, issueData)
}

export const deleteIssue = (projectId, issueId) => {
    return api.delete(`/projects/${projectId}/issues/${issueId}`)
}

export const claimIssue = (projectId, issueId) => {
    return api.post(`/projects/${projectId}/issues/${issueId}/claim`)
}

export const unclaimIssue = (projectId, issueId) => {
    return api.delete(`/projects/${projectId}/issues/${issueId}/claim`)
}

export const completeIssue = (projectId, issueId) => {
    return api.post(`/projects/${projectId}/issues/${issueId}/complete`)
}
