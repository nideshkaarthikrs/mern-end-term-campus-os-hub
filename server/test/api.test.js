import test, { afterEach } from "node:test"
import assert from "node:assert/strict"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../src/models/user.model.js"
import Project from "../src/models/project.model.js"
import Issue from "../src/models/issue.model.js"
import { authMiddleware } from "../src/middlewares/auth.middleware.js"
import { requireRole } from "../src/middlewares/role.middleware.js"
import { registrationController, loginController, userController, logoutController, updateUserController } from "../src/controllers/auth.controllers.js"
import { createProject, getProjects, getProjectDetails, updateProject, deleteProject } from "../src/controllers/project.controllers.js"
import { createIssue, getAllIssues, updateIssue, deleteIssue, claimIssue, unclaimIssue, completeIssue } from "../src/controllers/issue.controllers.js"

process.env.JWT_SECRET = "test-secret"

const userId = new mongoose.Types.ObjectId()
const projectId = new mongoose.Types.ObjectId()
const issueId = new mongoose.Types.ObjectId()
const otherId = new mongoose.Types.ObjectId()

const originals = {
    userFindById: User.findById,
    userFindOne: User.findOne,
    userCreate: User.create,
    userUpdateOne: User.updateOne,
    userFindByIdAndUpdate: User.findByIdAndUpdate,
    projectFindById: Project.findById,
    projectFind: Project.find,
    projectDistinct: Project.distinct,
    projectCreate: Project.create,
    projectFindByIdAndUpdate: Project.findByIdAndUpdate,
    projectFindByIdAndDelete: Project.findByIdAndDelete,
    issueFindOne: Issue.findOne,
    issueFind: Issue.find,
    issueFindOneAndUpdate: Issue.findOneAndUpdate,
    issueFindOneAndDelete: Issue.findOneAndDelete,
    issueCreate: Issue.create,
    issueExists: Issue.exists,
    issueDeleteMany: Issue.deleteMany
}

afterEach(() => {
    User.findById = originals.userFindById
    User.findOne = originals.userFindOne
    User.create = originals.userCreate
    User.updateOne = originals.userUpdateOne
    User.findByIdAndUpdate = originals.userFindByIdAndUpdate
    Project.findById = originals.projectFindById
    Project.find = originals.projectFind
    Project.distinct = originals.projectDistinct
    Project.create = originals.projectCreate
    Project.findByIdAndUpdate = originals.projectFindByIdAndUpdate
    Project.findByIdAndDelete = originals.projectFindByIdAndDelete
    Issue.findOne = originals.issueFindOne
    Issue.find = originals.issueFind
    Issue.findOneAndUpdate = originals.issueFindOneAndUpdate
    Issue.findOneAndDelete = originals.issueFindOneAndDelete
    Issue.create = originals.issueCreate
    Issue.exists = originals.issueExists
    Issue.deleteMany = originals.issueDeleteMany
})

const response = () => ({
    code: 200,
    status(code) { this.code = code; return this },
    json(body) { this.body = body; return this },
    send(body) { this.body = body; return this },
    cookie(name, value, options) { this.cookieData = { name, value, options }; return this },
    clearCookie(name, options) { this.clearedCookie = { name, options }; return this }
})

const projectData = {
    name: "Campus Hub",
    description: "An open source project",
    repositoryUrl: "https://github.com/example/hub",
    techStack: ["React"]
}

const issueData = {
    title: "Fix navigation",
    description: "Repair the navigation links",
    difficulty: "beginner",
    requiredSkills: ["React"]
}

test("authentication rejects missing, invalid, and deleted accounts", async () => {
    let res = response()
    await authMiddleware({ cookies: {} }, res, () => assert.fail("must not continue"))
    assert.equal(res.code, 401)

    res = response()
    await authMiddleware({ cookies: { token: "invalid" } }, res, () => assert.fail("must not continue"))
    assert.equal(res.code, 401)

    User.findById = () => ({ select: async () => null })
    res = response()
    await authMiddleware({ cookies: { token: jwt.sign({ userId }, process.env.JWT_SECRET) } }, res, () => assert.fail("must not continue"))
    assert.equal(res.code, 401)
})

