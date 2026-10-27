import express from 'express'
import { createIssue, getIssues, getAllIssues, getIssueDetails, updateIssue, deleteIssue, claimIssue, unclaimIssue, completeIssue } from '../controllers/issue.controllers.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { requireRole } from '../middlewares/role.middleware.js'
import { getIssueRecommendations } from '../controllers/recommendation.controllers.js'

const issueRouter = express.Router({ mergeParams: true })
export const allIssueRouter = express.Router()

allIssueRouter.get('/', authMiddleware, getAllIssues)
allIssueRouter.post('/recommendations', authMiddleware, requireRole("student"), getIssueRecommendations)

issueRouter.get('/', authMiddleware, getIssues)
issueRouter.post('/', authMiddleware, requireRole("admin", "maintainer"), createIssue)
issueRouter.get('/:issueId', authMiddleware, getIssueDetails)
issueRouter.put('/:issueId', authMiddleware, requireRole("admin", "maintainer"), updateIssue)
issueRouter.delete('/:issueId', authMiddleware, requireRole("admin", "maintainer"), deleteIssue)
issueRouter.post('/:issueId/claim', authMiddleware, requireRole("student"), claimIssue)
issueRouter.delete('/:issueId/claim', authMiddleware, requireRole("student"), unclaimIssue)
issueRouter.post('/:issueId/complete', authMiddleware, requireRole("admin", "maintainer"), completeIssue)

export default issueRouter
