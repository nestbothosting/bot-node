const mongoose = require('mongoose')

const WarnModel = new mongoose.Schema({
    guildId: { type:String, required: true },
    userid: { type:String, required: true },
    warnings: [
        {
            moderatorid: { type:String, required: true },
            reason: { type:String, required: true },
            date: { type: Date, default: Date.now }
        }
    ]
})

module.exports = mongoose.model("warn",WarnModel)