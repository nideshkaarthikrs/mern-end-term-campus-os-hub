import validator from 'validator'
import User from '../models/user.model.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const registrationController = async (req, res) => {
    try {
        const { name, email, password } = req.body
        const normalizedEmail = email.toLowerCase()

        // Validation
        if (!name || !normalizedEmail || !password) {
            return res.status(400).send({message: "All fields are required"})
        }
        if (name.trim()==="" || !validator.isEmail(normalizedEmail) || password.length<8) {
            return res.status(400).json({message: "Bad request"})
        }
        const userWithDuplicateEmail = await User.findOne({ email: normalizedEmail })
        if (userWithDuplicateEmail) {
            return res.status(409).json({message: "Email already exists"})
        }

        // Password hashing
        const hashedPassword = await bcrypt.hash(password, 10)

        // Creating new user 
        const newUser = await User.create({
            name: name,
            email: normalizedEmail,
            password: hashedPassword
        })

        // JWT and Cookies

        const jwtPayload = {
            userId: newUser._id,
            role: newUser.role
        }
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {expiresIn: "7d"})

        const cookieOptions = {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }

        res.cookie("token", token, cookieOptions)

        return res.status(201).json({
            message: "User registered successfully"
        })
    } catch (error) {
        return res.status(500).json({message: "Internal server error"})
    }
}


export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body
        const normalizedEmail = email.toLowerCase()
        // Validation
        if (!normalizedEmail || !password) {
            return res.status(400).send({message: "All fields are required"})
        }
        if (!validator.isEmail(normalizedEmail) || password.length<8) {
            return res.status(400).json({message: "Bad request"})
        }

        // Querying the DB
        const user = await User.findOne({email: normalizedEmail})
        if (!user) {
            return res.status(401).json({message: "Invalid email or password"})
        }

        // Password check
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });     
        }

        // JWT and Cookies

        const jwtPayload = {
            userId: user._id,
            role: user.role
        }
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET, {expiresIn: "7d"})

        const cookieOptions = {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }

        res.cookie("token", token, cookieOptions)

        return res.status(200).json({ message: 'Login successful!' });


    } catch (error) {
        return res.status(500).json({message: "Internal server error"})
    }
}

// This controller will be for a protected route
export const userController = async (req, res) => {
    try {
        const userId = req.user.userId
        const user = await User.findOne({ _id:userId }).select("-password")
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        return res.status(200).json(user)        
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

export const logoutController = (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({
            message: "Logged out successfully"
        })        
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error, unable to logout"
        })
    }
}


export const adminTestController = (req, res) => {
    return res.status(200).send("Admin access granted")
}