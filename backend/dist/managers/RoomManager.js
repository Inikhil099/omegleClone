"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
let globalroomno = 1;
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
        recevingUser === null || recevingUser === void 0 ? void 0 : recevingUser.socket.emit("answer", {
            sdp,
            roomId,
        });
    }
    onIceCandidate(candidate, roomId, senderSocketId, type) {
        const room = this.room.get(roomId);
        if (!room) {
            return;
        }
        console.log("got it");
        const recevingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
        recevingUser.socket.emit("add-ice-candidate", { candidate, roomId, type });
    }
    generate() {
        return globalroomno++;
    }
}
exports.RoomManager = RoomManager;
