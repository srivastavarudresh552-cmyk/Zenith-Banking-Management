const mongoose = require("mongoose")


function connectToDB() {
    mongoose.connect(process.env.MONGODB_URI)
    .then (() => {
        console.log("Server is connected to DB");
    })
    .catch(err => {
        console.error("error connecting to DB", err);
        process.exit(1)
    })
}

module.exports = connectToDB