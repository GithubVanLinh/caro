const ObjectId = require("mongoose").Types.ObjectId;
const RoomModel = require("../models/room.model");
module.exports = {
  initRoom: async (firstPlayer, secondPlayer) => {
    return await RoomModel.create({ firstPlayer, secondPlayer });
  },
  findRoomByUserId: async (userId) => {
    const user_id = new ObjectId(userId);
    const room = await RoomModel.findOne({
      $or: [{ firstPlayer: user_id }, { secondPlayer: user_id }],
    });
    console.log("userid", user_id, "room", room);
    return room;
  },
  deleteByRoomId: async (roomId) => {
    await RoomModel.findByIdAndDelete(roomId);
  },
};