test("authentication uses the current database role and reports database failures", async () => {
    const req = { cookies: { token: jwt.sign({ userId, role: "admin" }, process.env.JWT_SECRET) } }
    User.findById = () => ({ select: async () => ({ _id: userId, role: "student" }) })
    let called = false
    await authMiddleware(req, response(), () => { called = true })
    assert.equal(called, true)
    assert.deepEqual(req.user, { userId: userId.toString(), role: "student" })

    const res = response()
    User.findById = () => ({ select: async () => { throw new Error("database unavailable") } })
    await authMiddleware(req, res, () => assert.fail("must not continue"))
    assert.equal(res.code, 500)
})

test("role middleware blocks users without the required role", () => {
    let res = response()
    requireRole("maintainer")({ user: { role: "student" } }, res, () => assert.fail("must not continue"))
    assert.equal(res.code, 403)
    let called = false
    res = response()
    requireRole("student")({ user: { role: "student" } }, res, () => { called = true })
    assert.equal(called, true)
})

test("registration validates input, hashes passwords, and handles duplicate emails", async () => {
    let res = response()
    await registrationController({ body: undefined }, res)
    assert.equal(res.code, 400)

    res = response()
    await registrationController({ body: { name: "A", email: "a@example.com", password: "password123", role: "admin" } }, res)
    assert.equal(res.code, 400)

    res = response()
    await registrationController({ body: { name: "A", email: "a@example.com", password: "a".repeat(73) } }, res)
    assert.equal(res.code, 400)

    User.findOne = async () => null
    User.create = async data => ({ _id: userId, ...data })
    res = response()
    await registrationController({ body: { name: " Alice ", email: "ALICE@example.com", password: "password123", role: "student" } }, res)
    assert.equal(res.code, 201)
    assert.equal(res.cookieData.options.httpOnly, true)
    assert.equal(res.cookieData.options.secure, process.env.NODE_ENV === "production")
    assert.equal(jwt.verify(res.cookieData.value, process.env.JWT_SECRET).userId, userId.toString())

    User.create = async () => { throw Object.assign(new Error("duplicate"), { code: 11000 }) }
    res = response()
    await registrationController({ body: { name: "Alice", email: "alice@example.com", password: "password123" } }, res)
    assert.equal(res.code, 409)
})

test("login rejects bad passwords and sets an HTTP-only cookie", async () => {
    assert.equal(User.schema.path("password").options.select, false)
    const hash = await bcrypt.hash("password123", 4)
    User.findOne = () => ({ select: async field => {
        assert.equal(field, "+password")
        return { _id: userId, role: "student", password: hash }
    } })
    let res = response()
    await loginController({ body: undefined }, res)
    assert.equal(res.code, 400)

    res = response()
    await loginController({ body: { email: "alice@example.com", password: "a".repeat(73) } }, res)
    assert.equal(res.code, 400)

    res = response()
    await loginController({ body: { email: "alice@example.com", password: "wrongpass" } }, res)
    assert.equal(res.code, 401)

    res = response()
    await loginController({ body: { email: "alice@example.com", password: "password123" } }, res)
    assert.equal(res.code, 200)
    assert.equal(res.cookieData.options.httpOnly, true)
    assert.equal(jwt.verify(res.cookieData.value, process.env.JWT_SECRET).userId, userId.toString())

    res = response()
    logoutController({}, res)
    assert.equal(res.clearedCookie.name, "token")
})

test("production cookies require HTTPS and retain SameSite protection", () => {
    const previous = process.env.NODE_ENV
    process.env.NODE_ENV = "production"
    try {
        const res = response()
        logoutController({}, res)
        assert.equal(res.clearedCookie.options.secure, true)
        assert.equal(res.clearedCookie.options.sameSite, "lax")
    } finally {
        if (previous === undefined) delete process.env.NODE_ENV
        else process.env.NODE_ENV = previous
    }
})

test("the current-user response does not include the password", async () => {
    User.findOne = () => ({ select: async field => {
        assert.equal(field, "-password")
        return { _id: userId, name: "Alice" }
    } })
    const res = response()
    await userController({ user: { userId: userId.toString() } }, res)
    assert.equal(res.code, 200)
    assert.equal(res.body.password, undefined)
})

