const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  socket.on("toggle-mic", (data) => {
    socket.broadcast.emit("toggle-mic", data);
  });

  socket.on("toggle-camera", (data) => {
    socket.broadcast.emit("toggle-camera", data);
  });
});

server.listen(3001, () => console.log("Server 3001-portda ishga tushdi"));
