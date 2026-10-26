import mongoose from "mongoose"
import Issue from "../models/issue.model.js"
import Project from "../models/project.model.js"
import User from "../models/user.model.js"

const getIssueData = (body, includeStatus = false) => {
    const { title, description, difficulty, requiredSkills, status } = body || {}
    if (typeof title !== "string" || !title.trim() ||
        typeof description !== "string" || !description.trim() ||
        !["beginner", "intermediate", "advanced"].includes(difficulty) ||
        !Array.isArray(requiredSkills) ||
        !requiredSkills.every(skill => typeof skill === "string" && skill.trim()) ||
        (includeStatus && !["open", "closed"].includes(status))) {
        return null
    }

    const issueData = {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        requiredSkills: requiredSkills.map(skill => skill.trim())
    }
    if (includeStatus) issueData.status = status
    return issueData
}

const getProject = async (projectId, res) => {
    if (!mongoose.isValidObjectId(projectId)) {
        res.status(400).json({ message: "Invalid project ID" })
        return null
    }
    const project = await Project.findById(projectId)
    if (!project) {
        res.status(404).json({ message: "Project not found" })
        return null
    }
    return project
}

const canManage = (project, user) => {
    return user.role === "admin" || project.owner.toString() === user.userId
}

export const createIssue = async (req, res) => {
    try {
        const project = await getProject(req.params.projectId, res)
        if (!project) return
        if (!canManage(project, req.user)) {
            return res.status(403).json({ message: "You are not authorized to create issues for this project" })
        }
        const issueData = getIssueData(req.body)
        if (!issueData) {
            return res.status(400).json({ message: "Enter a title, description, difficulty, and valid required skills" })
        }
        const issue = await Issue.create({ ...issueData, project: project._id })
        return res.status(201).json(issue)
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getIssues = async (req, res) => {
    try {
        const project = await getProject(req.params.projectId, res)
        if (!project) return
        const issues = await Issue.find({ project: project._id }).sort({ createdAt: -1 })
        return res.status(200).json({ issues })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getIssueDetails = async (req, res) => {
    try {
        const project = await getProject(req.params.projectId, res)
        if (!project) return
        if (!mongoose.isValidObjectId(req.params.issueId)) {
            return res.status(400).json({ message: "Invalid issue ID" })
        }
        const issue = await Issue.findOne({ _id: req.params.issueId, project: project._id })
            .populate("claimedBy", "name")
            .populate("verifiedBy", "name")
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" })
        }
        return res.status(200).json(issue)
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const updateIssue = async (req, res) => {
    try {
        const project = await getProject(req.params.projectId, res)
        if (!project) return
        if (!mongoose.isValidObjectId(req.params.issueId)) {
            return res.status(400).json({ message: "Invalid issue ID" })
        }
        if (!canManage(project, req.user)) {
            return res.status(403).json({ message: "You are not authorized to update this issue" })
        }
        const issueData = getIssueData(req.body, true)
        if (!issueData) {
            return res.status(400).json({ message: "Enter a title, description, difficulty, valid required skills, and status" })
        }
        const currentIssue = await Issue.findOne({ _id: req.params.issueId, project: project._id })
        if (!currentIssue) {
            return res.status(404).json({ message: "Issue not found" })
        }
        if (!["open", "closed"].includes(currentIssue.status)) {
            return res.status(409).json({ message: "Claimed or completed issues cannot be edited" })
        }
        const issue = await Issue.findOneAndUpdate(
            { _id: req.params.issueId, project: project._id, status: currentIssue.status },
            issueData,
            { returnDocument: "after", runValidators: true }
        )
        if (!issue) {
            return res.status(409).json({ message: "Issue status changed. Please try again" })
        }
        return res.status(200).json(issue)
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const deleteIssue = async (req, res) => {
    try {
        const project = await getProject(req.params.projectId, res)
        if (!project) return
        if (!mongoose.isValidObjectId(req.params.issueId)) {
            return res.status(400).json({ message: "Invalid issue ID" })
        }
        if (!canManage(project, req.user)) {
            return res.status(403).json({ message: "You are not authorized to delete this issue" })
        }
        const currentIssue = await Issue.findOne({ _id: req.params.issueId, project: project._id })
        if (!currentIssue) {
            return res.status(404).json({ message: "Issue not found" })
        }
        if (!["open", "closed"].includes(currentIssue.status)) {
            return res.status(409).json({ message: "Claimed or completed issues cannot be deleted" })
        }
        const issue = await Issue.findOneAndDelete({ _id: req.params.issueId, project: project._id, status: currentIssue.status })
        if (!issue) {
            return res.status(409).json({ message: "Issue status changed. Please try again" })
        }
        return res.status(200).json({ message: "Issue deleted successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const claimIssue = async (req, res) => {
    try {
        const project = await getProject(req.params.projectId, res)
        if (!project) return
        if (!mongoose.isValidObjectId(req.params.issueId)) {
            return res.status(400).json({ message: "Invalid issue ID" })
        }
        const issue = await Issue.findOne({ _id: req.params.issueId, project: project._id })
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" })
        }
        if (issue.status !== "open") {
            return res.status(409).json({ message: "This issue is not open for claiming" })
        }
        const student = await User.findById(req.user.userId)
        if (!student || student.role !== "student") {
            return res.status(403).json({ message: "Only students can claim issues" })
        }
        const claimedIssue = await Issue.findOneAndUpdate(
            { _id: issue._id, project: project._id, status: "open" },
            { status: "claimed", claimedBy: student._id, claimedAt: new Date() },
            { returnDocument: "after", runValidators: true }
        )
        if (!claimedIssue) {
            return res.status(409).json({ message: "This issue has already been claimed" })
        }
        return res.status(200).json(claimedIssue)
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const unclaimIssue = async (req, res) => {
    try {
        const project = await getProject(req.params.projectId, res)
        if (!project) return
        if (!mongoose.isValidObjectId(req.params.issueId)) {
            return res.status(400).json({ message: "Invalid issue ID" })
        }
        const issue = await Issue.findOne({ _id: req.params.issueId, project: project._id })
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" })
        }
        if (issue.status !== "claimed") {
            return res.status(409).json({ message: "This issue is not currently claimed" })
        }
        if (!issue.claimedBy || issue.claimedBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You did not claim this issue" })
        }
        const unclaimedIssue = await Issue.findOneAndUpdate(
            { _id: issue._id, project: project._id, status: "claimed", claimedBy: req.user.userId },
            { $set: { status: "open" }, $unset: { claimedBy: "", claimedAt: "" } },
            { returnDocument: "after", runValidators: true }
        )
        if (!unclaimedIssue) {
            return res.status(409).json({ message: "Issue status changed. Please try again" })
        }
        return res.status(200).json(unclaimedIssue)
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const completeIssue = async (req, res) => {
    try {
        const project = await getProject(req.params.projectId, res)
        if (!project) return
        if (!mongoose.isValidObjectId(req.params.issueId)) {
            return res.status(400).json({ message: "Invalid issue ID" })
        }
        if (!canManage(project, req.user)) {
            return res.status(403).json({ message: "You are not authorized to complete this issue" })
        }
        const issue = await Issue.findOne({ _id: req.params.issueId, project: project._id })
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" })
        }
        if (issue.status !== "claimed" || !issue.claimedBy) {
            return res.status(409).json({ message: "Only claimed issues can be completed" })
        }
        const student = await User.findById(issue.claimedBy)
        if (!student) {
            return res.status(409).json({ message: "The claimant account no longer exists" })
        }
        const completedIssue = await Issue.findOneAndUpdate(
            { _id: issue._id, project: project._id, status: "claimed", claimedBy: issue.claimedBy },
            { status: "completed", completedAt: new Date(), verifiedBy: req.user.userId },
            { returnDocument: "after", runValidators: true }
        )
        if (!completedIssue) {
            return res.status(409).json({ message: "Issue status changed. Please try again" })
        }
        await User.updateOne(
            { _id: issue.claimedBy },
            { $addToSet: { projectsContributedTo: project._id, completedContributions: issue._id } }
        )
        return res.status(200).json(completedIssue)
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" })
    }
}