test("profile update rejects invalid skills and excludes the password", async () => {
    let res = response()
    await updateUserController({ user: { userId: userId.toString() }, body: { name: "Alice", bio: "", skills: [123] } }, res)
    assert.equal(res.code, 400)

    let update
    User.findByIdAndUpdate = (id, data) => {
        update = { id, data }
        return { select: async field => {
            assert.equal(field, "-password")
            return { _id: userId, ...data }
        } }
    }
    res = response()
    await updateUserController({ user: { userId: userId.toString() }, body: { name: " Alice ", bio: " Hi ", skills: [" React "] } }, res)
    assert.equal(res.code, 200)
    assert.deepEqual(update.data, { name: "Alice", bio: "Hi", skills: ["React"] })
    assert.equal(res.body.password, undefined)
})

test("project creation validates input and update enforces ownership", async () => {
    Project.create = async data => ({ _id: projectId, ...data })
    let res = response()
    await createProject({ user: { userId: userId.toString() }, body: { ...projectData, techStack: [""] } }, res)
    assert.equal(res.code, 400)

    res = response()
    await createProject({ user: { userId: userId.toString() }, body: projectData }, res)
    assert.equal(res.code, 201)
    assert.equal(res.body.owner, userId.toString())

    Project.findById = async () => ({ _id: projectId, owner: otherId })
    res = response()
    await updateProject({ user: { userId: userId.toString(), role: "maintainer" }, params: { projectId: projectId.toString() }, body: projectData }, res)
    assert.equal(res.code, 403)
})

test("project deletion keeps projects with claimed issues", async () => {
    Project.findById = async () => ({ _id: projectId, owner: userId })
    Issue.exists = async () => ({ _id: issueId })
    Project.findByIdAndDelete = async () => assert.fail("project must remain")
    const res = response()
    await deleteProject({ user: { userId: userId.toString(), role: "maintainer" }, params: { projectId: projectId.toString() } }, res)
    assert.equal(res.code, 409)
})

test("project search, details, update, and deletion handle valid and invalid requests", async () => {
    let searchQuery
    Project.find = query => {
        searchQuery = query
        return { populate: async () => [] }
    }
    let res = response()
    await getProjects({ query: { search: "C++", technology: "React" } }, res)
    assert.equal(res.code, 200)
    assert.equal(searchQuery.$or[0].name.test("C++ project"), true)
    assert.equal(searchQuery.$or[0].name.test("C-- project"), false)
    assert.equal(searchQuery.techStack.test("react"), true)

    res = response()
    await getProjects({ query: { search: { $ne: "" } } }, res)
    assert.equal(res.code, 400)

    Project.find = () => { throw new Error("database unavailable") }
    res = response()
    await getProjects({ query: {} }, res)
    assert.equal(res.code, 500)
    assert.equal(res.body.message, "Internal server error")

    res = response()
    await getProjectDetails({ params: { projectId: "invalid" } }, res)
    assert.equal(res.code, 400)

    Project.findById = async () => ({ _id: projectId, owner: userId })
    Project.findByIdAndUpdate = async (id, data) => ({ _id: id, ...data, populate: async () => {} })
    res = response()
    await updateProject({ user: { userId: userId.toString(), role: "maintainer" }, params: { projectId: projectId.toString() }, body: projectData }, res)
    assert.equal(res.code, 200)
    assert.equal(res.body.name, projectData.name)

    Issue.exists = async () => null
    Issue.deleteMany = async () => ({ deletedCount: 1 })
    Project.findByIdAndDelete = async () => ({ _id: projectId })
    res = response()
    await deleteProject({ user: { userId: userId.toString(), role: "maintainer" }, params: { projectId: projectId.toString() } }, res)
    assert.equal(res.code, 200)
})

test("issue creation requires project ownership and valid fields", async () => {
    Project.findById = async () => ({ _id: projectId, owner: otherId })
    let res = response()
    await createIssue({ user: { userId: userId.toString(), role: "maintainer" }, params: { projectId: projectId.toString() }, body: issueData }, res)
    assert.equal(res.code, 403)

    Project.findById = async () => ({ _id: projectId, owner: userId })
    res = response()
    await createIssue({ user: { userId: userId.toString(), role: "maintainer" }, params: { projectId: projectId.toString() }, body: { ...issueData, difficulty: "expert" } }, res)
    assert.equal(res.code, 400)

    Issue.create = async data => ({ _id: issueId, ...data })
    res = response()
    await createIssue({ user: { userId: userId.toString(), role: "maintainer" }, params: { projectId: projectId.toString() }, body: issueData }, res)
    assert.equal(res.code, 201)
    assert.equal(res.body.project, projectId)
})

