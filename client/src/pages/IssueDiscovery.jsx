import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllIssues } from "../api/issue.api.js"

const IssueDiscovery = () => {
    const navigate = useNavigate()
    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchIssues() {
            try {
                const response = await getAllIssues()
                setIssues(response.data.issues)
            } catch (error) {
                setError(error.response?.data?.message || "Failed to load issues. Please try again.")
            } finally {
                setLoading(false)
            }
        }
        fetchIssues()
    }, [])

    return (
        <div className="min-h-screen bg-[#FFF8EE] px-6 py-8 md:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">
                <button type="button" className="mb-8 font-black hover:underline" onClick={() => navigate('/dashboard')}>← Back to dashboard</button>

                <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
                    <div>
                        <div className="mb-3 inline-block rounded-full border-2 border-black bg-[#FFD166] px-4 py-1 text-sm font-black shadow-[3px_3px_0px_#000]">CONTRIBUTE</div>
                        <h1 className="text-4xl font-black tracking-tight md:text-5xl">Explore Issues</h1>
                        <p className="mt-3 max-w-2xl font-medium text-gray-700">Browse contribution opportunities across campus projects.</p>
                    </div>
                    <button type="button" onClick={() => navigate('/projects')} className="rounded-xl border-2 border-black bg-white px-5 py-3 font-black shadow-[3px_3px_0px_#000]">Explore projects →</button>
                </div>

                {loading && <div className="rounded-2xl border-2 border-black bg-white p-6 font-black shadow-[5px_5px_0px_#000]">Loading issues...</div>}
                {error && <div className="rounded-2xl border-2 border-black bg-[#FF6B6B] p-6 font-bold shadow-[5px_5px_0px_#000]">{error}</div>}

                {!loading && !error && issues.length === 0 && (
                    <div className="rounded-3xl border-2 border-black bg-white p-10 text-center font-medium shadow-[6px_6px_0px_#000]">
                        No issues yet. Check back after a maintainer adds one.
                    </div>
                )}

                {!loading && !error && issues.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2">
                        {issues.map(issue => (
                            <article key={issue._id} className="rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000]">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="rounded-full border-2 border-black bg-[#FFD166] px-3 py-1 text-xs font-black uppercase">{issue.status}</span>
                                    <span className="rounded-full border-2 border-black bg-[#FFF8EE] px-3 py-1 text-xs font-black capitalize">{issue.difficulty}</span>
                                </div>
                                <h2 className="mt-5 text-2xl font-black">{issue.title}</h2>
                                <p className="mt-2 font-bold text-gray-600">{issue.project?.name || "Project unavailable"}</p>
                                <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-gray-600">{issue.description}</p>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {issue.requiredSkills.map(skill => (
                                        <span key={skill} className="rounded-lg border-2 border-black bg-[#FFD166] px-2.5 py-1 text-xs font-black">{skill}</span>
                                    ))}
                                </div>
                                {issue.project && (
                                    <button type="button" onClick={() => navigate(`/projects/${issue.project._id}/issues/${issue._id}`)} className="mt-6 w-full border-t-2 border-black pt-4 text-left font-black hover:underline">
                                        View issue →
                                    </button>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default IssueDiscovery
