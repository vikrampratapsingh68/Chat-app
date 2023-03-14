const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const {
  generatemessage,
  generatelocationmessage,
} = require("./utils/messages");
const {
  adduser,
  removeuser,
  getuser,
  getusersinroom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicdirpath = path.join(__dirname, "../public");

app.use(express.static(publicdirpath));

io.on("connection", (socket) => {
  console.log("New websocket connection");

  socket.on("join", (options, callback) => {
    const { error, user } = adduser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit(
      "message",
      generatemessage("Vikram Pratap singh", "Welcomes! you to the chat app")
    );
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generatemessage("Vikram Pratap singh", user.username + " has joined the chat")
      );
    io.to(user.room).emit("roomdata", {
      room: user.room,
      users: getusersinroom(user.room),
    });

    callback();
  });

  socket.on("sendmessage", (message, callback) => {
    const user = getuser(socket.id);

    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("bad words are not allowed");
    }

    io.to(user.room).emit("message", generatemessage(user.username, message));
    callback();
  });
  socket.on("sendlocation", (coords, callback) => {
    const user = getuser(socket.id);

    io.to(user.room).emit(
      "locationmessage",
      generatelocationmessage(
        user.username,
        "https://google.com/maps?q=" + coords.lattitude + "," + coords.longitude
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeuser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generatemessage(
          "Vikram Pratap singh",
          user.username + " left the chat , daffa hogaye"
        )
      );
      io.to(user.room).emit("roomdata", {
        room: user.room,
        users: getusersinroom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log("server is up on port " + port);
});
