import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getIssueDetails, updateIssue } from "../api/issue.api.js"
import { getProjectDetails } from "../api/project.api.js"
import { AuthContext } from "../context/AuthContext.jsx"

const EditIssue = () => {
    const { projectId, issueId } = useParams()
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()
    const [project, setProject] = useState(null)
    const [issue, setIssue] = useState(null)
    const [formData, setFormData] = useState({ title: "", description: "", difficulty: "beginner", requiredSkills: "", status: "open" })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchIssue() {
            try {
                const [projectResponse, issueResponse] = await Promise.all([
                    getProjectDetails(projectId), getIssueDetails(projectId, issueId)
                ])
                setProject(projectResponse.data)
                setIssue(issueResponse.data)
                setFormData({
                    title: issueResponse.data.title,
                    description: issueResponse.data.description,
                    difficulty: issueResponse.data.difficulty,
                    requiredSkills: issueResponse.data.requiredSkills.join(", "),
                    status: issueResponse.data.status
                })
            } catch (error) {
                setError(error.response?.data?.message || "Failed to load the issue")
            } finally {
                setLoading(false)
            }
        }
        fetchIssue()
    }, [projectId, issueId])

    function handleForm(e) {
        setFormData(prevData => ({ ...prevData, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        const issueData = {
            title: formData.title,
            description: formData.description,
            difficulty: formData.difficulty,
            requiredSkills: formData.requiredSkills.split(",").map(skill => skill.trim()).filter(Boolean),
            status: formData.status
        }
        try {
            setSaving(true)
            await updateIssue(projectId, issueId, issueData)
            navigate(`/projects/${projectId}/issues/${issueId}`)
        } catch (error) {
            setError(error.response?.data?.message || "Failed to update issue. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const ownerId = project?.owner?._id || project?.owner
    const canManage = user?.role === "admin" || ownerId === user?._id

    return (
        <div className="min-h-screen bg-[#FFF8EE] px-6 py-10 md:px-10 lg:px-16">
            <div className="mx-auto max-w-3xl">
                <button type="button" className="mb-8 font-black hover:underline" onClick={() => navigate(`/projects/${projectId}/issues/${issueId}`)}>
                    ← Back to issue
                </button>

                <div className="mb-8">
                    <div className="mb-3 inline-block rounded-full border-2 border-black bg-[#FFD166] px-4 py-1 text-sm font-black shadow-[3px_3px_0px_#000]">EDIT ISSUE</div>
                    <h1 className="text-4xl font-black tracking-tight md:text-5xl">Update this issue.</h1>
                    {project && <p className="mt-3 text-lg font-medium text-gray-700">For {project.name}</p>}
                </div>

                {loading && <p className="font-bold">Loading issue...</p>}
                {error && <div className="mb-6 rounded-xl border-2 border-black bg-[#FF6B6B] p-4 font-bold">{error}</div>}
                {!loading && project && issue && !canManage && <p className="font-bold">You are not authorized to edit this issue.</p>}

                {!loading && project && issue && canManage && (
                    <form onSubmit={handleSubmit} className="rounded-3xl border-2 border-black bg-white p-6 shadow-[7px_7px_0px_#000] md:p-8">
                        <div className="mb-6">
                            <label htmlFor="title" className="mb-2 block text-sm font-black">Issue title</label>
                            <input id="title" name="title" type="text" required value={formData.title} onChange={handleForm} className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none" />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="description" className="mb-2 block text-sm font-black">Description</label>
                            <textarea id="description" name="description" rows="6" required value={formData.description} onChange={handleForm} className="w-full resize-none rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none" />
                        </div>
                        <div className="mb-6 grid gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="difficulty" className="mb-2 block text-sm font-black">Difficulty</label>
                                <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleForm} className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none">
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="status" className="mb-2 block text-sm font-black">Status</label>
                                <select id="status" name="status" value={formData.status} onChange={handleForm} className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none">
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-8">
                            <label htmlFor="requiredSkills" className="mb-2 block text-sm font-black">Required skills</label>
                            <input id="requiredSkills" name="requiredSkills" type="text" value={formData.requiredSkills} onChange={handleForm} className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none" />
                            <p className="mt-2 text-sm font-medium text-gray-500">Separate skills with commas. Leave blank if none are required.</p>
                        </div>
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => navigate(`/projects/${projectId}/issues/${issueId}`)} className="rounded-xl border-2 border-black bg-white px-6 py-3 font-black shadow-[3px_3px_0px_#000]">Cancel</button>
                            <button type="submit" disabled={saving} className="rounded-xl border-2 border-black bg-[#FF6B6B] px-6 py-3 font-black shadow-[4px_4px_0px_#000] disabled:opacity-50">
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default EditIssue
