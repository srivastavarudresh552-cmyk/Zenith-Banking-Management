const accountModel = require("../models/account.model")
const ledgerModel = require("../models/ledger.model")


async function createAccountController(req, res) {
    const user = req.user;

    const account = await accountModel.create({
        user : user._id
    })

    res.status(201).json({
        account
    })
}

async function getUserAccountController(req , res){

    const accounts = await accountModel.find({user: req.user._id}).lean();
    const accountIds = accounts.map((account) => account._id)

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

async function getAccountBalanceController(req,res){
    const {accountId} = req.params;

    const account = await accountModel.findOne({
        _id: accountId,
        user: req.user._id
    })

    if(!account) {
        return res.status(404).json({
            message : "Account not found"
        })
    }

    // const balance = await accountModel.getBalance(account._id);
    const balance = await account.getBalance();

    res.status(200).json({
        accountId : account._id,
        balance : balance,
        message : "Account balance retrieved successfully"
    })
}

module.exports = {
    createAccountController,
    getUserAccountController,
    getAccountBalanceController
}

 
