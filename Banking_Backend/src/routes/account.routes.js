const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")

const router = express.Router()

/**
 * -POST/apiaccounts
 * -Create a new account
 * -Protected route
 */

router.post("/", authMiddleware.authMiddleware , accountController.createAccountController)

/**
 * -GET/api/accounts
 * -Get all accounts of the logged-in user
 * -Protected Route
 */

router.get("/", authMiddleware.authMiddleware , accountController.getUserAccountController)

/**
 * -GET /api/accounts/search?query=
 * -Search other users' accounts by name or exact email (min 3 chars)
 */
router.get("/search", authMiddleware.authMiddleware, accountController.searchAccountsController)

/**
 * -GET/api/accounts/balance/:accountId
 */

router.get("/balance/:accountId" , authMiddleware.authMiddleware , accountController.getAccountBalanceController)


/**
 * -GET /api/accounts/all
 * -List every account in the system, with owner info and current balance
 * -System user only (the "source" / treasury account)
 */
router.get("/all", authMiddleware.authSystemUserMiddleware, accountController.getAllAccountsController)

module.exports = router
