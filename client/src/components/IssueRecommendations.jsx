import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext.jsx"
import { getIssueRecommendations } from "../api/issue.api.js"

const IssueRecommendations = () => {
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()
    const [goal, setGoal] = useState("")
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const columns = result?.recommendations.length === 3 ? "md:grid-cols-2 xl:grid-cols-3" :
        result?.recommendations.length === 2 ? "md:grid-cols-2" : ""

    if (user?.role !== "student") return null

    async function handleSubmit(event) {
        event.preventDefault()
        setLoading(true)
        setError("")
        setResult(null)
        try {
            const response = await getIssueRecommendations(goal)
            setResult(response.data)
        } catch (error) {
            setError(error.response?.data?.message || "Could not load suggestions. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="mb-10 rounded-3xl border-2 border-black bg-[#A7F3D0] p-5 shadow-[6px_6px_0px_#000] md:p-7" aria-labelledby="recommendations-heading">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="mb-2 text-xs font-black uppercase tracking-wide">AI issue recommendations</p>
                    <h2 id="recommendations-heading" className="text-2xl font-black md:text-3xl">Find your next contribution.</h2>
                    <p className="mt-2 max-w-2xl font-medium">Get up to three open issues based on your skills, learning goal, and recent contributions.</p>
                </div>
                <button type="button" onClick={() => navigate('/profile')} className="font-black hover:underline">Edit my skills →</button>
            </div>

            <form onSubmit={handleSubmit}>
                <label htmlFor="learningGoal" className="mb-2 block text-sm font-black">What would you like to work on? (optional)</label>
                <textarea id="learningGoal" rows="2" maxLength={500} disabled={loading} value={goal}
                    onChange={event => { setGoal(event.target.value); setResult(null); setError("") }}
                    placeholder="e.g. Practise React with a beginner-friendly UI issue"
                    className="w-full resize-none rounded-xl border-2 border-black bg-white px-4 py-3 font-medium outline-none disabled:opacity-60" />
                <p className="mt-2 text-xs font-medium text-gray-700">Gemini receives your skills, learning goal, recent contribution summaries, and candidate issue details.</p>
                <button type="submit" disabled={loading} className="mt-4 rounded-xl border-2 border-black bg-[#FFD166] px-5 py-3 font-black shadow-[3px_3px_0px_#000] disabled:opacity-60">
                    {loading ? "Finding suitable issues..." : "Find issues for me"}
                </button>
            </form>

            {loading && <p role="status" className="mt-5 font-bold">Checking open issues for a good fit...</p>}
            {error && <div role="alert" className="mt-5 rounded-xl border-2 border-black bg-[#FF6B6B] p-4 font-bold">{error}</div>}

            {result && (
                <div className="mt-6" aria-live="polite">
                    <h3 className="text-lg font-black">{result.source === "gemini" ? "Gemini suggestions" : "Skill-based suggestions"}</h3>
                    <p className="mt-1 text-sm font-medium">{result.message}</p>
                    <div className={`mt-4 grid gap-4 ${columns}`}>
                        {result.recommendations.map(item => (
                            <article key={item.issue._id} className="min-w-0 rounded-2xl border-2 border-black bg-white p-5">
                                <span className="rounded-full border-2 border-black bg-[#FFF8EE] px-3 py-1 text-xs font-black capitalize">{item.issue.difficulty}</span>
                                <h4 className="mt-4 break-words text-xl font-black">{item.issue.title}</h4>
                                <p className="mt-1 text-sm font-bold text-gray-600">{item.issue.project.name}</p>
                                <p className="mt-4 text-sm font-medium leading-6">{item.reason}</p>
                                {item.matchedSkills.length > 0 && <p className="mt-3 text-sm font-medium"><span className="font-black">Matching skills: </span>{item.matchedSkills.join(", ")}</p>}
                                {item.skillsToLearn.length > 0 && <p className="mt-2 text-sm font-medium"><span className="font-black">Skills to practise: </span>{item.skillsToLearn.join(", ")}</p>}
                                <p className="mt-3 text-sm font-medium leading-6"><span className="font-black">First step: </span>{item.firstStep}</p>
                                <button type="button" onClick={() => navigate(`/projects/${item.issue.project._id}/issues/${item.issue._id}`)} className="mt-5 w-full border-t-2 border-black pt-3 text-left font-black hover:underline">View issue →</button>
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </section>
    )
}

export default IssueRecommendations
