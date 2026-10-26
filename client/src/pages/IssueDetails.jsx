import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { deleteIssue, getIssueDetails } from "../api/issue.api.js"
import { getProjectDetails } from "../api/project.api.js"
import { AuthContext } from "../context/AuthContext.jsx"

const IssueDetails = () => {
    const { projectId, issueId } = useParams()
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()
    const [project, setProject] = useState(null)
    const [issue, setIssue] = useState(null)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchIssue() {
            try {
                const [projectResponse, issueResponse] = await Promise.all([
                    getProjectDetails(projectId), getIssueDetails(projectId, issueId)
                ])
                setProject(projectResponse.data)
                setIssue(issueResponse.data)
            } catch (error) {
                setError(error.response?.data?.message || "Failed to load the issue")
            } finally {
                setLoading(false)
            }
        }
        fetchIssue()
    }, [projectId, issueId])

    async function handleDelete() {
        if (!window.confirm("Delete this issue? This cannot be undone.")) return
        try {
            setDeleting(true)
            setError("")
            await deleteIssue(projectId, issueId)
            navigate(`/projects/${projectId}`)
        } catch (error) {
            setError(error.response?.data?.message || "Failed to delete the issue. Please try again.")
        } finally {
            setDeleting(false)
        }
    }

    const ownerId = project?.owner?._id || project?.owner
    const canManage = user?.role === "admin" || ownerId === user?._id

    return (
        <div className="min-h-screen bg-[#FFF8EE] px-6 py-8 md:px-10 lg:px-16">
            <div className="mx-auto max-w-4xl">
                <button type="button" className="mb-8 font-black hover:underline" onClick={() => navigate(`/projects/${projectId}`)}>
                    ← Back to project
                </button>

                {loading && <p className="font-bold">Loading issue...</p>}
                {error && <div className="mb-6 rounded-xl border-2 border-black bg-[#FF6B6B] p-4 font-bold">{error}</div>}

                {!loading && issue && project && (
                    <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[7px_7px_0px_#000] md:p-8">
                        <div className="mb-5 flex flex-wrap gap-2">
                            <span className="rounded-full border-2 border-black bg-[#FFD166] px-4 py-1 text-sm font-black uppercase">{issue.status}</span>
                            <span className="rounded-full border-2 border-black bg-[#FFF8EE] px-4 py-1 text-sm font-black capitalize">{issue.difficulty}</span>
                        </div>

                        <h1 className="text-4xl font-black tracking-tight md:text-5xl">{issue.title}</h1>
                        <p className="mt-3 font-medium text-gray-600">In {project.name}</p>
                        <p className="mt-6 whitespace-pre-wrap text-base font-medium leading-7 text-gray-700 md:text-lg">{issue.description}</p>

                        <div className="mt-8 border-t-2 border-black pt-6">
                            <h2 className="mb-3 text-sm font-black uppercase tracking-wide">Required skills</h2>
                            {issue.requiredSkills.length === 0 ? (
                                <p className="font-medium text-gray-600">No specific skills required.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {issue.requiredSkills.map(skill => (
                                        <span key={skill} className="rounded-lg border-2 border-black bg-[#FFD166] px-3 py-1.5 text-sm font-black">{skill}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {canManage && (
                            <div className="mt-8 flex flex-wrap gap-3 border-t-2 border-black pt-6">
                                <button type="button" onClick={() => navigate(`/projects/${projectId}/issues/${issueId}/edit`)} className="rounded-xl border-2 border-black bg-[#FFD166] px-5 py-2 font-black shadow-[3px_3px_0px_#000]">Edit Issue</button>
                                <button type="button" disabled={deleting} onClick={handleDelete} className="rounded-xl border-2 border-black bg-white px-5 py-2 font-black shadow-[3px_3px_0px_#000] disabled:opacity-50">
                                    {deleting ? "Deleting..." : "Delete Issue"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default IssueDetails
