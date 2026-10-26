import express from 'express'

import { registrationController, loginController, userController, updateUserController, getMyContributions, logoutController, adminTestController } from '../controllers/auth.controllers.js'

import { authMiddleware } from '../middlewares/auth.middleware.js' 
import { requireRole } from '../middlewares/role.middleware.js'

const authRouter = express.Router()

authRouter.post('/register', registrationController)

authRouter.post('/login', loginController)

authRouter.get('/me', authMiddleware, userController)
authRouter.put('/me', authMiddleware, updateUserController)
authRouter.get('/me/contributions', authMiddleware, getMyContributions)

authRouter.post('/logout', logoutController)

authRouter.get('/admin-test', authMiddleware, requireRole("admin"), adminTestController)

export default authRouter
