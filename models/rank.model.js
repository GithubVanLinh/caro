const mongoose = require("mongoose");
const { Schema } = mongoose;

const rankSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  rankPoint: {
    type: Number,
    default: 0,
    min: 0,
  },
});

module.exports = mongoose.model("Rank", rankSchema);
