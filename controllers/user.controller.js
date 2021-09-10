const UserService = require("../services/user.service");

module.exports = {
  register: async (req, res, next) => {
    const userInfo = req.body;
    try {
      const user = await UserService.createUser(userInfo);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error_message: error.message });
    }
  },
  login: async (req, res, next) => {
    const { username, password } = req.body;

    try {
      const user = await UserService.login(username, password);

      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({
        error_message: error.message,
      });
    }
  },
};
