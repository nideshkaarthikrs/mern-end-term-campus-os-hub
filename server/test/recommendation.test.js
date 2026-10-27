import test, { afterEach } from "node:test"
import assert from "node:assert/strict"
import mongoose from "mongoose"
import User from "../src/models/user.model.js"
import Issue from "../src/models/issue.model.js"
import { getIssueRecommendations } from "../src/controllers/recommendation.controllers.js"

const originals = { userFindById: User.findById, issueFind: Issue.find, fetch: globalThis.fetch }
const originalKey = process.env.GEMINI_API_KEY
const originalModel = process.env.GEMINI_MODEL

afterEach(() => {
    User.findById = originals.userFindById
    Issue.find = originals.issueFind
    globalThis.fetch = originals.fetch
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY
    else process.env.GEMINI_API_KEY = originalKey
    if (originalModel === undefined) delete process.env.GEMINI_MODEL
    else process.env.GEMINI_MODEL = originalModel
})

const response = () => ({
    code: 200,
    status(code) { this.code = code; return this },
    json(body) { this.body = body; return this }
})

const setup = (skills = ["React"]) => {
    process.env.GEMINI_API_KEY = "fake-test-key"
    delete process.env.GEMINI_MODEL
    const project = { _id: new mongoose.Types.ObjectId(), name: "Campus Hub", techStack: ["React", "Node.js"] }
    const issues = [
        { _id: new mongoose.Types.ObjectId(), title: "Fix React mobile navigation", description: "Improve React and CSS navigation", difficulty: "beginner", requiredSkills: ["React", "CSS"], project, updatedAt: new Date() },
        { _id: new mongoose.Types.ObjectId(), title: "Improve API validation", description: "Validate API input", difficulty: "intermediate", requiredSkills: ["Node.js"], project, updatedAt: new Date() },
        { _id: new mongoose.Types.ObjectId(), title: "Document setup", description: "Write a setup guide", difficulty: "beginner", requiredSkills: ["Markdown"], project, updatedAt: new Date() }
    ]
    const context = { skills, issues, available: issues, completed: [], userExists: true }
    User.findById = () => ({ select: async fields => {
        assert.equal(fields, "skills")
        return context.userExists ? { skills: context.skills, name: "Private Name", email: "private@example.com", password: "private-hash" } : null
    } })
    Issue.find = query => ({
        select() { return this },
        populate() { return this },
        sort() { return this },
        limit() { return this },
        async lean() {
            if (query._id) return context.available.filter(issue => query._id.$in.some(id => id.toString() === issue._id.toString()))
            return query.status === "completed" ? context.completed : context.issues
        }
    })
    context.req = { user: { userId: new mongoose.Types.ObjectId().toString(), role: "student" }, body: { goal: "Practise React and CSS" } }
    return context
}

const suggestion = issue => ({ issueId: issue._id.toString(), reason: "Your React skills match this UI task.", firstStep: "Review the issue and reproduce the navigation problem." })
const geminiResponse = items => ({ ok: true, async json() {
    return { candidates: [{ finishReason: "STOP", content: { parts: [{ text: JSON.stringify({ recommendations: items }) }] } }] }
} })

test("recommendations reject invalid goals and ask new students for skills or a goal", async () => {
    const context = setup([])
    for (const goal of [{ $ne: "" }, "a".repeat(501), 123]) {
        const res = response()
        await getIssueRecommendations({ ...context.req, body: { goal } }, res)
        assert.equal(res.code, 400)
    }
    const res = response()
    await getIssueRecommendations({ ...context.req, body: {} }, res)
    assert.equal(res.code, 400)
    assert.match(res.body.message, /Add skills/)
})

test("recommendations handle deleted accounts and empty open-issue lists without calling Gemini", async () => {
    const context = setup()
    globalThis.fetch = async () => assert.fail("Gemini should not be called")
    context.userExists = false
    let res = response()
    await getIssueRecommendations(context.req, res)
    assert.equal(res.code, 404)
    context.userExists = true
    context.issues = []
    res = response()
    await getIssueRecommendations(context.req, res)
    assert.equal(res.code, 200)
    assert.deepEqual(res.body.recommendations, [])
})

test("missing Gemini configuration returns explicitly labelled skill matches and real learning gaps", async () => {
    const context = setup()
    delete process.env.GEMINI_API_KEY
    globalThis.fetch = async () => assert.fail("Gemini should not be called")
    const res = response()
    await getIssueRecommendations(context.req, res)
    assert.equal(res.code, 200)
    assert.equal(res.body.source, "skills")
    assert.equal(res.body.recommendations[0].issue._id, context.issues[0]._id)
    assert.deepEqual(res.body.recommendations[0].matchedSkills, ["React"])
    assert.deepEqual(res.body.recommendations[0].skillsToLearn, ["CSS"])
    assert.match(res.body.message, /not configured/)
})

