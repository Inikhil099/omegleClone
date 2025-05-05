import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const URL = "http://localhost:3000";

const Room = ({
  name,
  localAudioTracks,
  localVideoTracks,
}: {
  name: string;
  localAudioTracks: MediaStreamTrack | null;
  localVideoTracks: MediaStreamTrack | null;
}) => {
  const [serachparams, setserachparams] = useSearchParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lobby, setlobby] = useState(true);
  const [sendingPc, setsendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setreceivingPc] = useState<null | RTCPeerConnection>(
    null
  );
  const [remoteVideoTracks, setremoteVideoTracks] =
    useState<MediaStreamTrack | null>(null);
  const [remoteAudioTracks, setremoteAudioTracks] =
    useState<MediaStreamTrack | null>(null);
  const [RemoteMediaStream,setRemoteMediaStream] = useState<MediaStream|null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement|null>(null)
  const localvideoref = useRef<HTMLVideoElement | null>(null)




  useEffect(() => {
    const socket = io(URL);
    socket.on("send-offer", async ({ roomId }) => {
      const pc = new RTCPeerConnection();
      setsendingPc(pc);
      if (localVideoTracks) {
        pc.addTrack(localVideoTracks)
      }

      if (localAudioTracks) {
        
        pc.addTrack(localAudioTracks)
      }

      pc.onicecandidate = async(e)=>{
        if(!e.candidate){
          return;
        }
        if(e.candidate){
          socket.emit("add-ice-candidate",{
            candidate : e.candidate,
            type:"sender",
            roomId
          })
        }
      }

      pc.onnegotiationneeded = ()=>{
       setTimeout(async() => {
        const sdp = await pc.createOffer();
        // @ts-ignore 
        pc.setLocalDescription(sdp)
        socket.emit("offer", { 
          roomId,
          sdp,
        }); 
       }, 1000);
      }
      
    });

    socket.on("offer", async ({ roomId, sdp:remotesdp }) => {
      setlobby(false);
      const pc = new RTCPeerConnection();
      await pc.setRemoteDescription(remotesdp);
      const sdp = await pc.createAnswer();
      // @ts-ignore
      pc.setLocalDescription(sdp)
      const stream = new MediaStream()
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteMediaStream(stream)
      setreceivingPc(pc);


      pc.onicecandidate = async(e)=>{
        if(!e.candidate){
          return;
        }
          if (e.candidate) {
            socket.emit("add-ice-candidate",{
              candidate : e.candidate,
              type:"receiver",
              roomId
            })
          }
      }


      pc.ontrack = (e) => {
        const { track, type } = e;
        console.error("inside on track")
        if (type == "audio") {
          // setremoteAudioTracks(track);
          // @ts-ignore
          remoteVideoRef.current?.srcObject.addTrack(track)
        } else {
          // @ts-ignore
          remoteVideoRef.current?.srcObject.addTrack(track)
          // setremoteVideoTracks(track);
        }
        // @ts-ignore 
        remoteVideoRef.current.play()
      };

      socket.emit("answer", {
        roomId,
        sdp: sdp,
      });
    });

    socket.on("answer", ({ roomId, sdp:remotesdp }) => {
      setlobby(false);
      setsendingPc((pc) => {
        pc?.setRemoteDescription(remotesdp);
        return pc;
      });
      console.log("loop closed")
    });


    socket.on("lobby", () => {
      setlobby(true);
    });


    socket.on("add-ice-candidate",({candidate,type})=>{
      if (type == "sender") {
        setreceivingPc(pc=>{
          pc?.addIceCandidate(candidate)
          return pc;
        })
      } else {
        setsendingPc(pc=>{
          pc?.addIceCandidate(candidate)
          return pc;
        })
      }
    })

    setSocket(socket);
  }, [name]);

  useEffect(() => {
    if (localvideoref.current) {
      if(localVideoTracks){
        localvideoref.current.srcObject = new MediaStream([localVideoTracks]);
      }
      localvideoref.current.play()
    }

  }, [localvideoref])
  

  return (
    <div>
      Hi {name} you are in a videoChat Room
      <video autoPlay width={400} height={400} ref={localvideoref}></video>
      {lobby?"waiting for someone to connect":null}
      <video autoPlay width={400} height={400} ref={remoteVideoRef}></video>
    </div>
  );
};

export default Room;
