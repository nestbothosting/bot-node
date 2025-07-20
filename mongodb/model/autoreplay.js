const mongoose = require("mongoose");

const AutoReplayModel = new mongoose.Schema(
  {
    server_id: { type: String, required: true },
    server_name: { type: String, required: true },
    message_key: { type: String, required: true },
    message_value: { type: String, required: true },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("autoreplay", AutoReplayModel);
