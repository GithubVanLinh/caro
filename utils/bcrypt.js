const bcrypt = require("bcrypt");

module.exports = {
  /**
   * hash a string using bcrypt
   * @param {string} payload
   */
  hash: (payload) => {
    const hashed = bcrypt.hashSync(payload, +process.env.HASH_ROUND);
    return hashed;
  },

  /**
   * compare string and encript
   * @param {string} des need compare
   * @param {string} src encript
   * @returns {bool} true if equal
   */
  compare: (des, src) => {
    return bcrypt.compareSync(des, src);
  },
};
