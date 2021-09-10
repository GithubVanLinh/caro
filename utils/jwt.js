const jwt = require("jsonwebtoken");

module.exports = {
  sign: (payload) => {
    return jwt.sign(payload, process.env.SECRET_KEY);
  },
  verify: (token) => {
    return jwt.verify(token, process.env.SECRET_KEY);
  },
};
