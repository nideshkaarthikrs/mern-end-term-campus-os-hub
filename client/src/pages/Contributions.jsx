import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMyContributions } from "../api/auth.api.js"

const Contributions = () => {
    const navigate = useNavigate()
    const [contributions, setContributions] = useState([])
    const [contributionCount, setContributionCount] = useState(0)
    const [projectCount, setProjectCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchContributions() {
            try {
                const response = await getMyContributions()
                setContributions(response.data.contributions)
                setContributionCount(response.data.contributionCount)
                setProjectCount(response.data.projectCount)
            } catch (error) {
                setError(error.response?.data?.message || "Failed to load your contributions")
            } finally {
                setLoading(false)
            }
        }
        fetchContributions()
    }, [])

    return (
        <div className="min-h-screen bg-[#FFF8EE] px-6 py-8 md:px-10 lg:px-16">
            <div className="mx-auto max-w-5xl">
                <button type="button" className="mb-8 font-black hover:underline" onClick={() => navigate('/dashboard')}>
                    ← Back to dashboard
                </button>

                <div className="mb-8">
                    <div className="mb-3 inline-block rounded-full border-2 border-black bg-[#FFD166] px-4 py-1 text-sm font-black shadow-[3px_3px_0px_#000]">YOUR WORK</div>
                    <h1 className="text-4xl font-black tracking-tight md:text-5xl">Contribution history</h1>
                    <p className="mt-3 font-medium text-gray-700">Issues a maintainer has marked as completed.</p>
                </div>

                {loading && <p className="font-bold">Loading contributions...</p>}
                {error && <div className="mb-6 rounded-xl border-2 border-black bg-[#FF6B6B] p-4 font-bold">{error}</div>}

                {!loading && !error && (
                    <>
                        <div className="mb-8 grid gap-5 sm:grid-cols-2">
                            <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
                                <p className="text-sm font-black uppercase">Completed issues</p>
                                <p className="mt-2 text-4xl font-black">{contributionCount}</p>
                            </div>
                            <div className="rounded-2xl border-2 border-black bg-[#FFD166] p-6 shadow-[5px_5px_0px_#000]">
                                <p className="text-sm font-black uppercase">Projects contributed to</p>
                                <p className="mt-2 text-4xl font-black">{projectCount}</p>
                            </div>
                        </div>

                        {contributions.length === 0 ? (
                            <div className="rounded-2xl border-2 border-black bg-white p-8 font-medium shadow-[5px_5px_0px_#000]">
                                No completed contributions yet. Explore projects to find an issue.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {contributions.map(issue => (
                                    <article key={issue._id} className="rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
                                        <h2 className="text-xl font-black">{issue.title}</h2>
                                        <p className="mt-2 font-medium text-gray-600">{issue.project?.name || "Project unavailable"}</p>
                                        <p className="mt-2 text-sm font-medium text-gray-600">
                                            Verified by {issue.verifiedBy?.name || "a maintainer"}
                                            {issue.completedAt && ` · ${new Date(issue.completedAt).toLocaleDateString()}`}
                                        </p>
                                        {issue.project && (
                                            <button type="button" onClick={() => navigate(`/projects/${issue.project._id}/issues/${issue._id}`)} className="mt-4 font-black hover:underline">
                                                View issue →
                                            </button>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Contributions
