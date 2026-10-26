import Project from "../models/project.model.js"
import mongoose from "mongoose"
import validator from "validator"
import Issue from "../models/issue.model.js"

const getProjectData = (body) => {
    const { name, description, repositoryUrl, techStack } = body || {}
    if (typeof name !== "string" || !name.trim() ||
        typeof description !== "string" || !description.trim() ||
        typeof repositoryUrl !== "string" || !validator.isURL(repositoryUrl.trim(), { require_protocol: true, protocols: ["http", "https"] }) ||
        !Array.isArray(techStack) || !techStack.length ||
        !techStack.every(tech => typeof tech === "string" && tech.trim())) {
        return null
    }
    return {
        name: name.trim(),
        description: description.trim(),
        repositoryUrl: repositoryUrl.trim(),
        techStack: techStack.map(tech => tech.trim())
    }
}

export const createProject = async (req, res) => {
    try {
        const { userId } = req.user
        const projectData = getProjectData(req.body)
        if (!projectData) {
            return res.status(400).json({
                message: "Enter a name, description, valid repository URL, and at least one technology"
            })
        }
        const newProject = await Project.create({
            ...projectData, owner: userId
        })
        return res.status(201).json(newProject)
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}


export const getProjects = async (req, res) => {
    try {
        const allProjects = await Project.find().populate("owner", "name")
        return res.status(200).json({projects: allProjects})
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const getProjectDetails = async (req, res) => {
    try {
        const projectId = req.params.projectId
        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" })
        }
        const currentProject = await Project.findById(projectId).populate("owner", "name")
        if (!currentProject) {
            return res.status(404).json({
                message: "Project not found"
            })
        }
        return res.status(200).json(currentProject)
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}


export const updateProject = async (req, res) => {
    try {
        const { userId, role } = req.user
        const projectId = req.params.projectId
        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" })
        }
        // Check if the project exists
        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            })
        }
        // Check if the user is the owner of the project or an admin
        if (role!=="admin" && project.owner.toString() !== userId) {
            return res.status(403).json({
                message: "You are not authorized to update this project"
            })
        }
        // Check if the required fields are present
        const projectData = getProjectData(req.body)
        if (!projectData) {
            return res.status(400).json({
                message: "Enter a name, description, valid repository URL, and at least one technology"
            })
        }
        // Update the project
        const updatedProject = await Project.findByIdAndUpdate(projectId, projectData, { returnDocument: "after", runValidators: true })
        // Check if the project was updated
        if (!updatedProject) {
            return res.status(404).json({
                message: "Project not found"
            })
        }
        await updatedProject.populate("owner", "name")
        return res.status(200).json(updatedProject)
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const deleteProject = async (req, res) => {
    try {
        const { userId, role } = req.user
        const projectId = req.params.projectId
        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({ message: "Invalid project ID" })
        }
        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json({ message: "Project not found" })
        }
        if (role !== "admin" && project.owner.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this project" })
        }
        const activeOrCompletedIssue = await Issue.exists({ project: projectId, status: { $in: ["claimed", "completed"] } })
        if (activeOrCompletedIssue) {
            return res.status(409).json({ message: "Projects with claimed or completed issues cannot be deleted" })
        }
        await Issue.deleteMany({ project: projectId })
        await Project.findByIdAndDelete(projectId)
        return res.status(200).json({ message: "Project deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}
