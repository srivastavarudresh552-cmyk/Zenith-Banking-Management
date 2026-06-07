// const transactionModel = require("../models/transaction.model")
// const ledgerModel = require("../models/ledger.model")
// const accountModel = require("../models/account.model")
// const emailService = require("../services/email.services")
// const mongoose = require("mongoose")

// /**
//  * -Create a new transaction
//  * The 10 STEP TRANSFER FLOW : 
//     * 1.Validate request
//     * 2.Validate idempotency key
//     * 3.Check account status
//     * 4.Derive sender balance from ledger
//     * 5.Create transaction(PENDING)
//     * 6.Create DEBIT Ledger entry
//     * 7.Create CREDIT Ledger entry
//     * 8.Mark transaction completed
//     * 9.Commit MongoDB session
//     * 10.Send email notification
//  */


// async function createTransaction(req, res) {

//    /**
//     * 1.Validate  request
//     */

//    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

//    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
//       return res.status(400).json({
//          message: "From Account , toAccount , Amount and the idemotencyKey are required"
//       })
//    }

//    const fromUserAccount = await accountModel.findOne({
//       _id: fromAccount
//    })

//    const toUserAccount = await accountModel.findOne({
//       _id: toAccount
//    })

//    if (!fromUserAccount || !toUserAccount) {
//       return res.status(400).json({
//          message: "Invalid fromAccount or toAccount"
//       })
//    }

//    /**
//     * 2.Validate idempotency key
//     */

//    const isTransactionAlreadyExists = await transactionModel.findOne({
//       idempotencyKey: idempotencyKey
//    })

//    if (isTransactionAlreadyExists) {
//       if (isTransactionAlreadyExists.status === "COMPLETED") {
//          return res.status(200).json({
//             message: "Transaction already processed.",
//             transaction: isTransactionAlreadyExists
//          })
//       }

//       if (isTransactionAlreadyExists.status === "PENDING") {
//          return res.status(200).json({
//             message: "Transaciton is still processing."
//          })
//       }

//       if (isTransactionAlreadyExists.status === "FAILED") {
//          return res.status(500).json({
//             message: "Transaction processing failed , please retry"
//          })
//       }

//       if (isTransactionAlreadyExists.status === "REVERSED") {
//          return res.status(500).json({
//             message: "The transaction was revaersed , please retry."
//          })
//       }
//    }

//    /**
//     * 3.Check account status
//     */

//    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
//       return res.status(400).json({
//          message: "Both fromUserAccount and toUserAccount must be ACTIVE to process transaction."
//       })
//    }

//    /**
//     * 4.Derive sender balance from ledger
//     */

//    const balance = await fromUserAccount.getBalance()

//    if (balance < amount) {
//       res.status(400).json({
//          message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
//       })
//    }

//    /**
//     * 5.Create transaction(PENDING)
//     */
//    let transaction;
//    try {
//    const session = await mongoose.startSession()
//    session.startTransaction()

//    transaction = (await transactionModel.create([{
//       fromAccount,
//       toAccount,
//       amount,
//       idempotencyKey,
//       status: "PENDING"
//    }], { session }))[0]

//    const debitLedgerEntry = await ledgerModel.create([{
//       account: fromUserAccount._id,
//       amount: amount,
//       transaction: transaction._id,
//       type: "DEBIT"
//    }], { session })

//    await (() => {
//       return new Promise((resolve) => setTimeout(resolve, 10 * 1000))
//    })()   

//    const creditLedgerEntry = await ledgerModel.create([{
//       account: toUserAccount._id,
//       amount: amount,
//       transaction: transaction._id,
//       type: "CREDIT"
//    }], { session })

//    await transactionModel.findOneAndUpdate(
//       {_id : transaction._id},
//       {status : "COMPLETED"},
//       {session}
//    )

//    await session.commitTransaction()
//    session.endSession()
// } catch(error){
//    return res.status(400).json({
//       message : "Transaction is PENDING due to some issue , please retry after some time."
//    })
// }
//    /**
//     * 10.Send email notification
//     */

//    await emailService.sendTransactionEmail(req.user.email, req.user.name, toUserAccount._id)

//    return res.status(201).json({
//       message: "Transaction completed succesfully.",
//       transaction: transaction
//    })

// }

// async function createInitialFundTransaction(req, res) {
//    const { toAccount, amount, idempotencyKey } = req.body

//    if (!toAccount || !amount || !idempotencyKey) {
//       return res.status(400).json({
//          message: "toAccount , amount and idempotencyKey are required."
//       })
//    }

//    const toUserAccount = await accountModel.findOne({
//       _id: toAccount
//    })

//    if (!toUserAccount) {
//       return res.status(400).json({
//          message: "Invalid toAccount"
//       })
//    }

