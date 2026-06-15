const accountModel = require("../models/account.model")
const ledgerModel = require("../models/ledger.model")
const userModel = require("../models/user.model")

async function createAccountController(req, res) {
    try {
        const user = req.user;
        const account = await accountModel.create({ user: user._id })
        res.status(201).json({ account })
    } catch (err) {
        console.error("createAccountController error:", err)
        res.status(500).json({ message: "Failed to create account" })
    }
}

async function getUserAccountController(req, res) {
    try {
        const accounts = await accountModel.find({ user: req.user._id }).lean();
        const accountIds = accounts.map((account) => account._id);

        const balanceRows = await ledgerModel.aggregate([
            { $match: { account: { $in: accountIds } } },
            {
                $group: {
                    _id: "$account",
                    totalDebit: {
                        $sum: { $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0] }
                    },
                    totalCredit: {
                        $sum: { $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0] }
                    }
                }
            },
            {
                $project: {
                    balance: { $subtract: ["$totalCredit", "$totalDebit"] }
                }
            }
        ]);

        const balanceByAccountId = new Map(
            balanceRows.map((row) => [row._id.toString(), row.balance])
        );

        res.status(200).json({
            accounts: accounts.map((account) => ({
                ...account,
                balance: balanceByAccountId.get(account._id.toString()) ?? 0
            }))
        });
    } catch (err) {
        console.error("getUserAccountController error:", err);
        res.status(500).json({ message: "Failed to fetch accounts" });
    }
}

async function getAccountBalanceController(req, res) {
    try {
        const { accountId } = req.params;
        const account = await accountModel.findOne({
            _id: accountId,
            user: req.user._id
        })
        if (!account) {
            return res.status(404).json({ message: "Account not found" })
        }
        const balance = await account.getBalance();
        res.status(200).json({
            accountId: account._id,
            balance: balance,
            message: "Account balance retrieved successfully"
        })
    } catch (err) {
        console.error("getAccountBalanceController error:", err)
        res.status(500).json({ message: "Failed to get balance" })
    }
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

async function searchAccountsController(req, res) {
    try {
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
    } catch (err) {
        console.error("searchAccountsController error:", err)
        res.status(500).json({ message: "Search failed" })
    }
}

async function getAllAccountsController(req, res) {
    try {
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
                owner: account.user,
                balance: balanceByAccountId.get(account._id.toString()) || 0
            }))
        })
    } catch (err) {
        console.error("getAllAccountsController error:", err)
        res.status(500).json({ message: "Failed to fetch all accounts" })
    }
}

module.exports = {
    createAccountController,
    getUserAccountController,
    getAccountBalanceController,
    searchAccountsController,
    getAllAccountsController
}