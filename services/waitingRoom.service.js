const WaitingRoom = require("../models/waitingRoom.model");
module.exports = {
  createRoom: async (firstPlayer) => {
    return await WaitingRoom.create({
      players: [{ userId: firstPlayer, ready: true }],
    });
  },
  acceptMatch: async (roomId, userId) => {
    const room = await WaitingRoom.findById(roomId);
    if (room.firstPlayer === userId) {
      room.firstPlayerReady = true;
    } else {
      room.secondPlayerReady = true;
    }
    await room.save();
  },
  getAllRoom: async () => {
    return await WaitingRoom.find({});
  },
  deleteWaitingRoomById: async (id) => {
    return await WaitingRoom.findByIdAndDelete(id);
  },
};
