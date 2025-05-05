import { Server, Socket } from "socket.io"
import http from "http"
import express from "express"
import { UserManager } from "./managers/UserManager";
const PORT = 3000;

const app = express();
const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin:"*"
    }
});

const userManager = new UserManager();


io.on("connection",(socket:Socket)=>{
    console.log("A user connected")
    userManager.addUser("randomUser",socket)
    socket.on("disconnect",()=>{
        console.log("user disconnected")
        userManager.removeUser(socket.id)
    })
})

server.listen(PORT,()=>{
    console.log("app running on port " ,PORT)
})




