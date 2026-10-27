import { useContext, useState } from "react"
import { createProject } from "../api/project.api.js"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext.jsx"

const CreateProject = () => {

    const { user } = useContext(AuthContext)
    const [formData, setFormData] = useState({
        name:"",
        description:"",
        repositoryUrl:"",
        techStack:""
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()
    const canCreate = ["maintainer", "admin"].includes(user?.role)

    function handleForm(e) {
        setFormData(prevData => {
            return {...prevData, [e.target.name]: e.target.value}
        })
    }

    function handleCancel() {
        setFormData({
            name:"",
            description:"",
            repositoryUrl:"",
            techStack:""
        })
        navigate('/projects')

    }
    async function handleSubmit(e) {
        e.preventDefault()
        const tS = formData.techStack
                    .split(",")
                    .map(tech => tech.trim())
                    .filter(Boolean)
        const finalFormData = {name: formData.name, description: formData.description, repositoryUrl: formData.repositoryUrl, techStack: tS}
        try {
            setLoading(true)
            await createProject(finalFormData)
            setFormData({
                name:"",
                description:"",
                repositoryUrl:"",
                techStack:""
            })
            navigate('/projects')
        } catch (error) {
            setError(
                error.response?.data?.message || "Failed to create project. Please try again."
            )
        }finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FFF8EE] px-6 py-10 md:px-10 lg:px-16">
            <div className="mx-auto max-w-3xl">

                {/* Back */}
                <button
                    type="button"
                    className="mb-8 font-black hover:underline"
                    onClick={() => navigate('/projects')}
                >
                    ← Back to projects
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="mb-3 inline-block rounded-full border-2 border-black bg-[#FFD166] px-4 py-1 text-sm font-black shadow-[3px_3px_0px_#000]">
                        NEW PROJECT
                    </div>

                    <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                        Start something.
                    </h1>

                    <p className="mt-3 text-lg font-medium text-gray-700">
                        Create an open-source project for your campus community.
                    </p>
                </div>

                {/* Form */}
                {!canCreate && <p className="font-bold">Only maintainers can create projects.</p>}
                {canCreate && (
                <form className="rounded-3xl border-2 border-black bg-white p-6 shadow-[7px_7px_0px_#000] md:p-8"
                onSubmit={handleSubmit}
                >

                    {/* Error */}
                    {error && (
                        <div className="mb-6 rounded-xl border-2 border-black bg-[#FF6B6B] p-4 font-bold">
                            {error}
                        </div>
                    )}

                    {/* Project Name */}
                    <div className="mb-6">
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-black"
                        >
                            Project name
                        </label>

                        <input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="e.g. Campus Open Source Hub"
                            value={formData.name}
                            className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none transition focus:bg-white focus:shadow-[3px_3px_0px_#000]"
                            onChange={handleForm}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label
                            htmlFor="description"
                            className="mb-2 block text-sm font-black"
                        >
                            Description
                        </label>

                        <textarea
                            id="description"
                            name="description"
                            rows="5"
                            value={formData.description}
                            onChange={handleForm}
                            required
                            placeholder="What is this project about?"
                            className="w-full resize-none rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none transition focus:bg-white focus:shadow-[3px_3px_0px_#000]"
                        />
                    </div>

                    {/* Repository URL */}
                    <div className="mb-6">
                        <label
                            htmlFor="repositoryUrl"
                            className="mb-2 block text-sm font-black"
                        >
                            Repository URL
                        </label>

                        <input
                            id="repositoryUrl"
                            type="url"
                            name="repositoryUrl"
                            value={formData.repositoryUrl}
                            onChange={handleForm}
                            required
                            placeholder="https://github.com/..."
                            className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none transition focus:bg-white focus:shadow-[3px_3px_0px_#000]"
                        />
                    </div>

                    {/* Tech Stack */}
                    <div className="mb-8">
                        <label
                            htmlFor="techStack"
                            className="mb-2 block text-sm font-black"
                        >
                            Technologies
                        </label>

                        <input
                            id="techStack"
                            type="text"
                            name="techStack"
                            value={formData.techStack}
                            onChange={handleForm}
                            required
                            placeholder="React, Node.js, MongoDB"
                            className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none transition focus:bg-white focus:shadow-[3px_3px_0px_#000]"
                        />

                        <p className="mt-2 text-sm font-medium text-gray-500">
                            Separate technologies with commas.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            className="rounded-xl border-2 border-black bg-white px-6 py-3 font-black shadow-[3px_3px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_#000]"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-xl border-2 border-black bg-[#FF6B6B] px-6 py-3 font-black shadow-[4px_4px_0px_#000] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                        >
                            {loading ? "Creating..." : "Create Project"}
                        </button>
                    </div>

                </form>
                )}
            </div>
        </div>
    )
}

export default CreateProject
