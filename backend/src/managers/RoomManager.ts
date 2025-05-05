import { User } from "./UserManager";
let globalroomno = 0;

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
    // const user2 = this.room.get(roomId)?.user2; //the person made the  call offer
    console.log("onoffer is running");
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

    const recevingUser =
      room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
    // const user1 = this.room.get(roomId)?.user1; //the person who recieved the offer for the call
    console.log("on answer is running");
    recevingUser?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }

  onIceCandidate(
    roomId: string,
    senderSocketId: string,
    candidate: any,
    type: "sender" | "receiver"
  ) {
    const room = this.room.get(roomId);
    if (room) {
      console.log("inside backend icecandidate");
      const recevingUser =
        room.user1.socket.id === senderSocketId ? room.user2 : room.user1;
      recevingUser.socket.emit("add-ice-candidate", { candidate, roomId });
    }

    else{
      console.log("room not found")
      return;
    }
  }

  generate() {
    return globalroomno++;
  }
}
