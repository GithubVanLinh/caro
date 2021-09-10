const Socket = require("./socket");

module.exports = {
  ws: (ws, user) => {
    const socket = new Socket(ws, user);
    return socket;
  },
};
