import { createHash } from "node:crypto"
import User from "../models/user.model.js"
import Issue from "../models/issue.model.js"
import Project from "../models/project.model.js"
import { recommendWithGemini } from "../config/gemini.js"

const states = new Map()
const normalize = value => value.trim().toLowerCase()
const cleanSkills = skills => (Array.isArray(skills) ? skills : [])
    .filter(skill => typeof skill === "string" && skill.trim()).slice(0, 20).map(skill => skill.trim().slice(0, 50))

const getState = (userId) => {
    const now = Date.now()
    for (const [id, state] of states) {
        if (now - state.windowStart > 60 * 60 * 1000 && !state.inFlight) states.delete(id)
    }
    if (!states.has(userId)) {
        if (states.size >= 500) states.delete(states.keys().next().value)
        states.set(userId, { windowStart: now, attempts: 0, inFlight: false })
    }
    const state = states.get(userId)
    if (now - state.windowStart >= 60000) {
        state.windowStart = now
        state.attempts = 0
    }
    return state
}

const getSkillMatch = (issue, skills) => {
    const known = new Set(skills.map(normalize))
    const required = cleanSkills(issue.requiredSkills)
    const related = required.length ? required : cleanSkills(issue.project.techStack)
    return {
        matchedSkills: [...new Set(related.filter(skill => known.has(normalize(skill))))],
        skillsToLearn: required.filter(skill => !known.has(normalize(skill)))
    }
}

