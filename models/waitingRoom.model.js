const mongoose = require("mongoose");
const { Schema } = mongoose;

const waitingRoomSchema = new Schema({
  players: {
    type: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        ready: Boolean,
      },
    ],
    default: [
      { userId: null, ready: false },
      { userId: null, ready: false },
    ],
  },
  timestamp: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("WaitingRoom", waitingRoomSchema);
