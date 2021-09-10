const jwt = require("jsonwebtoken");

class Message {
  /**
   *
   * @param {String} key key|Jsonstring
   * @param {Json} payload data
   * @param {String} type ROOM|PERSONAL
   */
  constructor(key, payload, type) {
    if (arguments.length === 1) {
      const decode = JSON.parse(key);
      this.key = decode.key;
      this.payload = decode.payload;
      this.type = decode.type || "PERSONAL";
    } else {
      this.key = key;
      this.payload = payload;
      this.type = type || "PERSONAL";
    }
  }

  toString() {
    return JSON.stringify(this);
  }

  verify() {
    try {
      const decode = jwt.verify(this.token, process.env.SECRET_KEY);
      if (decode.id === this.from) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }
}

module.exports = Message;
