const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();

const server = createServer(app);

const io = new Server(server ,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("chat_message", (msg) => {
    console.log("message: ", msg);
    io.emit("chat_message", msg);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});


server.listen(3000,()=>{
    console.log("listening on *:3000");
})