export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const currentRole = req.user.role
        if (!allowedRoles.includes(currentRole)) {
            return res.status(403).json({message: "You are not authorized to access this page"})                
        }
        next()
    }
}