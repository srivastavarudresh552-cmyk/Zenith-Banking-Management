// const express = require('express');
// const cookieParser = require('cookie-parser')


// const app = express();

// app.use(express.json())
// app.use(cookieParser())

// /**
//  * -Routes required
// */

// const authRouter = require("./routes/auth.routes");
// const accountRouter = require("./routes/account.routes")
// const transactionRoutes = require("./routes/transaction.routes")
// /**
//  * -Routes used
//  */

// app.get("/" , (req,res) => {
//     res.send("Ledger Service is up and running.")
// })

// app.use("/api/auth" , authRouter)
// app.use("/api/accounts" , accountRouter)
// app.use("/api/transactions" , transactionRoutes)

// module.exports = app; 

const express = require('express');
const cookieParser = require('cookie-parser')

const app = express();

app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'https://zenith-banking-management-oiffw4ug9.vercel.app',
        'https://zenith-banking-management-jnvzv8g9r.vercel.app',
    ]
    const origin = req.headers.origin
    const isVercelPreview = /^https:\/\/zenith-banking-management-[a-z0-9]+\.vercel\.app$/.test(origin || '')

    if (allowedOrigins.includes(origin) || isVercelPreview) {
        res.setHeader('Access-Control-Allow-Origin', origin)
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Credentials', 'true')

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204)
    }
    next()
})

app.use(express.json())
app.use(cookieParser())

// Routes
const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes")
const transactionRoutes = require("./routes/transaction.routes")

app.get("/", (req, res) => {
    res.send("Ledger Service is up and running.")
})

app.use("/api/auth", authRouter)
app.use("/api/accounts", accountRouter)
app.use("/api/transactions", transactionRoutes)

module.exports = app;
