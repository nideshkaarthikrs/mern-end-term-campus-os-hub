import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getProjectDetails, updateProject } from "../api/project.api.js"
import { AuthContext } from "../context/AuthContext.jsx"

const EditProject = () => {
    const { projectId } = useParams()
    const { user } = useContext(AuthContext)
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ name: "", description: "", repositoryUrl: "", techStack: "" })
    const [ownerId, setOwnerId] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchProject() {
            try {
                const response = await getProjectDetails(projectId)
                const project = response.data
                setOwnerId(project.owner?._id || project.owner)
                setFormData({
                    name: project.name,
                    description: project.description,
                    repositoryUrl: project.repositoryUrl,
                    techStack: project.techStack.join(", ")
                })
            } catch (error) {
                setError(error.response?.data?.message || "Failed to load the project")
            } finally {
                setLoading(false)
            }
        }
        fetchProject()
    }, [projectId])

    function handleForm(e) {
        setFormData(prevData => ({ ...prevData, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        const projectData = {
            name: formData.name,
            description: formData.description,
            repositoryUrl: formData.repositoryUrl,
            techStack: formData.techStack.split(",").map(tech => tech.trim()).filter(Boolean)
        }
        try {
            setSaving(true)
            await updateProject(projectId, projectData)
            navigate(`/projects/${projectId}`)
        } catch (error) {
            setError(error.response?.data?.message || "Failed to update project. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const canEdit = user?.role === "admin" || ownerId === user?._id

    return (
        <div className="min-h-screen bg-[#FFF8EE] px-6 py-10 md:px-10 lg:px-16">
            <div className="mx-auto max-w-3xl">
                <button type="button" className="mb-8 font-black hover:underline" onClick={() => navigate(`/projects/${projectId}`)}>
                    ← Back to project
                </button>

                <div className="mb-8">
                    <div className="mb-3 inline-block rounded-full border-2 border-black bg-[#FFD166] px-4 py-1 text-sm font-black shadow-[3px_3px_0px_#000]">
                        EDIT PROJECT
                    </div>
                    <h1 className="text-4xl font-black tracking-tight md:text-5xl">Update your project.</h1>
                </div>

                {loading && <p className="font-bold">Loading project...</p>}
                {error && <div className="mb-6 rounded-xl border-2 border-black bg-[#FF6B6B] p-4 font-bold">{error}</div>}
                {!loading && ownerId && !canEdit && <p className="font-bold">You are not authorized to edit this project.</p>}

                {!loading && ownerId && canEdit && (
                    <form onSubmit={handleSubmit} className="rounded-3xl border-2 border-black bg-white p-6 shadow-[7px_7px_0px_#000] md:p-8">
                        <div className="mb-6">
                            <label htmlFor="name" className="mb-2 block text-sm font-black">Project name</label>
                            <input id="name" name="name" type="text" required value={formData.name} onChange={handleForm} className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none" />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="description" className="mb-2 block text-sm font-black">Description</label>
                            <textarea id="description" name="description" rows="5" required value={formData.description} onChange={handleForm} className="w-full resize-none rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none" />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="repositoryUrl" className="mb-2 block text-sm font-black">Repository URL</label>
                            <input id="repositoryUrl" name="repositoryUrl" type="url" required value={formData.repositoryUrl} onChange={handleForm} className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none" />
                        </div>
                        <div className="mb-8">
                            <label htmlFor="techStack" className="mb-2 block text-sm font-black">Technologies</label>
                            <input id="techStack" name="techStack" type="text" required value={formData.techStack} onChange={handleForm} className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none" />
                            <p className="mt-2 text-sm font-medium text-gray-500">Separate technologies with commas.</p>
                        </div>
                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={() => navigate(`/projects/${projectId}`)} className="rounded-xl border-2 border-black bg-white px-6 py-3 font-black shadow-[3px_3px_0px_#000]">Cancel</button>
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

export default EditProject
