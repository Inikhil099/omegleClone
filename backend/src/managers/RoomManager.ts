import { User } from "./UserManager";
let globalroomno = 1;

interface Room {
  user1: User;
  user2: User;
}

export class RoomManager {
  private room: Map<string, Room>;
  constructor() {
    this.room = new Map<string, Room>();
  }

  createRoom(user1: User, user2: User) {
    const roomId = this.generate().toString();
    this.room.set(roomId, {
      user1,
      user2,
    });

    user1.socket.emit("send-offer", {
      roomId,
    });
  }

  onOffer(roomId: string, sdp: string, senderSocketId: string) {
    const room = this.room.get(roomId);
    if (!room) {
      return;
    }
    const recevingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    recevingUser?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }

  onAnswer(roomId: string, sdp: string, senderSocketId: string) {
    const room = this.room.get(roomId);
    if (!room) {
      return;
    }

    const recevingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    recevingUser?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }

  onIceCandidate(
    candidate: any,
    roomId: string,
    senderSocketId: string,
    type: "sender" | "receiver"
  ) {
    const room = this.room.get(roomId);
    if (!room) {
      return;
    }

    console.log("got it")
    const recevingUser = room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    recevingUser.socket.emit("add-ice-candidate", { candidate, roomId,type });

  }

  generate() {
    return globalroomno++;
  }
}
