import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";

export interface User {
    socket:Socket;
    name:string;
}

export class UserManager{
    private users:User[]
    private queue:string[]
    private roomManager:RoomManager;
    constructor(){
        this.users = []
        this.queue = []
        this.roomManager = new RoomManager();
    }

    addUser(name:string ,socket:Socket){
        this.users.push({
            name,socket
        })
        this.queue.push(socket.id)
        socket.emit("lobby")
        this.clearqueue();
        this.initHandler(socket);
    }

    removeUser(socketId:string){
        const user = this.users.find(x => x.socket.id === socketId)
        this.users = this.users.filter(e => e.socket.id !== socketId)
        this.queue = this.queue.filter(e => e === socketId) 
    }


    clearqueue(){
        console.log("length is",this.queue.length)
        if (this.queue.length < 2) {
            return;
        }

        const id1 = this.queue.pop()
        const id2 = this.queue.pop()
        const user1 = this.users.find(e => e.socket.id === id1 )
        const user2 = this.users.find(e => e.socket.id === id2 )

        if(!user1 || !user2){
            return;
        }

        const room = this.roomManager.createRoom(user1,user2)
        this.clearqueue()
    }

    initHandler(socket:Socket){
        socket.on("offer",({sdp,roomId}:{sdp:string,roomId:string})=>{
            this.roomManager.onOffer(roomId,sdp,socket.id)
        })

        socket.on("answer",({sdp,roomId}:{sdp:string,roomId:string})=>{
            
            
            this.roomManager.onAnswer(roomId,sdp,socket.id)
        })

        socket.on("add-ice-candidate",({candidate,roomId,type})=>{
            this.roomManager.onIceCandidate(candidate,roomId,socket.id,type)
        })
    }



}