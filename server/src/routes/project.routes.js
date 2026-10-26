import express from 'express'
import { createProject, getProjects, getProjectDetails, updateProject, deleteProject } from '../controllers/project.controllers.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'
import issueRouter from './issue.routes.js'

const projectRouter = express.Router()

projectRouter.get('/', authMiddleware, getProjects)

projectRouter.post('/', authMiddleware, requireRole("admin", "maintainer"), createProject)

projectRouter.use('/:projectId/issues', issueRouter)

projectRouter.get('/:projectId', authMiddleware, getProjectDetails)

projectRouter.put('/:projectId', authMiddleware, requireRole("admin", "maintainer"), updateProject)

projectRouter.delete('/:projectId', authMiddleware, requireRole("admin", "maintainer"), deleteProject)


export default projectRouter
