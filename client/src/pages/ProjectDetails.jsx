import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { deleteProject, getProjectDetails } from "../api/project.api.js"
import { getIssues } from "../api/issue.api.js"
import { AuthContext } from "../context/AuthContext.jsx"

const ProjectDetails = () => {

    const { projectId } = useParams()
    const [project, setProject] = useState(null)
    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState("")
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchProjectDetails() {
            try {
                const [projectResponse, issuesResponse] = await Promise.all([
                    getProjectDetails(projectId), getIssues(projectId)
                ])
                setProject(projectResponse.data)
                setIssues(issuesResponse.data.issues)
            } catch (error) {
                setError(
                    error.response?.data?.message || "Failed to load the project. Please try again."
                )
            }finally {
                setLoading(false)
            }
        }
        fetchProjectDetails()
    }, [projectId])

    const ownerId = project?.owner?._id || project?.owner
    const canManage = user?.role === "admin" || ownerId === user?._id

    async function handleDelete() {
        if (!window.confirm("Delete this project? This cannot be undone.")) return
        try {
            setDeleting(true)
            setError("")
            await deleteProject(projectId)
            navigate("/projects")
        } catch (error) {
            setError(error.response?.data?.message || "Failed to delete the project. Please try again.")
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FFF8EE] px-6 py-8 md:px-10 lg:px-16">
            <div className="mx-auto max-w-6xl">

                {/* Loading */}
                {loading && (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <div className="rounded-2xl border-2 border-black bg-white px-8 py-6 font-black shadow-[5px_5px_0px_#000]">
                            Loading projects...
                        </div>
                    </div>
                    )
                }

                {/* Error display */}

                {error && (
                    <div className="rounded-2xl border-2 border-black bg-[#FF6B6B] p-6 font-bold shadow-[5px_5px_0px_#000]">
                        {error}
                    </div>
                    )
                }

            {(!loading && project) && (
                <>
                {/* Back */}
                <button
                    type="button"
                    className="mb-8 font-black hover:underline"
                    onClick={() => navigate("/projects")}
                >
                    ← Back to projects
                </button>

                {/* Project Header */}
                <div className="rounded-3xl border-2 border-black bg-white p-6 shadow-[7px_7px_0px_#000] md:p-8">

                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

                        <div>
                            <div className="mb-4 inline-block rounded-full border-2 border-black bg-[#FFD166] px-4 py-1 text-sm font-black shadow-[3px_3px_0px_#000]">
                                OPEN SOURCE
                            </div>

                            {/* Project name */}
                            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                                {project.name}
                            </h1>

                            {/* Description */}
                            <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-gray-700 md:text-lg">
                                {project.description}
                            </p>

                            {canManage && (
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button type="button" onClick={() => navigate(`/projects/${projectId}/edit`)} className="rounded-xl border-2 border-black bg-[#FFD166] px-5 py-2 font-black shadow-[3px_3px_0px_#000]">
                                        Edit Project
                                    </button>
                                    <button type="button" disabled={deleting} onClick={handleDelete} className="rounded-xl border-2 border-black bg-white px-5 py-2 font-black shadow-[3px_3px_0px_#000] disabled:opacity-50">
                                        {deleting ? "Deleting..." : "Delete Project"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Repository */}
                        <a
                            href={project.repositoryUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 rounded-xl border-2 border-black bg-[#FF6B6B] px-5 py-3 text-center font-black shadow-[4px_4px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]"
                        >
                            View Repository ↗
                        </a>

                    </div>

                    {/* Tech Stack */}
                    <div className="mt-8 border-t-2 border-black pt-6">

                        <h2 className="mb-3 text-sm font-black uppercase tracking-wide">
                            Technologies
                        </h2>

                        <div className="flex flex-wrap gap-2">
                            {
                                project.techStack.map(tech => {
                                    return (
                                        <span className="rounded-lg border-2 border-black bg-[#FFD166] px-3 py-1.5 text-sm font-black"
                                        key={tech}
                                        >
                                                {tech}
                                        </span>
                                    )
                                })
                            }
                        </div>

                    </div>

                </div>

                {/* Main Content */}
                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">

                    {/* Issues */}
                    <section>

                        <div className="mb-5 flex items-end justify-between">
                            <div>
                                <div className="mb-2 inline-block rounded-full border-2 border-black bg-[#FFD166] px-3 py-1 text-xs font-black">
                                    CONTRIBUTE
                                </div>

                                <h2 className="text-3xl font-black">Issues</h2>

                                <p className="mt-2 font-medium text-gray-600">
                                    Find an issue and start contributing.
                                </p>
                            </div>

                            {canManage && (
                                <button type="button" onClick={() => navigate(`/projects/${projectId}/issues/create`)} className="rounded-xl border-2 border-black bg-[#FF6B6B] px-5 py-3 font-black shadow-[4px_4px_0px_#000]">
                                    + Create Issue
                                </button>
                            )}

                        </div>

                        {issues.length === 0 ? (
                            <div className="rounded-2xl border-2 border-black bg-white p-6 font-medium shadow-[5px_5px_0px_#000]">
                                No issues have been added yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {issues.map(issue => (
                                    <article key={issue._id} className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0px_#000]">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <h3 className="text-xl font-black">{issue.title}</h3>
                                            <span className="rounded-full border-2 border-black bg-[#FFD166] px-3 py-1 text-xs font-black uppercase">{issue.status}</span>
                                        </div>
                                        <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-gray-600">{issue.description}</p>
                                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-black pt-4">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="rounded-lg border-2 border-black bg-[#FFF8EE] px-2.5 py-1 text-xs font-black capitalize">{issue.difficulty}</span>
                                                {issue.requiredSkills.map(skill => (
                                                    <span key={skill} className="rounded-lg border-2 border-black bg-[#FFF8EE] px-2.5 py-1 text-xs font-black">{skill}</span>
                                                ))}
                                            </div>
                                            <button type="button" onClick={() => navigate(`/projects/${projectId}/issues/${issue._id}`)} className="font-black hover:underline">View issue →</button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                    </section>

                    {/* Sidebar */}
                    <aside className="space-y-6">

                        {/* Maintainer */}
                        <div className="rounded-2xl border-2 border-black bg-[#FFD166] p-5 shadow-[5px_5px_0px_#000]">

                            <p className="text-xs font-black uppercase tracking-wide">
                                Maintainer
                            </p>

                            <div className="mt-4 flex items-center gap-3">

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-white text-lg font-black shadow-[3px_3px_0px_#000]">
                                    {project.owner?.name?.charAt(0).toUpperCase() || "M"}
                                </div>

                                <div>
                                    <p className="font-black">
                                        {project.owner?.name || "Unknown maintainer"}
                                    </p>

                                    <p className="text-sm font-medium">
                                        Project Owner
                                    </p>
                                </div>

                            </div>

                        </div>


                    </aside>

                </div>
                </>
            )}
            </div>

        </div>
    )
}

export default ProjectDetails
