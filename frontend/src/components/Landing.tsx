import { useEffect, useRef, useState } from "react";
import Room from "./Room"

const Landing = () => {
  const [name, setname] = useState<string>("");
  const [joined, setjoined] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [locaVideoTracks, setlocaVideoTracks] =
    useState<MediaStreamTrack | null>(null);
  const [localAudioTracks, setlocalAudioTracks] =
    useState<MediaStreamTrack | null>(null);

  const getMedia = async () => {
    console.log("inside getmedia")
    const stream = await window.navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    console.log("media done")
    const videoTrack = stream.getVideoTracks()[0];
    setlocaVideoTracks(videoTrack);
    const audioTrack = stream.getAudioTracks()[0];
    setlocalAudioTracks(audioTrack);
    if (!videoRef.current) {
      console.log("some error in videos ")
      return
    }
    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play();
    console.log("get media done")
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getMedia();
    }
  }, [videoRef]);

  if (!joined) {
    return (
      <div>
        <video autoPlay ref={videoRef}></video>
        <input
          type="text"
          onChange={(e) => {
            setname(e.target.value);
          }}
        />
        <button onClick={()=>{
          setjoined(true)
        }}>Join a Room</button>
      </div>
    );
  }

  return <Room name={name} localAudioTracks={localAudioTracks} localVideoTracks={locaVideoTracks}/>
};

export default Landing;
