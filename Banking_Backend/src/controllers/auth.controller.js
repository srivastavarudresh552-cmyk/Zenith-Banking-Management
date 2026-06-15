const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.services")
const tokenBlacklistModel = require("../models/blackList.model")

const baseCookieOptions = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production"
}

const cookieOptions = {
    ...baseCookieOptions,
    maxAge: 3 * 24 * 60 * 60 * 1000
}

function createToken(user) {
    return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })
}

function serializeUser(user) {
    return {
        _id: user._id,
        email: user.email,
        name: user.name,
        systemUser: !!user.systemUser
    }
}

async function userRegisterController(req, res) {
    try {
        const { email, password, name } = req.body

        if (!email || !password || !name) {
            return res.status(400).json({ message: "email, password and name are required." })
        }

        const isExists = await userModel.findOne({ email })

        if (isExists) {
            return res.status(422).json({
                message: "User already exists with email.",
                status: "Failed"
            })
        }

        const user = await userModel.create({ email, password, name })
        const token = createToken(user)

        res.cookie("token", token, cookieOptions)
        res.status(201).json({ user: serializeUser(user), token })

        emailService.sendRegistrationEmail(user.email, user.name).catch(console.error)
    } catch (err) {
        console.error("Register error:", err)
        res.status(500).json({ message: "Internal server error" })
    }
}

async function userLoginController(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required." })
        }

        const user = await userModel.findOne({ email }).select("+password +systemUser")
        if (!user) {
            return res.status(401).json({ message: "Email or password is INVALID" })
        }

        const isValidPassword = await user.comparePassword(password)

        if (!isValidPassword) {
            return res.status(401).json({ message: "Email or password is INVALID" })
        }

        const token = createToken(user)

        res.cookie("token", token, cookieOptions)
        res.status(200).json({ user: serializeUser(user), token })
    } catch (err) {
        console.error("Login error:", err)
        res.status(500).json({ message: "Internal server error" })
    }
}

async function userLogoutController(req, res) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

        if (token) {
            await tokenBlacklistModel.create({ token })
        }

        res.clearCookie("token", baseCookieOptions)
        res.status(200).json({ message: "User logged out successfully." })
    } catch (err) {
        console.error("Logout error:", err)
        res.clearCookie("token", baseCookieOptions)
        res.status(200).json({ message: "User logged out successfully." })
    }
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}
