import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const io = SocketIO(httpServer);

io.on("connection", (socket) => {
  socket.nickname = "Guest";

  socket.onAny((event) => {
    console.log("Socket Event", event);
  });

  socket.on("join", (roomName) => {
    socket.join(roomName);
    socket.nsp.to(roomName).emit("message", `${socket.nickname} joined the room.`);
  });
  socket.on("leave", (roomName) => {
    socket.to(roomName).emit("message", `${socket.nickname} left the room.`);
    socket.leave(roomName);
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => {
      socket.to(room).emit("message", `${socket.nickname} disconnected.`);
    });
  });

  socket.on("message", (message, roomName) => {
    socket.to(roomName).emit("message", `${socket.nickname}: ${message}`);
  });
  socket.on("name", (nickname) => {
    socket.nickname = nickname;
  });
});

httpServer.listen(3000, (err) => {
  if (err) console.error(err);
  else console.log("Server listening on port 3000");
});
