const User = require("../models/user.model");
const Bcrypt = require("../utils/bcrypt");
const JWT = require("../utils/jwt");

module.exports = {
  /**
   * require try catch
   * @param {object} userInfo {username and password}
   * @returns {object}
   */
  createUser: async (userInfo) => {
    const { username, password } = userInfo;
    if (!username || !password) {
      throw new Error("missing username or password");
    }
    const user = await User.findOne({ username: username });
    if (user) {
      throw new Error("Username is used");
    } else {
      const hashPass = Bcrypt.hash(password);
      const result = await User.create({
        username,
        password: hashPass,
        rfToken: "",
      });
      return result;
    }
  },

  /**
   * require try catch
   * @param {string} username
   * @param {string} password
   */
  login: async (username, password) => {
    const user = await User.findOne({ username: username });
    if (!user) {
      throw new Error("username is not used");
    }

    const isValidPassword = Bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("wrong password");
    }

    const token = JWT.sign({ username: user.username, _id: user._id });
    await User.findByIdAndUpdate(user._id, { rfToken: token });
    const returnUser = user;
    returnUser.password = "";
    returnUser.rfToken = token;
    return returnUser;
  },
  findUserByUsername: async (username) => {
    const user = await User.findOne({ username: username });
    return user;
  },
  findUserByUserId: async (userId) => {
    const user = await User.findById(userId);
    return user;
  },
};
