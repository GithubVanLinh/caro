const randomstring = require("randomstring");
const Message = require("./messase");

class Socket {
  constructor(ws, user) {
    this.ws = ws;
    this.user = user;
    this._id = user._id;
  }

  /**
   *
   * @param {String} key
   * @param {Function} callback
   */
  on(key, callback) {
    switch (key) {
      case "close":
        this.ws.on(key, callback);
        break;
      default:
        this.ws.on("message", (message) => {
          callback();
        });
        break;
    }
    // this.ws.on(key, (message) => {
    //   if (key === "close") {
    //     callback(message);
    //   } else {
    //     try {
    //       const mMessage = new Message(message);
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   }
    // });
  }

  /**
   *
   * @param {String} key
   * @param {Object} message
   */
  send(key, message) {
    switch (key) {
      case "pong":
        this.ws.send("pong");
        break;
      default:
        const mes = new Message(message, this._id);
        this.ws.send(
          JSON.stringify({
            key: key,
            ...mes,
          })
        );
        break;
    }
  }
}

module.exports = Socket;
