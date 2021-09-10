const { URL } = require("url");
const Message = require("./socket_module/messase");
const UserService = require("./services/user.service");
const FindMatchService = require("./services/findMatch.service");
const JWT = require("./utils/jwt");
const WaitingRoomService = require("./services/waitingRoom.service");
const RoomService = require("./services/room.service");
const roomModel = require("./models/room.model");
const Sockets = new Map();
const Queues = new Map();

const GAMEPOINT = 10;

async function getUser(userId) {
  return await UserService.findUserByUserId(userId);
}

async function updateUserStatus(user, status) {
  await user.changeStatus(status);
}

async function handleUserOnline(ws) {
  console.log("connect to ", ws.user._id);
  if (ws.user.status !== "INGAME") {
    await updateUserStatus(ws.user, "ONLINE");
  } else {
    // Reconnect game
    // link room into ws
    const gameRoom = await RoomService.findRoomByUserId(ws.user._id);
    // send room data to user
    console.log("reconnect to ", gameRoom._id);
    ws.room = gameRoom;
    ws.turn = gameRoom.firstPlayer.toString() == ws.user._id.toString() ? 1 : 2;
    ws.send(new Message("reconnect", { room: gameRoom }, "ROOM").toString());
    console.log("sended");
  }
}

async function handleUserOffline(ws) {
  console.log("disconnect to", ws.user._id);
  console.log("user", ws.user);
  if (ws.user.status !== "INGAME") {
    // Change Status into OFFLINE
    await updateUserStatus(ws.user, "OFFLINE");

    // Remove from WaitingRoom if in wait
    if (ws.waitingRoom) {
      await WaitingRoomService.deleteWaitingRoomById(ws.waitingRoom._id);
    }

    // Remove socket
    Sockets.delete(ws.user._id.toString());
  } else {
    // console.log("Room", ws.room);
    if (ws.room.firstPlayer.toString() == ws.user._id.toString()) {
      console.log("send userID", ws.room.secondPlayer.toString());
      console.log("Sockets", Sockets);
      Sockets.get(ws.room.secondPlayer.toString()).send(
        new Message(
          "oppenentDisconnected",
          { userId: ws.user._id },
          "ROOM"
        ).toString()
      );
    } else {
      Sockets.get(ws.room.firstPlayer.toString()).send(
        new Message(
          "oppenentDisconnected",
          { userId: ws.user._id },
          "ROOM"
        ).toString()
      );
    }
  }
}

/**
 * Need trycatch
 * @param {*} ws
 */
async function handleFindMatch(ws) {
  // Check user status is ONLINE
  // Change user status to INFIND
  if (ws.user.status === "ONLINE") {
    ws.user.status = "INFIND";
    await ws.user.save();
    ws.send(new Message("findMatch", { message: "INFIND" }, "ROOM").toString());
  } else {
    throw new Error("you are not ONLINE");
  }

  /* Add to a waiting Room
    Check waiting have any room. If not create one.
    Add user to that room
   */

  const rooms = await WaitingRoomService.getAllRoom();
  if (rooms && rooms.length > 0) {
    const room = rooms[0];
    room.players.push({ userId: ws.user._id, ready: true });
    await room.save();

    // Start game
    const players = room.players;
    if (players.length === 2) {
      // init game room
      const gameRoom = await RoomService.initRoom(
        players[0].userId,
        players[1].userId
      );
      // change user status into INGAME
      // notice to users'
      const ws1 = Sockets.get(players[0].userId.toString());
      ws1.user.status = "INGAME";
      await ws1.user.save();
      delete ws1.watingRoom;
      ws1.room = gameRoom;
      ws1.turn = 1;
      ws1.send(
        new Message(
          "gameStart",
          { roomId: gameRoom._id, player: "firstPlayer" },
          "ROOM"
        ).toString()
      );
      const ws2 = Sockets.get(players[1].userId.toString());
      ws2.user.status = "INGAME";
      ws2.turn = 2;
      await ws2.user.save();
      delete ws2.watingRoom;
      ws2.room = gameRoom;
      ws2.send(
        new Message(
          "gameStart",
          { roomId: gameRoom._id, player: "secondPlayer" },
          "ROOM"
        ).toString()
      );

      // count down from 2m

      const countdown = setTimeout(async () => {
        await endgame(ws2.user._id, ws1.user._id, "timeout");
      }, 120000);
      Queues.set(ws1.room._id.toString(), countdown);

      // delete waiting room
      await WaitingRoomService.deleteWaitingRoomById(room._id);
    } else {
    }
  } else {
    const room = await WaitingRoomService.createRoom(ws.user._id);
    ws.waitingRoom = room;
  }
}

async function handleCancelFindMatch(ws, { x, y }) {
  if (ws.waitingRoom) {
    await WaitingRoomService.deleteWaitingRoomById(ws.waitingRoom._id);
    ws.send(new Message("cancelFindMatch", { message: "OK" }).toString());
    ws.user.status = "ONLINE";
    await ws.user.save();
    delete ws.waitingRoom;
  } else {
    throw new Error("You don't in find");
  }
}

