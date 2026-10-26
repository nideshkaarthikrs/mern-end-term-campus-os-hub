import { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getMyContributions } from "../api/auth.api.js"
import { AuthContext } from "../context/AuthContext.jsx"

const Profile = () => {
    const { user, updateProfile } = useContext(AuthContext)
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: user.name,
        bio: user.bio || "",
        skills: (user.skills || []).join(", ")
    })
    const [contributionCount, setContributionCount] = useState(0)
    const [projectCount, setProjectCount] = useState(0)
    const [statsLoading, setStatsLoading] = useState(true)
    const [statsError, setStatsError] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        async function fetchContributions() {
            try {
                const response = await getMyContributions()
                setContributionCount(response.data.contributionCount)
                setProjectCount(response.data.projectCount)
            } catch (error) {
                setStatsError(error.response?.data?.message || "Failed to load contribution stats")
            } finally {
                setStatsLoading(false)
            }
        }
        fetchContributions()
    }, [])

    function handleForm(e) {
        setSaved(false)
        setFormData(prevData => ({ ...prevData, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setSaved(false)
        const profileData = {
            name: formData.name,
            bio: formData.bio,
            skills: formData.skills.split(",").map(skill => skill.trim()).filter(Boolean)
        }
        try {
            setSaving(true)
            await updateProfile(profileData)
            setSaved(true)
        } catch (error) {
            setError(error.response?.data?.message || "Failed to update your profile. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FFF8EE] px-6 py-8 md:px-10 lg:px-16">
            <div className="mx-auto max-w-5xl">
                <button type="button" className="mb-8 font-black hover:underline" onClick={() => navigate('/dashboard')}>← Back to dashboard</button>

                <div className="mb-8">
                    <div className="mb-3 inline-block rounded-full border-2 border-black bg-[#FFD166] px-4 py-1 text-sm font-black shadow-[3px_3px_0px_#000]">YOUR PROFILE</div>
                    <h1 className="text-4xl font-black tracking-tight md:text-5xl">Your open-source profile</h1>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
                    <form onSubmit={handleSubmit} className="rounded-3xl border-2 border-black bg-white p-6 shadow-[7px_7px_0px_#000] md:p-8">
                        {error && <div className="mb-6 rounded-xl border-2 border-black bg-[#FF6B6B] p-4 font-bold">{error}</div>}
                        {saved && <div className="mb-6 rounded-xl border-2 border-black bg-[#A7F3D0] p-4 font-bold">Profile saved.</div>}

                        <div className="mb-6">
                            <label htmlFor="name" className="mb-2 block text-sm font-black">Name</label>
                            <input id="name" name="name" type="text" required value={formData.name} onChange={handleForm} className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none" />
                        </div>
                        <div className="mb-6">
                            <p className="mb-2 text-sm font-black">Email</p>
                            <p className="rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium text-gray-600">{user.email}</p>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="bio" className="mb-2 block text-sm font-black">Bio</label>
                            <textarea id="bio" name="bio" rows="5" value={formData.bio} onChange={handleForm} placeholder="Tell contributors about yourself" className="w-full resize-none rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none" />
                        </div>
                        <div className="mb-8">
                            <label htmlFor="skills" className="mb-2 block text-sm font-black">Skills</label>
                            <input id="skills" name="skills" type="text" value={formData.skills} onChange={handleForm} placeholder="React, Node.js, CSS" className="w-full rounded-xl border-2 border-black bg-[#FFF8EE] px-4 py-3 font-medium outline-none" />
                            <p className="mt-2 text-sm font-medium text-gray-500">Separate skills with commas.</p>
                        </div>
                        <button type="submit" disabled={saving} className="rounded-xl border-2 border-black bg-[#FF6B6B] px-6 py-3 font-black shadow-[4px_4px_0px_#000] disabled:opacity-50">
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </form>

                    <aside className="space-y-6">
                        <div className="rounded-2xl border-2 border-black bg-[#FFD166] p-6 shadow-[5px_5px_0px_#000]">
                            <p className="text-sm font-black uppercase">Account type</p>
                            <p className="mt-2 text-2xl font-black capitalize">{user.role}</p>
                        </div>
                        <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000]">
                            <h2 className="text-sm font-black uppercase">Contributions</h2>
                            {statsLoading && <p className="mt-3 font-medium">Loading...</p>}
                            {statsError && <p className="mt-3 font-medium text-red-700">{statsError}</p>}
                            {!statsLoading && !statsError && (
                                <div className="mt-4 space-y-3 font-medium">
                                    <p><span className="font-black">{contributionCount}</span> completed issues</p>
                                    <p><span className="font-black">{projectCount}</span> projects contributed to</p>
                                </div>
                            )}
                            <button type="button" onClick={() => navigate('/contributions')} className="mt-5 font-black hover:underline">View history →</button>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default Profile