const rankIssue = (issue, skills, goal, experience) => {
    const match = getSkillMatch(issue, skills)
    const stopWords = new Set(["want", "would", "like", "with", "for", "the", "and", "learn", "practise", "practice", "work", "something"])
    const words = (normalize(goal).match(/[a-z0-9+#.]+/g) || []).filter(word => word.length > 2 && !stopWords.has(word))
    const text = normalize([issue.title, issue.description, issue.difficulty, ...issue.requiredSkills].join(" "))
    const projectText = normalize([issue.project.name, ...issue.project.techStack].join(" "))
    const known = new Set(skills.map(normalize))
    return match.matchedSkills.length * 5 + words.filter(word => text.includes(word)).length * 3 +
        words.filter(word => projectText.includes(word)).length + issue.project.techStack.filter(skill => known.has(normalize(skill))).length +
        (issue.difficulty === "beginner" ? 2 : issue.difficulty === "intermediate" && experience > 1 ? 1 : 0)
}

const toRecommendation = (issue, skills, reason, firstStep) => ({
    issue: {
        _id: issue._id,
        title: issue.title,
        difficulty: issue.difficulty,
        requiredSkills: issue.requiredSkills,
        project: { _id: issue.project._id, name: issue.project.name }
    },
    ...getSkillMatch(issue, skills),
    reason,
    firstStep
})

const skillRecommendations = (issues, skills) => issues.slice(0, 3).map(issue => {
    const { matchedSkills, skillsToLearn } = getSkillMatch(issue, skills)
    const reason = matchedSkills.length ? `This issue connects with your ${matchedSkills.join(", ")} skills.` :
        `This ${issue.difficulty} issue offers practice with ${issue.requiredSkills.join(", ") || "a new project"}.`
    const firstStep = skillsToLearn.length ?
        `Read the issue and repository setup instructions, then review ${skillsToLearn.join(", ")} before planning a small first change.` :
        "Read the issue and repository setup instructions, then outline a small first change for the maintainer."
    return toRecommendation(issue, skills, reason, firstStep)
})

export const getIssueRecommendations = async (req, res) => {
    const goal = req.body?.goal ?? ""
    if (typeof goal !== "string" || goal.length > 500) {
        return res.status(400).json({ message: "Enter a learning goal of at most 500 characters" })
    }

    try {
        const user = await User.findById(req.user.userId).select("skills")
        if (!user) return res.status(404).json({ message: "User not found" })
        const skills = cleanSkills(user.skills)
        if (!skills.length && !goal.trim()) {
            return res.status(400).json({ message: "Add skills to your profile or describe what you would like to learn" })
        }

        const [openIssues, completed] = await Promise.all([
            Issue.find({ status: "open" }).select("title description difficulty requiredSkills project updatedAt")
                .populate({ path: "project", select: "name techStack", model: Project }).sort({ createdAt: -1 }).limit(100).lean(),
            Issue.find({ claimedBy: req.user.userId, status: "completed" }).select("title difficulty requiredSkills")
                .sort({ completedAt: -1 }).limit(5).lean()
        ])
        const issues = openIssues.filter(issue => issue.project)
            .sort((a, b) => rankIssue(b, skills, goal, completed.length) - rankIssue(a, skills, goal, completed.length))
            .slice(0, 15)
        if (!issues.length) {
            return res.status(200).json({ source: "skills", recommendations: [], message: "There are no open issues to recommend yet." })
        }

        const input = {
            skills,
            goal: goal.trim(),
            completedWork: completed.map(issue => ({ title: issue.title.slice(0, 160), difficulty: issue.difficulty, skills: cleanSkills(issue.requiredSkills) })),
            issues: issues.map(issue => ({
                id: issue._id.toString(),
                title: issue.title.slice(0, 160),
                description: issue.description.slice(0, 600),
                difficulty: issue.difficulty,
                requiredSkills: cleanSkills(issue.requiredSkills),
                project: issue.project.name.slice(0, 100),
                technologies: cleanSkills(issue.project.techStack)
            }))
        }
        const fingerprint = createHash("sha256").update(JSON.stringify({ input, updated: issues.map(issue => issue.updatedAt) })).digest("hex")
        const state = getState(req.user.userId)
        let result

        if (state.cache?.fingerprint === fingerprint && state.cache.expiresAt > Date.now()) {
            result = state.cache.result
        } else if (!process.env.GEMINI_API_KEY) {
            result = { source: "skills", recommendations: skillRecommendations(issues, skills), message: "Gemini is not configured yet. Showing skill-based suggestions." }
        } else if (state.inFlight || state.attempts >= 3) {
            result = { source: "skills", recommendations: skillRecommendations(issues, skills), message: "AI recommendations are temporarily limited. Showing skill-based suggestions." }
        } else {
            state.inFlight = true
            state.attempts += 1
            try {
                const data = await recommendWithGemini(input)
                const seen = new Set()
                const recommendations = []
                for (const item of Array.isArray(data.recommendations) ? data.recommendations : []) {
                    const issue = issues.find(issue => issue._id.toString() === item?.issueId)
                    if (!issue || seen.has(item.issueId) || typeof item.reason !== "string" || !item.reason.trim() || item.reason.length > 450 ||
                        typeof item.firstStep !== "string" || !item.firstStep.trim() || item.firstStep.length > 350) continue
                    seen.add(item.issueId)
                    recommendations.push(toRecommendation(issue, skills, item.reason.trim(), item.firstStep.trim()))
                    if (recommendations.length === 3) break
                }
                if (!recommendations.length) throw new Error("No valid issue recommendations")
                result = { source: "gemini", recommendations, message: "Suggestions based on your skills, goal, and recent contributions." }
            } catch (error) {
                const message = error.code === "GEMINI_QUOTA" ? "Gemini has reached its request limit. Showing skill-based suggestions." :
                    ["TimeoutError", "AbortError"].includes(error.name) ? "Gemini took too long to respond. Showing skill-based suggestions." :
                    "Gemini is temporarily unavailable. Showing skill-based suggestions."
                result = { source: "skills", recommendations: skillRecommendations(issues, skills), message }
            } finally {
                state.inFlight = false
            }
            state.cache = { fingerprint, result, expiresAt: Date.now() + (result.source === "gemini" ? 300000 : 30000) }
        }

        const available = await Issue.find({ _id: { $in: result.recommendations.map(item => item.issue._id) }, status: "open" })
            .select("_id").lean()
        const availableIds = new Set(available.map(issue => issue._id.toString()))
        const recommendations = result.recommendations.filter(item => availableIds.has(item.issue._id.toString()))
        return res.status(200).json({ ...result, recommendations,
            message: recommendations.length ? result.message : "Those issues are no longer open. Try again for updated suggestions." })
    } catch (error) {
        return res.status(500).json({ message: "Could not load issue recommendations. Please try again." })
    }
}
