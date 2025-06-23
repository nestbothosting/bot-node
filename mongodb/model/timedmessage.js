const mongoose = require("mongoose");

const TimedMessageModel = new mongoose.Schema(
  {
    server_id: { type: String, required: true },
    channel_id: { type: String, required: true },
    looptime: { type: Number, required: true },
    message: { type: String, required: true },
    bot_id: { type: String, required:true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("timedmessage", TimedMessageModel);