const mongoose = require("mongoose");

const WelcomeLeaveMessageModel = new mongoose.Schema(
  {
    server_id: { type: String, required: true, unique: true },
    bot_id: { type: String, required: true },

    Iswelcome: { type: Boolean },
    welcome_message: { type: String },
    wl_channel_id: { type: String },
    wl_isEmbed: { type: Boolean, default: false },
    wl_embed: { type:Object },

    isleave: { type: Boolean },
    leave_message: { type: String },
    lv_channel_id: { type: String },
    lv_isEmbed: { type: Boolean, default: false },
    lv_embed: { type:Object },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("wel_lea_mess", WelcomeLeaveMessageModel);