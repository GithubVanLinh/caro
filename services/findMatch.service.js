const FindMatchModel = require("../models/findMatch.model");
const WaitingRoomModel = require("../models/waitingRoom.model");
module.exports = {
  createFindMatchRequest: async (userId) => {
    const user = await FindMatchModel.findOne({ userId });
    console.log("user", user);
    if (user) {
      throw new Error("userId exists");
    }
    await FindMatchModel.create({ userId });
  },
  getMatching: async () => {
    const matchs = await FindMatchModel.find({});
    console.log("matchs", matchs);
    const index = Math.floor(matchs.length / 2);
    const list = [];
    if (index > 0) {
      for (i = 0; i < index; i++) {
        const position = i * 2;
        try {
          const firstPlayerId = matchs[position].userId;
          const secondPlayerId = matchs[position + 1].userId;

          const room = await WaitingRoomModel.create({
            firstPlayer: firstPlayerId,
            secondPlayer: secondPlayerId,
          });

          list.push({
            player: [firstPlayerId, secondPlayerId],
            room: room,
          });
        } catch (error) {
          console.log("error", error);
        }
      }
    }
    return list;
  },
};