async function handlePlay(ws, { x, y }) {
  //TODO check room turn, player, roomId
  if (!ws.turn || ws.turn !== ws.room.turn) {
    return ws.send(
      new Message("error", { message: "Not your turn" }, "ROOM").toString()
    );
  }

  if (ws.room.board[x][y] !== 0) {
    return ws.send(
      new Message("error", { message: "invalid point" }, "ROOM").toString()
    );
  }

  //TODO clear countdown
  clearTimeout(Queues.get(ws.room._id.toString()));

  const opponentId = getOpponentId(ws);
  const oppoWs = Sockets.get(opponentId.toString());

  //TODO update board
  // console.log("room", ws.room);
  // await ws.room.play({ x, y }, ws.turn);]

  ws.room.board[x][y] = ws.turn;
  const newBoard = ws.room.board.map((row, i) =>
    i === x ? row.map((pos, j) => (j === y ? ws.turn : pos)) : row
  );
  await roomModel.findByIdAndUpdate(ws.room._id, { board: ws.room.board });
  //TODO broadcast new Point
  oppoWs.send(new Message("opponentPlay", { x, y }, "ROOM").toString());
  oppoWs.room = ws.room; //update for other

  //TODO check endgame.
  const winner = roomModel.getWinner(ws.room.board);
  // if end: call endgame
  if (winner !== 0) {
    await endgame(ws.user._id, opponentId, "5 Point");
  } else {
    // if dont: change turn, send token turn, count down from 1p
    ws.room.turn = ws.room.turn === 1 ? 2 : 1;
    await ws.room.save();
    oppoWs.room = ws.room;
    oppoWs.send(new Message("turn", { turn: ws.room.turn }, "ROOM").toString());

    const countDown = setTimeout(async () => {
      await endgame(ws.user._id, oppoWs.user._id, "timeout");
    }, 60000);
    Queues.set(ws.room._id.toString(), countDown);
  }
}

function getOpponentId(ws) {
  if (ws.room.firstPlayer.toString() == ws.user._id.toString()) {
    return ws.room.secondPlayer;
  } else {
    return ws.room.firstPlayer;
  }
}

async function handleSurrender(ws) {
  // check players
  if (!ws.room) {
    return ws.send(
      new Message("error", { message: "you dont have a room" }).toString()
    );
  }
  // send endgame + delete room + remove room from ws + increse tropy and decrese
  const opponentId = getOpponentId(ws);

  await endgame(opponentId, ws.user._id, "surrender");
}

async function endgame(winnerId, loserId, reason) {
  // send endgame + delete room + remove room from ws + increse tropy and decrese
  // remove turn
  const winnerWs = Sockets.get(winnerId.toString());
  const loserWs = Sockets.get(loserId.toString());

  winnerWs.send(new Message("wingame", { reason: reason }, "ROOM").toString());
  loserWs.send(new Message("losegame", { reason: reason }, "ROOM").toString());

  // detete room
  await RoomService.deleteByRoomId(winnerWs.room._id);

  // remove count down;
  if (Queues.has(winnerWs.room._id.toString())) {
    clearTimeout(Queues.get(winnerWs.room._id.toString()));
  }

  // remove from ws
  delete winnerWs.room;
  delete winnerWs.turn;
  delete loserWs.room;
  delete loserWs.turn;

  // change status into "ONLINE", change point
  winnerWs.user.status = "ONLINE";
  winnerWs.user.rankPoint += GAMEPOINT;
  await winnerWs.user.save();

  loserWs.user.status = "ONLINE";
  loserWs.user.rankPoint -= GAMEPOINT;
  if (loserWs.user.rankPoint < 0) {
    loserWs.user.rankPoint = 0;
  }
  await loserWs.user.save();
}

async function initWS(ws, token) {
  const payload = JWT.verify(token);
  ws._id = payload._id;
  const user = await getUser(ws._id);
  ws.user = user;
}

async function handleAcceptMatch(ws) {
  await WaitingRoomService.acceptMatch(ws.room._id, ws._id);
}

async function handleCancelMatch(ws) {}

module.exports = (wss) => {
  wss.on("connection", async function connection(ws, req) {
    const url = new URL(req.url, "http://chessgame.vn/");
    const token = url.searchParams.get("token");

    try {
      await initWS(ws, token);
      await handleUserOnline(ws);
      Sockets.set(ws.user._id.toString(), ws);
      ws.send(new Message("userInfo", ws.user, "PERSONAL").toString());

      ws.on("message", async (m) => {
        try {
          const message = new Message(m.toString());
          console.log(message);
          try {
            switch (message.key) {
              case "ping":
                ws.send(
                  new Message("ping", { ping: "pong" }, "PERSONAL").toString()
                );
                break;
              case "getUserInfo":
                ws.send(
                  new Message("userInfo", ws.user, "PERSONAL").toString()
                );
                break;
              case "findMatch":
                await handleFindMatch(ws);
                break;
              case "cancelFindMatch":
                await handleCancelFindMatch(ws);
                break;
              case "play":
                await handlePlay(ws, message.payload);

                // if (message.type === "ROOM") {
                //   await handlePlay(ws);
                // }
                break;
              case "surrender":
                if (message.type === "ROOM") {
                  await handleSurrender(ws);
                }
                break;
              // case "acceptMatch":
              //   handleAcceptMatch(ws);
              //   break;
              // case "cancelMatch":
              //   handleCancelMatch(ws);
              //   break;
              default:
                ws.send(
                  new Message(
                    "error",
                    { error: "not found" },
                    "PERSONAL"
                  ).toString()
                );
                break;
            }
          } catch (error) {
            ws.send(
              new Message(
                "error",
                { message: error.message },
                "ROOM"
              ).toString()
            );
          }
        } catch (error) {
          console.log(m.toString());
          console.log("error", error);
          ws.send(JSON.stringify({ error: "wrongs type" }));
        }
      });

      ws.on("close", () => {
        handleUserOffline(ws);
      });
    } catch (error) {
      console.log("error", error);
      ws.send(
        new Message("error", { error: error.message }, "PERSONAL").toString()
      );
      ws.close();
    }
  });
};