//    const fromUserAccount = await accountModel.findOne({
//       // systemUser : true,
//       user: req.user._id
//    })

//    if (!fromUserAccount) {
//       return res.status(400).json({
//          message: "System user account not found."
//       })
//    }


//    const session = await mongoose.startSession()
//    session.startTransaction()

//    const transaction = new transactionModel({
//       fromAccount: fromUserAccount._id,
//       toAccount,
//       amount,
//       idempotencyKey,
//       status: "PENDING"
//    })

//    const debitLedgerEntry = await ledgerModel.create([{
//       account: fromUserAccount._id,
//       amount: amount,
//       transaction: transaction._id,
//       type: "DEBIT"
//    }], { session })

//    const creditLedgerEntry = await ledgerModel.create([{
//       account: toUserAccount._id,
//       amount: amount,
//       transaction: transaction._id,
//       type: "CREDIT"
//    }], { session })

//    transaction.status = "COMPLETED"
//    await transaction.save({ session })

//    await session.commitTransaction()
//    session.endSession()

//    return res.status(201).json({
//       message: "Initial funds transaction completed succesfully.",
//       transaction: transaction
//    })

// }

// module.exports = {
//    createTransaction,
//    createInitialFundTransaction
// }


const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.services")
const mongoose = require("mongoose")

/**
 * Create a new transaction
 * The 10 STEP TRANSFER FLOW:
 *  1. Validate request
 *  2. Validate idempotency key
 *  3. Check account status
 *  4. Derive sender balance from ledger
 *  5. Create transaction (PENDING)
 *  6. Create DEBIT Ledger entry
 *  7. Create CREDIT Ledger entry
 *  8. Mark transaction completed
 *  9. Commit MongoDB session
 * 10. Send email notification
 */

async function createTransaction(req, res) {
    /**
     * 1. Validate request
     */
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required"
        })
    }

    const fromUserAccount = await accountModel.findOne({ _id: fromAccount })
    const toUserAccount = await accountModel.findOne({ _id: toAccount })

    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "Invalid fromAccount or toAccount"
        })
    }

    /**
     * 2. Validate idempotency key
     */
    const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey })

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === "COMPLETED") {
            return res.status(200).json({
                message: "Transaction already processed.",
                transaction: isTransactionAlreadyExists
            })
        }
        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(200).json({ message: "Transaction is still processing." })
        }
        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json({ message: "Transaction processing failed, please retry" })
        }
        if (isTransactionAlreadyExists.status === "REVERSED") {
            return res.status(500).json({ message: "The transaction was reversed, please retry." })
        }
    }

    /**
     * 3. Check account status
     */
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both accounts must be ACTIVE to process transaction."
        })
    }

    /**
     * 4. Derive sender balance from ledger
     */
    const balance = await fromUserAccount.getBalance()

    if (balance < amount) {
        // FIX: was missing return — response continued after this
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

    /**
     * 5-9. Execute transaction in a MongoDB session
     */
    let transaction;
    const session = await mongoose.startSession()
    try {
        session.startTransaction()

        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0]

        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        await ledgerModel.create([{
            account: toUserAccount._id,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session, new: true }
        )

        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.error("Transaction error:", error)
        return res.status(500).json({
            message: "Transaction failed due to an internal error, please retry."
        })
    }

    /**
     * 10. Send email notification
     * FIX: was passing toUserAccount._id as amount; correct signature is (email, name, amount, toAccount)
     */
    try {
        await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
    } catch (emailError) {
        // Non-critical — log but don't fail the request
        console.error("Email notification failed:", emailError)
    }

    return res.status(201).json({
        message: "Transaction completed successfully.",
        transaction
    })
}

async function createInitialFundTransaction(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required."
        })
    }

    const toUserAccount = await accountModel.findOne({ _id: toAccount })

    if (!toUserAccount) {
        return res.status(400).json({ message: "Invalid toAccount" })
    }

    // For initial funds we use the system user's own account as the source
    const fromUserAccount = await accountModel.findOne({ user: req.user._id })

    if (!fromUserAccount) {
        return res.status(400).json({ message: "System user account not found." })
    }

    const session = await mongoose.startSession()
    let transaction;
    try {
        session.startTransaction()

        transaction = (await transactionModel.create([{
            fromAccount: fromUserAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0]

        await ledgerModel.create([{
            account: fromUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        await ledgerModel.create([{
            account: toUserAccount._id,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session, new: true }
        )

        await session.commitTransaction()
        session.endSession()
    } catch (error) {
        await session.abortTransaction()
        session.endSession()
        console.error("Initial fund transaction error:", error)
        return res.status(500).json({
            message: "Transaction failed due to an internal error."
        })
    }

    return res.status(201).json({
        message: "Initial funds transaction completed successfully.",
        transaction
    })
}

module.exports = {
    createTransaction,
    createInitialFundTransaction
}
