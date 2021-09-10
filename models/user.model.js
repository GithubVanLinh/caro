const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
  rfToken: String,
  money: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ["OFFLINE", "ONLINE", "INROOM", "INFIND", "INMATCH", "INGAME"],
    default: "OFFLINE",
  },
  rankPoint: {
    type: Number,
    min: 0,
    default: 0,
  },
});

userSchema.methods.plusMoney = async function (money) {
  if (money < 0 && this.money + money < 0) {
    throw new Error("not enough money");
  }
  this.money += money;
  // await mongoose
  //   .model("User")
  //   .findByIdAndUpdate(this._id, { money: this.money });
  await this.save();
  return this;
};

/**
 * change user status
 * @param {String} status
 * @returns user
 */
userSchema.methods.changeStatus = async function (status) {
  this.status = status;
  await this.save();
  return this;
};

module.exports = mongoose.model("User", userSchema);
