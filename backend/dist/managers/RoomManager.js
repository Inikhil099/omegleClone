"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let globalroomno = 0;
class RoomManager {
    constructor() {
        this.room = new Map();
    }
    createRoom(user1, user2) {
        const roomId = this.generate().toString();
        this.room.set(roomId, {
            user1,
            user2,
        });
        user1.socket.emit("send-offer", {
            roomId,
        });
    }
    onOffer(roomId, sdp, senderSocketId) {
        const room = this.room.get(roomId);
        if (!room) {
            return;
        }
        const recevingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        // const user2 = this.room.get(roomId)?.user2; //the person made the  call offer
        console.log("onoffer is running");
        recevingUser === null || recevingUser === void 0 ? void 0 : recevingUser.socket.emit("offer", {
            sdp,
            roomId,
        });
    }
    onAnswer(roomId, sdp, senderSocketId) {
        const room = this.room.get(roomId);
        if (!room) {
            return;
        }
        const recevingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        // const user1 = this.room.get(roomId)?.user1; //the person who recieved the offer for the call
        console.log("on answer is running");
        recevingUser === null || recevingUser === void 0 ? void 0 : recevingUser.socket.emit("answer", {
            sdp,
            roomId,
        });
    }
    onIceCandidate(roomId, senderSocketId, candidate, type) {
        const room = this.room.get(roomId);
        if (room) {
            console.log("inside backend icecandidate");
            const recevingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
            recevingUser.socket.emit("add-ice-candidate", { candidate, roomId });
        }
        else {
            console.log("room not found");
            return;
        }
    }
    generate() {
        return globalroomno++;
    }
}
exports.RoomManager = RoomManager;
