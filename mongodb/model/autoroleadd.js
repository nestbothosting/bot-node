const mongoose = require("mongoose");

const AutoRoleAddModel = new mongoose.Schema(
  {
    server_id: { type: String, required: true },
    role_id: { type: String, required: true },
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("autoroleadd", AutoRoleAddModel);
