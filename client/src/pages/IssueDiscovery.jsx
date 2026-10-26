import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getAllIssues } from "../api/issue.api.js"

const emptyFilters = { search: "", technology: "", difficulty: "", skill: "", status: "" }

const IssueDiscovery = () => {
    const navigate = useNavigate()
    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [filters, setFilters] = useState(emptyFilters)
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
    const hasFilters = Object.values(appliedFilters).some(value => value.trim())

    useEffect(() => {
        let active = true
        async function fetchIssues() {
            try {
                const response = await getAllIssues(appliedFilters)
                if (active) setIssues(response.data.issues)
            } catch (error) {
                if (active) setError(error.response?.data?.message || "Failed to load issues. Please try again.")
            } finally {
                if (active) setLoading(false)
            }
        }
        fetchIssues()
        return () => { active = false }
    }, [appliedFilters])

    const applyFilters = event => {
        event.preventDefault()
        setError("")
        setLoading(true)
        setAppliedFilters({ ...filters })
    }

    const clearFilters = () => {
        setFilters(emptyFilters)
        setError("")
        setLoading(true)
        setAppliedFilters({ ...emptyFilters })
    }

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

                <form onSubmit={applyFilters} className="mb-8 rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0px_#000]">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <label className="text-sm font-black">Search issues
                            <input type="search" value={filters.search} onChange={event => setFilters({ ...filters, search: event.target.value })} placeholder="Title, description, or project" maxLength={100} className="mt-2 w-full rounded-xl border-2 border-black px-3 py-2 font-medium" />
                        </label>
                        <label className="text-sm font-black">Technology
                            <input type="search" value={filters.technology} onChange={event => setFilters({ ...filters, technology: event.target.value })} placeholder="e.g. React" maxLength={100} className="mt-2 w-full rounded-xl border-2 border-black px-3 py-2 font-medium" />
                        </label>
                        <label className="text-sm font-black">Required skill
                            <input type="search" value={filters.skill} onChange={event => setFilters({ ...filters, skill: event.target.value })} placeholder="e.g. JavaScript" maxLength={100} className="mt-2 w-full rounded-xl border-2 border-black px-3 py-2 font-medium" />
                        </label>
                        <label className="text-sm font-black">Difficulty
                            <select value={filters.difficulty} onChange={event => setFilters({ ...filters, difficulty: event.target.value })} className="mt-2 w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-medium">
                                <option value="">Any difficulty</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </label>
                        <label className="text-sm font-black">Status
                            <select value={filters.status} onChange={event => setFilters({ ...filters, status: event.target.value })} className="mt-2 w-full rounded-xl border-2 border-black bg-white px-3 py-2 font-medium">
                                <option value="">Any status</option>
                                <option value="open">Open</option>
                                <option value="claimed">Claimed</option>
                                <option value="completed">Completed</option>
                                <option value="closed">Closed</option>
                            </select>
                        </label>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button type="submit" className="rounded-xl border-2 border-black bg-[#FFD166] px-5 py-2 font-black shadow-[3px_3px_0px_#000]">Find issues</button>
                        <button type="button" onClick={clearFilters} className="rounded-xl border-2 border-black bg-white px-5 py-2 font-black">Clear filters</button>
                    </div>
                </form>

                {loading && <div className="rounded-2xl border-2 border-black bg-white p-6 font-black shadow-[5px_5px_0px_#000]">Loading issues...</div>}
                {error && <div className="rounded-2xl border-2 border-black bg-[#FF6B6B] p-6 font-bold shadow-[5px_5px_0px_#000]">{error}</div>}

                {!loading && !error && issues.length === 0 && (
                    <div className="rounded-3xl border-2 border-black bg-white p-10 text-center font-medium shadow-[6px_6px_0px_#000]">
                        {hasFilters ? "No issues match your search. Try different filters." : "No issues yet. Check back after a maintainer adds one."}
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
