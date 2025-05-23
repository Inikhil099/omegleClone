"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const UserManager_1 = require("./managers/UserManager");
const PORT = 3000;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*"
    }
});
const userManager = new UserManager_1.UserManager();
io.on("connection", (socket) => {
    console.log("A user connected");
    userManager.addUser("randomUser", socket);
    socket.on("disconnect", () => {
        console.log("user disconnected");
        userManager.removeUser(socket.id);
    });
});
server.listen(PORT, () => {
    console.log("app running on port ", PORT);
});
