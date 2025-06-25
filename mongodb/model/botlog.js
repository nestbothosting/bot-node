const mongoose = require("mongoose");

const BotLogModel = new mongoose.Schema(
    {
        bot_cid: { type: String, required: true },
        bot_log: [{
            date: { type: String, required: true },
            message: { type: String, required: true },
            action: { type: String, required: true },
        }]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("botlog", BotLogModel);
