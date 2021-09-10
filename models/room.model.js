const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomSchema = new Schema({
  firstPlayer: { type: Schema.Types.ObjectId, ref: "User" },
  secondPlayer: { type: Schema.Types.ObjectId, ref: "User" },
  turn: {
    type: Number,
    default: 1,
    enum: [1, 2],
  },
  status: {
    type: String,
    default: "WAIT",
    enum: ["INGAME", "WAIT"],
  },
  board: {
    type: [[Number]],
    default: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
});

roomSchema.methods.deleteRoom = async () => {
  await mongoose.model("Room").findByIdAndDelete(this._id);
};

roomSchema.methods.play = async ({ x, y }, number) => {
  console.log("board", this.board);
  this.board[x][y] = number;
  await this.save();
};

// return 0 if not end
roomSchema.statics.getWinner = (board) => {
  const winner = getWinner(board);
  return winner;
};

module.exports = mongoose.model("Room", roomSchema);

function getWinner(board) {
  const rowBoard = [
    ...board,
    ...colToRow(board),
    ...isSameLDia(board),
    ...isSameRDia(board),
  ];

  for (let i = 0; i < rowBoard.length; i++) {
    const number = isFiveSameNumber(rowBoard[i]);
    if (number !== 0) {
      return number;
    }
  }

  return 0;
}

function colToRow(board) {
  const arr = [];
  for (let i = 0; i < board.length; i++) {
    arr[i] = [];
    for (let j = 0; j < board[i].length; j++) {
      arr[i].push(board[j][i]);
    }
  }
  return arr;
}

function isSameRDia(board) {
  const xlen = board[0].length;
  const ylen = board.length;
  const arr = [];

  for (i = 4; i < xlen - 1; i++) {
    const sub = [];
    for (j = 0; j < i + 1; j++) {
      sub.push(board[i - j][j]);
    }
    arr.push(sub);
  }

  for (i = 0; i < ylen - 4; i++) {
    const sub = [];
    for (j = ylen - 1; j >= i; j--) {
      sub.push(board[ylen - 1 - j + i][j]);
    }
    arr.push(sub);
  }
  return arr;
}

function isSameLDia(board) {
  const xlen = board[0].length;
  const ylen = board.length;
  const arr = [];

  for (i = 1; i < ylen - 4; i++) {
    const sub = [];
    for (j = 0; j < ylen - i; j++) {
      sub.push(board[i + j][j]);
    }
    arr.push(sub);
  }

  for (i = 0; i < xlen - 4; i++) {
    const sub = [];
    for (j = 0; j < xlen - i; j++) {
      sub.push(board[j][i + j]);
    }
    arr.push(sub);
  }
  return arr;
}

function isFiveSameNumber(arr) {
  let i = 0;
  while (i < arr.length - 4) {
    if (arr[i] !== 0) {
      let count = 0;

      for (let j = 1; j < 5; j++) {
        if (arr[i] === arr[i + j]) {
          count++;
        } else {
          break;
        }
      }
      if (
        count >= 4 &&
        (i === 0 ||
          i === arr.length - 5 ||
          arr[i - 1] === 0 ||
          arr[i + 5] === 0)
      ) {
        return arr[i];
      } else {
        i += count + 1;
      }
    } else {
      i++;
    }
  }

  return 0;
}
