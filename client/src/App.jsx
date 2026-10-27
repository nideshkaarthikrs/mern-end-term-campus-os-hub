import {Routes, Route, BrowserRouter, Navigate} from "react-router-dom"
import { lazy, Suspense } from "react"
import Register from "./pages/Register.jsx"
import Login from "./pages/Login.jsx"
import { AuthContextProvider } from "./context/AuthContext.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Projects from "./pages/Projects.jsx"
import CreateProject from "./pages/CreateProject.jsx"
import ProjectDetails from "./pages/ProjectDetails.jsx"
import EditProject from "./pages/EditProject.jsx"
import CreateIssue from "./pages/CreateIssue.jsx"
import IssueDetails from "./pages/IssueDetails.jsx"
import EditIssue from "./pages/EditIssue.jsx"
import Contributions from "./pages/Contributions.jsx"
import Landing from "./pages/Landing.jsx"
import Profile from "./pages/Profile.jsx"

const IssueDiscovery = lazy(() => import("./pages/IssueDiscovery.jsx"))

function App() {
  return (
    <AuthContextProvider>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />} >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/issues" element={<Suspense fallback={<div className="min-h-screen bg-[#FFF8EE] p-8 font-bold">Loading issues...</div>}><IssueDiscovery /></Suspense>} />
              <Route path="/contributions" element={<Contributions />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/create-project" element={<CreateProject />} />
              <Route path="/projects/:projectId" element={<ProjectDetails />} />
              <Route path="/projects/:projectId/edit" element={<EditProject />} />
              <Route path="/projects/:projectId/issues/create" element={<CreateIssue />} />
              <Route path="/projects/:projectId/issues/:issueId" element={<IssueDetails />} />
              <Route path="/projects/:projectId/issues/:issueId/edit" element={<EditIssue />} />
            </Route>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </BrowserRouter>
    </AuthContextProvider>
  )
}

export default App
