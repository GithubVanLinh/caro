require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const http = require("http");
const cors = require("cors");

// const { WebSocketServer } = require("ws");

const app = express();
const server = http.createServer(app);
const mongoose = require("mongoose");
// mongoose.connect("mongodb+srv://abc");
require("./configs/db.config");

const ws = require("ws");
const wss = new ws.Server({ server });

require("./socket")(wss);

// app.set("view engine", "ejs");

app.use(cors());

app.use(express.json());
app.use(morgan("dev"));

// app.use("/", (req, res, next) => {
//   res.render("index");
// });

const userRoute = require("./routes/user.route");

app.use("/users", userRoute);

app.use((req, res, next) => {
  res.status(404).json({
    message: "not found",
  });
});

app.use((err, req, res, next) => {
  console.log(err);
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
