const mongoose = require("mongoose");

const TicketModel = new mongoose.Schema(
  {
    server_id: { type: String, required: true },
    channel_id: { type: String, required: true },
    embed: { type: Object, required: true },
    permissions: { type: Object, required: false, },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("ticket", TicketModel);