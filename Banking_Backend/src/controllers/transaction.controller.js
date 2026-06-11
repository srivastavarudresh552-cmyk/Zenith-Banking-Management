const transactionModel = require("../models/transaction.model")
const ledgerModel = require("../models/ledger.model")
const accountModel = require("../models/account.model")
const emailService = require("../services/email.services")
const mongoose = require("mongoose")

const accountLocks = new Map()

function normalizeAmount(value) {
    const amount = Number(value)

    if (!Number.isFinite(amount) || amount <= 0) {
        return null
    }

    if (!Number.isInteger(amount * 100)) {
        return null
    }

    return amount
}

async function withAccountLock(accountId, task) {
    const key = accountId.toString()
    const previousLock = accountLocks.get(key) || Promise.resolve()

    let release
    const currentLock = new Promise((resolve) => {
        release = resolve
    })

    const queuedLock = previousLock.then(() => currentLock)
    accountLocks.set(key, queuedLock)
    await previousLock

    try {
        return await task()
    } finally {
        release()

        if (accountLocks.get(key) === queuedLock) {
            accountLocks.delete(key)
        }
    }
}

async function createTransaction(req, res) {
    const { fromAccount, toAccount, idempotencyKey } = req.body
    const amount = normalizeAmount(req.body.amount)

    if (!fromAccount || !toAccount || !req.body.amount || !idempotencyKey) {
        return res.status(400).json({
            message: "fromAccount, toAccount, amount and idempotencyKey are required"
        })
    }

    if (!amount) {
        return res.status(400).json({
            message: "Amount must be a positive number with no more than 2 decimal places."
        })
    }

    if (!mongoose.isValidObjectId(fromAccount) || !mongoose.isValidObjectId(toAccount)) {
        return res.status(400).json({
            message: "fromAccount and toAccount must be valid account ids."
        })
    }

    if (fromAccount === toAccount) {
        return res.status(400).json({
            message: "Source and destination accounts must be different."
        })
    }

    try {
        return await withAccountLock(fromAccount, async () => {
            const fromUserAccount = await accountModel.findOne({
                _id: fromAccount,
                user: req.user._id
            })
            const toUserAccount = await accountModel.findOne({ _id: toAccount })

            if (!fromUserAccount || !toUserAccount) {
                return res.status(400).json({
                    message: "Invalid fromAccount or toAccount"
                })
            }

            const existingTransaction = await transactionModel.findOne({ idempotencyKey })

            if (existingTransaction) {
                if (existingTransaction.status === "COMPLETED") {
                    return res.status(200).json({
                        message: "Transaction already processed.",
                        transaction: existingTransaction
                    })
                }

                if (existingTransaction.status === "PENDING") {
                    return res.status(200).json({ message: "Transaction is still processing." })
                }

                if (existingTransaction.status === "FAILED") {
                    return res.status(500).json({ message: "Transaction processing failed, please retry" })
                }

                if (existingTransaction.status === "REVERSED") {
                    return res.status(500).json({ message: "The transaction was reversed, please retry." })
                }
            }

            if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
                return res.status(400).json({
                    message: "Both accounts must be ACTIVE to process transaction."
                })
            }
            console.time("balance");
            const balance = await fromUserAccount.getBalance()
            console.timeEnd("balance");

            if (balance < amount) {
                return res.status(400).json({
                    message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
                })
            }

            let transaction
            const session = await mongoose.startSession()

            try {
                console.time("transaction");
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
                console.timeEnd("balance");
            } catch (error) {
                await session.abortTransaction()
                console.error("Transaction error:", error)

                if (error.code === 11000) {
                    const duplicateTransaction = await transactionModel.findOne({ idempotencyKey })
                    return res.status(200).json({
                        message: "Transaction already processed.",
                        transaction: duplicateTransaction
                    })
                }

                return res.status(500).json({
                    message: "Transaction failed due to an internal error, please retry."
                })
            } finally {
                session.endSession()
            }

            try {
                await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)
            } catch (emailError) {
                console.error("Email notification failed:", emailError)
            }

            return res.status(201).json({
                message: "Transaction completed successfully.",
                transaction
            })
        })
    } catch (error) {
        console.error("Transfer error:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

async function createInitialFundTransaction(req, res) {
    const { toAccount, idempotencyKey } = req.body
    const amount = normalizeAmount(req.body.amount)

    if (!toAccount || !req.body.amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required."
        })
    }

    if (!amount) {
        return res.status(400).json({
            message: "Amount must be a positive number with no more than 2 decimal places."
        })
    }

    if (!mongoose.isValidObjectId(toAccount)) {
        return res.status(400).json({
            message: "toAccount must be a valid account id."
        })
    }

    const toUserAccount = await accountModel.findOne({ _id: toAccount })

    if (!toUserAccount) {
        return res.status(400).json({ message: "Invalid toAccount" })
    }

    const fromUserAccount = await accountModel.findOne({ user: req.user._id })

    if (!fromUserAccount) {
        return res.status(400).json({ message: "System user account not found." })
    }

    const existingTransaction = await transactionModel.findOne({ idempotencyKey })

    if (existingTransaction) {
        return res.status(200).json({
            message: "Transaction already processed.",
            transaction: existingTransaction
        })
    }

    const session = await mongoose.startSession()
    let transaction

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
    } catch (error) {
        await session.abortTransaction()
        console.error("Initial fund transaction error:", error)
        return res.status(500).json({
            message: "Transaction failed due to an internal error."
        })
    } finally {
        session.endSession()
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
