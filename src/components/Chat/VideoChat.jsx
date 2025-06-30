// 📁 src/components/VideoChat.jsx
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";
import {
  PiVideoCameraDuotone,
  PiVideoCameraSlashDuotone,
} from "react-icons/pi";
import { CiMicrophoneOn, CiMicrophoneOff } from "react-icons/ci";
import Button from "@mui/material/Button";
import recon from "../../Img/rec.gif";
import recoff from "../../Img/1-removebg-preview.png";

const socket = io("https://server-js-3-k2hb.onrender.com");

const VideoChat = () => {
  const [peers, setPeers] = useState({});
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef(null);

  const myVideo = useRef();
  const videosRef = useRef({});
  const streamRef = useRef(null);
  const peer = useRef(null);
  const mediaRecorder = useRef(null);
  const recordedChunks = useRef([]);

  useEffect(() => {
    peer.current = new Peer();
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        videoTrack.enabled = false;
        audioTrack.enabled = false;

        myVideo.current.srcObject = stream;
        myVideo.current.muted = true;
        myVideo.current.volume = 0;

        peer.current.on("open", (id) => {
          socket.emit("join-room", "chatRoom", id);
        });

        peer.current.on("call", (call) => {
          call.answer(stream);
          call.on("stream", (userVideoStream) => {
            addVideoStream(call.peer, userVideoStream);
          });
        });

        socket.on("user-connected", (userId) => {
          const call = peer.current.call(userId, stream);
          call.on("stream", (userVideoStream) => {
            addVideoStream(userId, userVideoStream);
          });
          setPeers((prev) => ({ ...prev, [userId]: call }));
        });

        socket.on("user-disconnected", (userId) => {
          if (peers[userId]) peers[userId].close();
          if (videosRef.current[userId]) {
            videosRef.current[userId].remove();
            delete videosRef.current[userId];
          }
        });
      });
  }, []);

  const addVideoStream = (id, stream) => {
    if (videosRef.current[id]) return;
    const video = document.createElement("video");
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.className = "w-full aspect-video object-cover rounded-xl shadow";
    videosRef.current[id] = video;
    const container = document.getElementById("video-grid");
    const wrapper = document.createElement("div");
    wrapper.className = "col-span-1";
    wrapper.appendChild(video);
    container.appendChild(wrapper);
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      videoTrack.enabled = !cameraOn;
      setCameraOn(!cameraOn);
      socket.emit("toggle-camera", {
        userId: peer.current.id,
        enabled: !cameraOn,
      });
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      audioTrack.enabled = !micOn;
      setMicOn(!micOn);
      socket.emit("toggle-mic", {
        userId: peer.current.id,
        enabled: !micOn,
      });
    }
  };

  const startRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...micStream.getAudioTracks(),
      ]);

      mediaRecorder.current = new MediaRecorder(combinedStream);
      recordedChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `dars-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };

      mediaRecorder.current.start();
      setRecording(true);
      setRecordingTime(0);
      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("🎥 Yozib olishda xatolik:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      setRecording(false);
      clearInterval(recordingInterval.current);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">🎥 Real-Time Video Dars</h2>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full max-w-7xl justify-center"
        id="video-grid"
      >
        <div className="col-span-1">
          <video
            ref={myVideo}
            autoPlay
            playsInline
            muted
            className="w-full aspect-video object-cover rounded-xl shadow"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-4 flex-wrap justify-center">
        <Button
          onClick={toggleCamera}
          variant="outlined"
          sx={{ padding: "15px" }}
        >
          {cameraOn ? <PiVideoCameraDuotone /> : <PiVideoCameraSlashDuotone />}
        </Button>

        <Button onClick={toggleMic} variant="outlined" sx={{ padding: "15px" }}>
          {micOn ? <CiMicrophoneOn /> : <CiMicrophoneOff />}
        </Button>

        <Button
          onClick={recording ? stopRecording : startRecording}
          variant="outlined"
          sx={{ padding: "9px" }}
        >
          <img src={recording ? recon : recoff} alt="rec" width={50} />
        </Button>

        {recording && (
          <div className="text-red-600 text-center font-bold text-xl mb-2">
            ⏺ Yozilmoqda: {formatTime(recordingTime)}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoChat;
