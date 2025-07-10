import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import client from "./src/redisClient.js";
import { handleSocketConnection } from "./src/socketRoutes.js";
import cors from "cors";
import 'dotenv/config';

const app = express();

// Enable CORS middleware for express routes (including your "/")
app.use(cors({
  origin: process.env.PUBLIC_WEBSOCKET_URL || "http://localhost:8080",
  credentials: true,
}));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.PUBLIC_WEBSOCKET_URL || "http://localhost:8080"
  }
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("Username is required"));
  }
  socket.username = username;
  next();
});

client.connect()
  .then(() => console.log("database connected"))
  .catch((err) => console.log("error connecting to database", err));

io.on("connection", (socket) => {
  handleSocketConnection(io, socket);
});
httpServer.listen(process.env.PORT, () => console.log("port running at", process.env.PORT));
