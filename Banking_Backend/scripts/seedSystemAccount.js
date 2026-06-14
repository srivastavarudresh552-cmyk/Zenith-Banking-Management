require('dotenv').config()
const mongoose = require('mongoose')
const userModel = require('../src/models/user.model')
const accountModel = require('../src/models/account.model')

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI)

    let systemUser = await userModel.findOne({ email: 'system@bank.internal' }).select('+systemUser')

    if (!systemUser) {
        systemUser = await userModel.create({
            email: 'system@bank.internal',
            name: 'System Treasury',
            password: process.env.SYSTEM_USER_PASSWORD || 'replace-with-strong-secret',
            systemUser: true
        })
        console.log('Created system user')
    }

    let systemAccount = await accountModel.findOne({ user: systemUser._id })

    if (!systemAccount) {
        systemAccount = await accountModel.create({ user: systemUser._id })
        console.log('Created system account')
    }

    console.log('System user id:', systemUser._id.toString())
    console.log('System account id:', systemAccount._id.toString())

    await mongoose.disconnect()
}

seed().catch((err) => {
    console.error(err)
    process.exit(1)
})