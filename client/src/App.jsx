import {Routes, Route, BrowserRouter, Navigate} from "react-router-dom"
import Register from "./pages/Register.jsx"
import Login from "./pages/Login.jsx"
import { AuthContextProvider } from "./context/AuthContext.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Projects from "./pages/Projects.jsx"
import CreateProject from "./pages/CreateProject.jsx"
import ProjectDetails from "./pages/ProjectDetails.jsx"
import EditProject from "./pages/EditProject.jsx"

function App() {
  return (
    <AuthContextProvider>
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />} >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/create-project" element={<CreateProject />} />
              <Route path="/projects/:projectId" element={<ProjectDetails />} />
              <Route path="/projects/:projectId/edit" element={<EditProject />} />
            </Route>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
      </BrowserRouter>
    </AuthContextProvider>
  )
}

export default App
