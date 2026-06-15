const accountModel = require("../models/account.model")
const ledgerModel = require("../models/ledger.model")
const userModel = require("../models/user.model")


async function createAccountController(req, res) {
    const user = req.user;

    const account = await accountModel.create({
        user: user._id
    })

    res.status(201).json({
        account
    })
}

async function getUserAccountController(req, res) {

    const accounts = await accountModel.find({ user: req.user._id }).lean();
    const accountIds = accounts.map((account) => account._id)

    // In getUserAccountController, after building balanceByAccountId:
    accounts: accounts.map((account) => ({
        ...account,
        balance: balanceByAccountId.get(account._id.toString()) ?? 0
        // Note: system account won't appear here since it's filtered by req.user._id
    }))

    const balanceRows = await ledgerModel.aggregate([
        { $match: { account: { $in: accountIds } } },
        {
            $group: {
                _id: "$account",
                totalDebit: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0]
                    }
                }
            }
        },
        {
            $project: {
                balance: { $subtract: ["$totalCredit", "$totalDebit"] }
            }
        }
    ])

    const balanceByAccountId = new Map(
        balanceRows.map((row) => [row._id.toString(), row.balance])
    )

    res.status(200).json({
        accounts: accounts.map((account) => ({
            ...account,
            balance: balanceByAccountId.get(account._id.toString()) || 0
        }))
    })

}

async function getAccountBalanceController(req, res) {
    const { accountId } = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })

    if (!account) {
        return res.status(404).json({
            message: "Account not found"
        })
    }

    // const balance = await accountModel.getBalance(account._id);
    const balance = await account.getBalance();

    res.status(200).json({
        accountId: account._id,
        balance: balance,
        message: "Account balance retrieved successfully"
    })
}



function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function searchAccountsController(req, res) {
    const { query } = req.query

    if (!query || query.trim().length < 3) {
        return res.status(400).json({
            message: "Search query must be at least 3 characters."
        })
    }

    const safeQuery = escapeRegex(query.trim())

    const users = await userModel.find({
        _id: { $ne: req.user._id },
        $or: [
            { email: safeQuery.toLowerCase() },
            { name: { $regex: safeQuery, $options: "i" } }
        ]
    }).limit(10).select("_id name")

    if (users.length === 0) {
        return res.status(200).json({ accounts: [] })
    }

    const userIds = users.map((u) => u._id)
    const nameById = new Map(users.map((u) => [u._id.toString(), u.name]))

    const accounts = await accountModel.find({
        user: { $in: userIds },
        status: "ACTIVE"
    }).select("_id user")

    const results = accounts.map((account) => ({
        accountId: account._id,
        ownerName: nameById.get(account.user.toString())
    }))

    res.status(200).json({ accounts: results })
}

async function getAllAccountsController(req, res) {
    const accounts = await accountModel.find().populate("user", "name email").lean()

    const accountIds = accounts.map((account) => account._id)

    const balanceRows = await ledgerModel.aggregate([
        { $match: { account: { $in: accountIds } } },
        {
            $group: {
                _id: "$account",
                totalDebit: { $sum: { $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0] } },
                totalCredit: { $sum: { $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0] } }
            }
        },
        { $project: { balance: { $subtract: ["$totalCredit", "$totalDebit"] } } }
    ])

    const balanceByAccountId = new Map(balanceRows.map((row) => [row._id.toString(), row.balance]))

    res.status(200).json({
        accounts: accounts.map((account) => ({
            _id: account._id,
            status: account.status,
            currency: account.currency,
            owner: account.user, // { _id, name, email }
            balance: balanceByAccountId.get(account._id.toString()) || 0
        }))
    })
}



module.exports = {
    createAccountController,
    getUserAccountController,
    getAccountBalanceController,
    searchAccountsController,
    getAllAccountsController // add
}

