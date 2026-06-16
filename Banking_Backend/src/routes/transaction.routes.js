const {Router} = require('express');
const authMiddleware = require("../middleware/auth.middleware")
const transactionController = require("../controllers/transaction.controller")

const transactionRoutes = Router();

/**
 *  - POST /api/transactions
 *  - Create a new transaction
 */

transactionRoutes.post("/" , authMiddleware.authMiddleware , transactionController.createTransaction)

/**
 * -POST /api/transactions/system/initial-funds
 * -Create initial funds transaction from system user 
 */

transactionRoutes.post("/system/initial-funds" , authMiddleware.authSystemUserMiddleware , transactionController.createInitialFundTransaction )

/**
 * -POST /api/transactions/system/initial-funds   (kept for backward compatibility)
 * -POST /api/transactions/system/send             (general-purpose system payout)
 */
transactionRoutes.post(
    "/system/initial-funds",
    authMiddleware.authSystemUserMiddleware,
    transactionController.createInitialFundTransaction
)

transactionRoutes.post(
    "/system/send",
    authMiddleware.authSystemUserMiddleware,
    transactionController.createInitialFundTransaction
)


/**
 * -POST /api/transactions/system/adjust
 * -System user credits or debits any user's account
 * -body: { userAccount, direction: "CREDIT" | "DEBIT", amount, idempotencyKey, note }
 */
transactionRoutes.post(
    "/system/adjust",
    authMiddleware.authSystemUserMiddleware,
    transactionController.createSystemAdjustmentTransaction
)

module.exports = transactionRoutes;