test("Gemini receives bounded issue data and no account identity or credentials", async () => {
    const context = setup()
    context.completed = [{ title: "Earlier contribution", difficulty: "beginner", requiredSkills: ["React"] }]
    globalThis.fetch = async (url, options) => {
        assert.match(url, /models\/gemini-3\.5-flash-lite:generateContent$/)
        assert.equal(options.headers["x-goog-api-key"], "fake-test-key")
        const body = JSON.parse(options.body)
        assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, "MINIMAL")
        const input = JSON.parse(body.contents[0].parts[0].text)
        assert.deepEqual(input.skills, ["React"])
        assert.equal(input.completedWork[0].title, "Earlier contribution")
        assert.ok(input.issues.length <= 15)
        assert.ok(input.issues.every(issue => issue.description.length <= 800))
        assert.equal(JSON.stringify(body).includes("private@example.com"), false)
        assert.equal(JSON.stringify(body).includes("Private Name"), false)
        assert.equal(JSON.stringify(body).includes("private-hash"), false)
        assert.equal(JSON.stringify(body).includes("fake-test-key"), false)
        assert.deepEqual(body.generationConfig.responseJsonSchema.properties.recommendations.items.properties.issueId.enum.sort(), context.issues.map(issue => issue._id.toString()).sort())
        return geminiResponse([suggestion(context.issues[0])])
    }
    const res = response()
    await getIssueRecommendations(context.req, res)
    assert.equal(res.code, 200)
    assert.equal(res.body.source, "gemini")
    assert.equal(res.body.recommendations[0].issue.title, context.issues[0].title)
})

test("invented issue IDs, duplicate suggestions, and invalid text are discarded", async () => {
    const context = setup()
    globalThis.fetch = async () => geminiResponse([
        { ...suggestion(context.issues[0]), issueId: new mongoose.Types.ObjectId().toString() },
        suggestion(context.issues[0]),
        suggestion(context.issues[0]),
        { ...suggestion(context.issues[1]), reason: "x".repeat(451) }
    ])
    const res = response()
    await getIssueRecommendations(context.req, res)
    assert.equal(res.body.source, "gemini")
    assert.equal(res.body.recommendations.length, 1)
    assert.equal(res.body.recommendations[0].issue._id, context.issues[0]._id)
})

test("issues claimed during a Gemini request are removed before the response", async () => {
    const context = setup()
    globalThis.fetch = async () => {
        context.available = []
        return geminiResponse([suggestion(context.issues[0])])
    }
    const res = response()
    await getIssueRecommendations(context.req, res)
    assert.equal(res.code, 200)
    assert.deepEqual(res.body.recommendations, [])
    assert.match(res.body.message, /no longer open/)
})

test("cached suggestions avoid another model request and profile or goal changes invalidate the cache", async () => {
    const context = setup()
    let calls = 0
    globalThis.fetch = async () => { calls += 1; return geminiResponse([suggestion(context.issues[0])]) }
    await getIssueRecommendations(context.req, response())
    await getIssueRecommendations(context.req, response())
    assert.equal(calls, 1)
    context.req.body.goal = "Practise CSS"
    await getIssueRecommendations(context.req, response())
    assert.equal(calls, 2)
    context.skills.push("CSS")
    await getIssueRecommendations(context.req, response())
    assert.equal(calls, 3)
    context.req.body.goal = "Practise backend APIs"
    const limited = response()
    await getIssueRecommendations(context.req, limited)
    assert.equal(calls, 3)
    assert.equal(limited.body.source, "skills")
    assert.match(limited.body.message, /temporarily limited/)
    await getIssueRecommendations({ ...context.req, user: { userId: new mongoose.Types.ObjectId().toString(), role: "student" } }, response())
    assert.equal(calls, 4)
})

test("quota errors, timeouts, malformed output, and blocked responses use honest fallbacks", async () => {
    const cases = [
        [async () => ({ ok: false, status: 429 }), /request limit/],
        [async () => { throw Object.assign(new Error("private upstream details"), { name: "TimeoutError" }) }, /too long/],
        [async () => ({ ok: true, json: async () => ({ candidates: [{ finishReason: "STOP", content: { parts: [{ text: "invalid-json" }] } }] }) }), /temporarily unavailable/],
        [async () => ({ ok: true, json: async () => ({ candidates: [{ finishReason: "SAFETY" }] }) }), /temporarily unavailable/],
        [async () => geminiResponse([{ issueId: "invented", reason: "fake", firstStep: "fake" }]), /temporarily unavailable/]
    ]
    for (const [fetch, message] of cases) {
        const context = setup()
        globalThis.fetch = fetch
        const res = response()
        await getIssueRecommendations(context.req, res)
        assert.equal(res.code, 200)
        assert.equal(res.body.source, "skills")
        assert.match(res.body.message, message)
        assert.ok(res.body.recommendations.length > 0)
        assert.equal(JSON.stringify(res.body).includes("private upstream details"), false)
    }
})

test("concurrent recommendation requests do not trigger duplicate Gemini calls", async () => {
    const context = setup()
    let release
    const waiting = new Promise(resolve => { release = resolve })
    let started
    const called = new Promise(resolve => { started = resolve })
    let calls = 0
    globalThis.fetch = async () => {
        calls += 1
        started()
        await waiting
        return geminiResponse([suggestion(context.issues[0])])
    }
    const first = response()
    const pending = getIssueRecommendations(context.req, first)
    await called
    const second = response()
    await getIssueRecommendations(context.req, second)
    assert.equal(second.body.source, "skills")
    release()
    await pending
    assert.equal(calls, 1)
    assert.equal(first.body.source, "gemini")
})

test("database failures return a safe error response", async () => {
    const context = setup()
    User.findById = () => ({ select: async () => { throw new Error("private database details") } })
    const res = response()
    await getIssueRecommendations(context.req, res)
    assert.equal(res.code, 500)
    assert.equal(JSON.stringify(res.body).includes("private database details"), false)
})
