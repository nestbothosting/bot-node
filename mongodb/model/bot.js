const mongoose = require("mongoose");

const BotModel = new mongoose.Schema(
  {
    bot_token: { type: String, required: true },
    bot_name: { type: String, required: true },
    owner_id: { type: String, required: true },
    st_message: { type: String, required: true, default:'nestbot.xyz' },
    subscriptions: {
      status: { type: Boolean, default: false },
      date: { type: Date, delete: Date.now },
    },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("bot", BotModel);
