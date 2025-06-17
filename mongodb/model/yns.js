const mongoose = require("mongoose");

const YNSModel = new mongoose.Schema(
  {
    server_id: { type: String, required: true },
    channel_id: { type: String, required: true },
    title: { type: String, required: true },
    role_id: { type: String, required: false },
    yt_channel_id: { type: String, required: true },
    bot_token: { type: String, required: true },
    last_video_id: { type:String, required:false, default:"oooooo"},
    embed:{
        title: { type: String },
        description: { type: String },
        thumbnail_url: { type: String }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("yns", YNSModel);