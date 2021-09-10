const mongoose = require("mongoose");
const { Schema } = mongoose;

const findMatchSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  statusbar: {
    type: String,
    default: "INFIND",
    enum: ["INFIND", "INMATCH"],
  },
});

module.exports = mongoose.model("FindMatch", findMatchSchema);
