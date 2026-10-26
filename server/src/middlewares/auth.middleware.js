import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../models/user.model.js'

export const authMiddleware = async (req, res, next) => {
    let decoded
    try {
        const token = req.cookies?.token
        if (!token) {
            return res.status(401).json({message: "Authentication required"})
        }
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({message: "Authentication required"})
    }

    if (!decoded.userId || !mongoose.isValidObjectId(decoded.userId)) {
        return res.status(401).json({message: "Authentication required"})
    }

    try {
        const user = await User.findById(decoded.userId).select("role")
        if (!user) {
            return res.status(401).json({message: "Authentication required"})
        }
        req.user = { userId: user._id.toString(), role: user.role }
        next()
    } catch (error) {
        return res.status(500).json({message: "Internal server error"})
    }
}