test("issue search, update, and deletion enforce filters and issue state", async () => {
    const project = { _id: projectId, owner: userId }
    Project.findById = async () => project
    Project.distinct = async () => [projectId]
    let searchQuery
    Issue.find = query => {
        searchQuery = query
        return { populate() { return this }, sort: async () => [] }
    }
    let res = response()
    await getAllIssues({ query: { search: "bug", technology: "React", difficulty: "beginner", skill: "C++", status: "open" } }, res)
    assert.equal(res.code, 200)
    assert.equal(searchQuery.status, "open")
    assert.equal(searchQuery.difficulty, "beginner")
    assert.equal(searchQuery.requiredSkills.test("C++"), true)
    assert.equal(searchQuery.requiredSkills.test("C--"), false)
    assert.deepEqual(searchQuery.project.$in, [projectId])

    res = response()
    await getAllIssues({ query: { status: "invalid" } }, res)
    assert.equal(res.code, 400)

    Issue.findOne = async () => ({ _id: issueId, status: "claimed" })
    res = response()
    await updateIssue({ user: { userId: userId.toString(), role: "maintainer" }, params: { projectId: projectId.toString(), issueId: issueId.toString() }, body: { ...issueData, status: "open" } }, res)
    assert.equal(res.code, 409)

    Issue.findOne = async () => ({ _id: issueId, status: "open" })
    Issue.findOneAndUpdate = async (query, data) => ({ _id: issueId, ...data })
    res = response()
    await updateIssue({ user: { userId: userId.toString(), role: "maintainer" }, params: { projectId: projectId.toString(), issueId: issueId.toString() }, body: { ...issueData, status: "closed" } }, res)
    assert.equal(res.code, 200)
    assert.equal(res.body.status, "closed")

    Issue.findOneAndDelete = async () => ({ _id: issueId })
    res = response()
    await deleteIssue({ user: { userId: userId.toString(), role: "maintainer" }, params: { projectId: projectId.toString(), issueId: issueId.toString() } }, res)
    assert.equal(res.code, 200)
})

test("claim, unclaim, and completion follow the issue state", async () => {
    const issue = { _id: issueId, project: projectId, status: "open", claimedBy: null }
    Project.findById = async () => ({ _id: projectId, owner: otherId })
    Issue.findOne = async () => issue
    User.findById = async () => ({ _id: userId, role: "student" })
    Issue.findOneAndUpdate = async (query, update) => {
        if (issue.status !== query.status) return null
        if (update.$set) {
            Object.assign(issue, update.$set)
            issue.claimedBy = null
        } else {
            Object.assign(issue, update)
        }
        return issue
    }
    let res = response()
    await claimIssue({ user: { userId: userId.toString(), role: "student" }, params: { projectId: projectId.toString(), issueId: issueId.toString() } }, res)
    assert.equal(res.code, 200)
    assert.equal(issue.status, "claimed")
    assert.equal(issue.claimedBy, userId)

    res = response()
    await unclaimIssue({ user: { userId: otherId.toString(), role: "student" }, params: { projectId: projectId.toString(), issueId: issueId.toString() } }, res)
    assert.equal(res.code, 403)

    res = response()
    await unclaimIssue({ user: { userId: userId.toString(), role: "student" }, params: { projectId: projectId.toString(), issueId: issueId.toString() } }, res)
    assert.equal(res.code, 200)
    assert.equal(issue.status, "open")

    await claimIssue({ user: { userId: userId.toString(), role: "student" }, params: { projectId: projectId.toString(), issueId: issueId.toString() } }, response())
    let contributionUpdate
    User.updateOne = async (query, update) => { contributionUpdate = { query, update } }
    res = response()
    await completeIssue({ user: { userId: otherId.toString(), role: "maintainer" }, params: { projectId: projectId.toString(), issueId: issueId.toString() } }, res)
    assert.equal(res.code, 200)
    assert.equal(issue.status, "completed")
    assert.equal(contributionUpdate.update.$addToSet.completedContributions, issueId)

    res = response()
    await claimIssue({ user: { userId: userId.toString(), role: "student" }, params: { projectId: projectId.toString(), issueId: issueId.toString() } }, res)
    assert.equal(res.code, 409)
})
