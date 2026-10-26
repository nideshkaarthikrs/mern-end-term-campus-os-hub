import express from 'express'
import { createIssue, getIssues, getIssueDetails, updateIssue, deleteIssue } from '../controllers/issue.controllers.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'

const issueRouter = express.Router({ mergeParams: true })

issueRouter.get('/', authMiddleware, getIssues)
issueRouter.post('/', authMiddleware, requireRole("admin", "maintainer"), createIssue)
issueRouter.get('/:issueId', authMiddleware, getIssueDetails)
issueRouter.put('/:issueId', authMiddleware, requireRole("admin", "maintainer"), updateIssue)
issueRouter.delete('/:issueId', authMiddleware, requireRole("admin", "maintainer"), deleteIssue)

export default issueRouter
