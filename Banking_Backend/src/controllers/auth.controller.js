// const userModel = require("../models/user.model")
// const jwt = require("jsonwebtoken")
// const emailService = require("../services/email.services")
// const tokenBlacklistModel = require("../models/blackList.model")
// /** 
// * - user register controller
// * - POST/api/auth/register
// */

// async function userRegisterController(req, res) {
//     const { email, password, name } = req.body

//     const isExists = await userModel.findOne({
//         email: email
//     })

//     if (isExists) {
//         return res.status(422).json({
//             message: "User already exists with email.",
//             status: "Failed"
//         })
//     }

//     const user = await userModel.create({
//         email, password, name
//     })

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })

//     res.cookie("token", token)
//     res.status(201).json({
//         user: {
//             _id: user._id,
//             email: user.email,
//             name: user.name
//         },
//         token
//     })

//     await emailService.sendRegistrationEmail(user.email , user.name)
// }

// /**
//  * - User Login Controller 
//  * - POST /api/auth/login
//  */

// async function userLoginController(req, res) {
//     const { email, password } = req.body

//     const user = await userModel.findOne({ email }).select("+password")

//     if (!user) {
//         return res.status(401).json({
//             message: "Email or password is INVALID"
//         })
//     }

//     const isValidPassword = await user.comparePassword(password)

//     if (!isValidPassword) {
//         return res.status(401).json({
//             message: "Email or password is INVALID"
//         })
//     }

//     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })

//     res.cookie("token", token)
//     res.status(200).json({
//         user: {
//             _id: user._id,
//             email: user.email,
//             name: user.name
//         },
//         token
//     })

// }

// /**
//  * - User Logout Controller
//  * - POST /api/auth/logout
//  */

// async function userLogoutController(req, res){
//     const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

//     if(!token){
//         return res.status(200).json({
//             message: "User logged out successfully."
//         })
//     }   


//     await tokenBlacklistModel.create({
//         token : token
//     })

//     res.clearCookie("token")

//     res.status(200).json({
//         message: "User logged out successfully."
//     })
// }

// module.exports = {
//     userRegisterController,
//     userLoginController,
//     userLogoutController
// }


const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.services")
const tokenBlacklistModel = require("../models/blackList.model")

/**
 * POST /api/auth/register
 */
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

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })

        res.cookie("token", token, { httpOnly: true })
        res.status(201).json({
            user: { _id: user._id, email: user.email, name: user.name },
            token
        })

        // Send email after responding (non-blocking)
        emailService.sendRegistrationEmail(user.email, user.name).catch(console.error)
    } catch (err) {
        console.error("Register error:", err)
        res.status(500).json({ message: "Internal server error" })
    }
}

/**
 * POST /api/auth/login
 */
async function userLoginController(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "email and password are required." })
        }

        const user = await userModel.findOne({ email }).select("+password")

        if (!user) {
            return res.status(401).json({ message: "Email or password is INVALID" })
        }

        const isValidPassword = await user.comparePassword(password)

        if (!isValidPassword) {
            return res.status(401).json({ message: "Email or password is INVALID" })
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "3d" })

        res.cookie("token", token, { httpOnly: true })
        res.status(200).json({
            user: { _id: user._id, email: user.email, name: user.name },
            token
        })
    } catch (err) {
        console.error("Login error:", err)
        res.status(500).json({ message: "Internal server error" })
    }
}

/**
 * POST /api/auth/logout
 */
async function userLogoutController(req, res) {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

        if (!token) {
            return res.status(200).json({ message: "User logged out successfully." })
        }

        await tokenBlacklistModel.create({ token })

        res.clearCookie("token")
        res.status(200).json({ message: "User logged out successfully." })
    } catch (err) {
        console.error("Logout error:", err)
        // Still clear the cookie even if blacklisting fails
        res.clearCookie("token")
        res.status(200).json({ message: "User logged out successfully." })
    }
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}
