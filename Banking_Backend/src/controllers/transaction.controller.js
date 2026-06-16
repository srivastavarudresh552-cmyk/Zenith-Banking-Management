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
        console.log("createTransaction endpoint hit");
        console.time("TOTAL");

        return await withAccountLock(fromAccount, async () => {

            console.time("findAccounts");
            const fromUserAccount = await accountModel.findOne({
                _id: fromAccount,
                user: req.user._id
            });
            const toUserAccount = await accountModel.findOne({
                _id: toAccount
            });
            console.timeEnd("findAccounts");

            if (!fromUserAccount || !toUserAccount) {
                return res.status(400).json({
                    message: "Invalid fromAccount or toAccount"
                });
            }

            if (toUserAccount.user.toString() === req.user._id.toString()) {
                return res.status(400).json({
                    message: "Transfers can only be made to another user's account."
                });
            }

            console.time("existingTransaction");
            const existingTransaction = await transactionModel.findOne({ idempotencyKey });
            console.timeEnd("existingTransaction");

            if (existingTransaction) {
                if (existingTransaction.status === "COMPLETED") {
                    return res.status(200).json({
                        message: "Transaction already processed.",
                        transaction: existingTransaction
                    });
                }

                if (existingTransaction.status === "PENDING") {
                    return res.status(200).json({
                        message: "Transaction is still processing."
                    });
                }

                if (existingTransaction.status === "FAILED") {
                    return res.status(500).json({
                        message: "Transaction processing failed, please retry"
                    });
                }

                if (existingTransaction.status === "REVERSED") {
                    return res.status(500).json({
                        message: "The transaction was reversed, please retry."
                    });
                }
            }

            if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
                return res.status(400).json({
                    message: "Both accounts must be ACTIVE to process transaction."
                });
            }

            const balance = await fromUserAccount.getBalance();

            if (balance < amount) {
                return res.status(400).json({
                    message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
                });
            }

            let transaction;

            console.time("startSession");
            const session = await mongoose.startSession();
            console.timeEnd("startSession");

            try {
                session.startTransaction();

                console.time("createTransaction");
                transaction = (await transactionModel.create([{
                    fromAccount,
                    toAccount,
                    amount,
                    idempotencyKey,
                    status: "PENDING"
                }], { session }))[0];
                console.timeEnd("createTransaction");

                console.time("debitLedger");
                await ledgerModel.create([{
                    account: fromUserAccount._id,
                    amount,
                    transaction: transaction._id,
                    type: "DEBIT"
                }], { session });
                console.timeEnd("debitLedger");

                console.time("creditLedger");
                await ledgerModel.create([{
                    account: toUserAccount._id,
                    amount,
                    transaction: transaction._id,
                    type: "CREDIT"
                }], { session });
                console.timeEnd("creditLedger");

                console.time("updateTransaction");
                await transactionModel.findOneAndUpdate(
                    { _id: transaction._id },
                    { status: "COMPLETED" },
                    {
                        session,
                        returnDocument: 'after'
                    }
                );
                console.timeEnd("updateTransaction");

                console.time("commit");
                await session.commitTransaction();
                console.timeEnd("commit");

            } catch (error) {
                await session.abortTransaction();
                console.error("Transaction error:", error);

                if (error.code === 11000) {
                    const duplicateTransaction = await transactionModel.findOne({ idempotencyKey });
                    return res.status(200).json({
                        message: "Transaction already processed.",
                        transaction: duplicateTransaction
                    });
                }

                return res.status(500).json({
                    message: "Transaction failed due to an internal error, please retry."
                });
            } finally {
                session.endSession();
            }

            emailService
                .sendTransactionEmail(
                    req.user.email,
                    req.user.name,
                    amount,
                    toAccount
                )
                .catch(err => console.error("Email notification failed:", err));


            console.timeEnd("TOTAL");

            return res.status(201).json({
                message: "Transaction completed successfully.",
                transaction
            });
        });

    } catch (error) {
        console.error("Transfer error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
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
            {
                session,
                returnDocument: 'after'
            }
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

async function createSystemAdjustmentTransaction(req, res) {
    const { userAccount, direction, idempotencyKey, note } = req.body
    const amount = normalizeAmount(req.body.amount)

    if (!userAccount || !direction || !req.body.amount || !idempotencyKey) {
        return res.status(400).json({
            message: "userAccount, direction, amount and idempotencyKey are required."
        })
    }

    if (!["CREDIT", "DEBIT"].includes(direction)) {
        return res.status(400).json({
            message: "direction must be CREDIT (add funds) or DEBIT (remove funds)."
        })
    }

    if (!amount) {
        return res.status(400).json({
            message: "Amount must be a positive number with no more than 2 decimal places."
        })
    }

    if (!mongoose.isValidObjectId(userAccount)) {
        return res.status(400).json({ message: "userAccount must be a valid account id." })
    }

    const systemAccount = await accountModel.findOne({ user: req.user._id })

    if (!systemAccount) {
        return res.status(400).json({ message: "System account not found." })
    }

    const targetAccount = await accountModel.findOne({ _id: userAccount })

    if (!targetAccount) {
        return res.status(400).json({ message: "userAccount not found." })
    }

    if (targetAccount._id.toString() === systemAccount._id.toString()) {
        return res.status(400).json({ message: "Cannot adjust the system account itself." })
    }

    const fromAccount = direction === "CREDIT" ? systemAccount : targetAccount
    const toAccount = direction === "CREDIT" ? targetAccount : systemAccount

    if (fromAccount.status !== "ACTIVE" || toAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "Both accounts must be ACTIVE to process this adjustment."
        })
    }

    const existingTransaction = await transactionModel.findOne({ idempotencyKey })

    if (existingTransaction) {
        if (existingTransaction.status === "COMPLETED") {
            return res.status(200).json({
                message: "Adjustment already processed.",
                transaction: existingTransaction
            })
        }
        return res.status(200).json({ message: "Adjustment is still processing or previously failed." })
    }

    if (direction === "DEBIT") {

        const balance = await targetAccount.getBalance()

        if (balance < amount) {
            return res.status(400).json({
                message: `Insufficient balance on target account. Current balance is ${balance}.`
            })
        }
    }

    const session = await mongoose.startSession()
    let transaction

    try {
        session.startTransaction()

        transaction = (await transactionModel.create([{
            fromAccount: fromAccount._id,
            toAccount: toAccount._id,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], { session }))[0]

        await ledgerModel.create([{
            account: fromAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT"
        }], { session })

        await ledgerModel.create([{
            account: toAccount._id,
            amount,
            transaction: transaction._id,
            type: "CREDIT"
        }], { session })

        await transactionModel.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            {
                session,
                returnDocument: 'after'
            }
        )

        await session.commitTransaction()
    } catch (error) {
        await session.abortTransaction()
        console.error("System adjustment error:", error)

        if (error.code === 11000) {
            const duplicateTransaction = await transactionModel.findOne({ idempotencyKey })
            return res.status(200).json({
                message: "Adjustment already processed.",
                transaction: duplicateTransaction
            })
        }

        return res.status(500).json({ message: "Adjustment failed due to an internal error." })
    } finally {
        session.endSession()
    }

    // TODO: write `note`, req.user._id (operator), direction, target user etc. to a
    // dedicated audit log collection here — separate from the transaction record.
    console.log(`[AUDIT] System ${direction} of ${amount} on account ${userAccount} by operator ${req.user._id}. Note: ${note || "n/a"}`)

    return res.status(201).json({
        message: `Funds ${direction === "CREDIT" ? "credited to" : "debited from"} the account successfully.`,
        transaction
    })
}

module.exports = {
    createTransaction,
    createInitialFundTransaction,
    createSystemAdjustmentTransaction // add
}

