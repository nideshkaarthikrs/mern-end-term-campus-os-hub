import { useEffect, useContext, useState } from 'react'
import { getProjects } from '../api/project.api.js'
import { AuthContext } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

const emptyFilters = { search: "", technology: "" }

const Projects = () => {

    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [filters, setFilters] = useState(emptyFilters)
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
    const hasFilters = Object.values(appliedFilters).some(value => value.trim())
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()

    useEffect(() => {
        let active = true
        async function fetchProjects() {
            try {
                const axiosResponse = await getProjects(appliedFilters)
                if (active) setProjects(axiosResponse.data.projects)
            } catch (error) {
                if (active) setError(
                    error.response?.data?.message || "Failed to load projects. Please try again."
                )
            }finally {
                if (active) setLoading(false)
            }
        }
        fetchProjects()
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
            <div className="mx-auto max-w-7xl">

                {/* Header */}
                <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="mb-3 inline-block rounded-full border-2 border-black bg-[#FFD166] px-4 py-1 text-sm font-black shadow-[3px_3px_0px_#000]">
                            OPEN SOURCE
                        </div>

                        <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                            Explore Projects
                        </h1>

                        <p className="mt-3 max-w-2xl text-base font-medium text-gray-700 md:text-lg">
                            Discover projects built by your campus community and
                            find something worth contributing to.
                        </p>
                    </div>

                    {/* Show this only when the user is allowed to create projects */}
                    {
                        (user?.role === "admin" || user?.role === "maintainer") &&
                        <button
                        className="rounded-xl border-2 border-black bg-[#FF6B6B] px-6 py-3 font-black shadow-[4px_4px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                        onClick={() => navigate('/create-project')}
                    >
                        + Create Project
                    </button>
                    }
                </div>

                <button type="button" onClick={() => navigate('/issues')} className="mb-8 font-black hover:underline">Browse all issues →</button>

                <form onSubmit={applyFilters} className="mb-8 rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0px_#000]">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-black">Search projects
                            <input type="search" value={filters.search} onChange={event => setFilters({ ...filters, search: event.target.value })} placeholder="Name or description" maxLength={100} className="mt-2 w-full rounded-xl border-2 border-black px-3 py-2 font-medium" />
                        </label>
                        <label className="text-sm font-black">Technology
                            <input type="search" value={filters.technology} onChange={event => setFilters({ ...filters, technology: event.target.value })} placeholder="e.g. React" maxLength={100} className="mt-2 w-full rounded-xl border-2 border-black px-3 py-2 font-medium" />
                        </label>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button type="submit" className="rounded-xl border-2 border-black bg-[#FFD166] px-5 py-2 font-black shadow-[3px_3px_0px_#000]">Find projects</button>
                        <button type="button" onClick={clearFilters} className="rounded-xl border-2 border-black bg-white px-5 py-2 font-black">Clear filters</button>
                    </div>
                </form>

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

                {/* Empty projects */}

                {(!loading && !error && projects.length === 0) &&
                    (
                    <div className="rounded-3xl border-2 border-black bg-white px-6 py-16 text-center shadow-[6px_6px_0px_#000]">
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-black bg-[#FFD166] text-3xl shadow-[3px_3px_0px_#000]">
                            🚀
                        </div>

                        <h2 className="text-2xl font-black">
                            {hasFilters ? "No matching projects" : "No projects yet"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-md font-medium text-gray-600">
                            {hasFilters ? "Try a different keyword or technology." : "There aren't any open-source projects here yet. Be the one to start something."}
                        </p>

                        {!hasFilters && (user?.role === "admin" || user?.role === "maintainer") && (
                            <button onClick={() => navigate('/create-project')}>
                                Create the first project
                            </button>
                        )}
                    </div>
                    )
                }

                {/* Project Grid */}
                {!loading && !error && <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">

                    {/* Rendering all projects using map() */}
                    {
                        projects.map(project => {
                            return (
                                    <article
                                    key={project._id}
                                    className="group rounded-3xl border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[9px_9px_0px_#000]"
                                >
                                    <div className="mb-5 flex items-start justify-between gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-[#FFD166] text-xl font-black shadow-[3px_3px_0px_#000]">
                                            C
                                        </div>

                                        <span className="rounded-full border-2 border-black bg-[#FFF8EE] px-3 py-1 text-xs font-black">
                                            OPEN SOURCE
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-black group-hover:underline">
                                        {project.name}
                                    </h2>

                                    <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-gray-600">
                                        {project.description}
                                    </p>

                                    <p className="mt-3 text-sm font-bold text-gray-600">
                                        Maintained by {project.owner?.name || "Unknown maintainer"}
                                    </p>

                                    <div className="mt-6 flex flex-wrap gap-2">
                                        {
                                            project.techStack.map(tech => {
                                                return (
                                                    <span className="rounded-lg border-2 border-black bg-[#FFD166] px-2.5 py-1 text-xs font-black"
                                                    key={tech}
                                                    >
                                                        {tech}
                                                    </span>
                                                    )
                                            })
                                        }
                                    </div>

                                    <button
                                        type="button"
                                        className="mt-7 flex w-full items-center justify-between border-t-2 border-black pt-4 text-left"
                                        onClick={() => navigate(`/projects/${project._id}`)}
                                    >
                                        <span className="text-sm font-bold text-gray-600">
                                            View project
                                        </span>

                                        <span className="text-xl font-black transition-transform group-hover:translate-x-1">
                                            →
                                        </span>
                                    </button>
                                </article>
                            )
                        })
                    }

                </div>}
            </div>
        </div>
    )
}

export default Projects
