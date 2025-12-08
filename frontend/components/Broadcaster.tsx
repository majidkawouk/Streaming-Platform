"use client";
import { useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import * as LucideIcons from "lucide-react";
import { useUser } from "@/context/UserContext";
import { CiVideoOff } from "react-icons/ci";

export default function Broadcaster() {
  const { user } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const [status, setStatus] = useState("Click to go live");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [streamTitle, setStreamTitle] = useState("My Awesome Stream");
  const [categories] = useState(["Gaming", "Coding", "Music", "Art"]);
  const [selectedCategory, setSelectedCategory] = useState("Gaming");

  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedCam, setSelectedCam] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    async function fetchDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === "audioinput");
      const cams = devices.filter((d) => d.kind === "videoinput");
      setMicrophones(mics);
      setCameras(cams);
      setSelectedMic(mics[0]?.deviceId || "");
      setSelectedCam(cams[0]?.deviceId || "");
    }
    fetchDevices();
  }, []);

  useEffect(() => {
    if (!started || !socketRef.current) return;
    const socket = socketRef.current;

    const onMessage = (msg: {
      socketId: string;
      text: string;
      user: string;
    }) => {
      if (msg.socketId === socket.id) return;
      setMessages((prev) => [...prev, { user: msg.user, text: msg.text }]);
    };

    socket.on("chat-message", onMessage);

    return () => {
      socket.off("chat-message", onMessage);
    };
  }, [started]);

  const startBroadcast = async () => {
    try {
      setStatus("Connecting...");

      const socket = io("http://localhost:3000");
      socketRef.current = socket;
      await new Promise<void>((resolve) => {
        socket.on("connect", () => {
          console.log("Connected with socket ID:", socket.id);

          socket.emit("createroom", { streamerSocketId: socket.id });
          console.log("Created and joined room:", socket.id);

          resolve();
        });
      });

      const res = await fetch("http://localhost:3000/rtpCapabilities");
      const rtpCapabilities = await res.json();

      const device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });

      socket.emit("createTransport", { consuming: false }, async (params) => {
        const sendTransport = device.createSendTransport(params);

        sendTransport.on("connect", ({ dtlsParameters }, callback) => {
          socket.emit("connectTransport", { dtlsParameters, consuming: false });
          callback();
        });

        sendTransport.on(
          "produce",
          async ({ kind, rtpParameters }, callback) => {
            socket.emit(
              "produce",
              {
                kind,
                rtpParameters,
                name: user?.username || "guest",
                category: selectedCategory,
              },
              ({ id }) => callback({ id })
            );
          }
        );

        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedCam ? { deviceId: { exact: selectedCam } } : true,
          audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
        });

        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];
        setVideoTrack(videoTrack);
        setAudioTrack(audioTrack);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.muted = true;
          await videoRef.current.play();
        }

        await sendTransport.produce({ track: videoTrack, kind: "video" });
        await sendTransport.produce({ track: audioTrack, kind: "audio" });

        setStatus("LIVE");
        setStarted(true);
      });
    } catch (err) {
      console.error("Broadcast error:", err);
      setStatus("Error starting live");
    }
  };

  const endStream = () => {
  if (socketRef.current) socketRef.current.disconnect();
  setStarted(false);
  setStatus("Click to go live");
  setMessages([]);
  setIsMicMuted(false);
  setIsVideoDisabled(false);
  if (videoRef.current?.srcObject) {
    (videoRef.current.srcObject as MediaStream)
      .getTracks()
      .forEach((t) => t.stop());
    videoRef.current.srcObject = null;
  }
};

 const toggleMuteMic = () => {
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    setIsMicMuted(!audioTrack.enabled);
  }
};

const toggleVideo = () => {
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    setIsVideoDisabled(!videoTrack.enabled);
  }
};

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-white p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <header className="flex justify-between items-center pb-4 border-b border-[#181822]">
          <div>
            <h2 className="text-3xl font-bold">Stream Control Panel</h2>
            {started && socketRef.current && (
              <p className="text-sm text-gray-400 mt-1">
                Stream URL:{" "}
                <span className="text-cyan-400">/{socketRef.current.id}</span>
              </p>
            )}
          </div>
          {started ? (
            <button
              onClick={endStream}
              className="px-4 py-2 bg-red-600 rounded-xl flex items-center hover:bg-red-700 transition"
            >
              <LucideIcons.X className="w-4 h-4 mr-2" /> End Stream
            </button>
          ) : (
            <button
              onClick={startBroadcast}
              className="px-4 py-2 bg-cyan-500 rounded-xl flex items-center hover:bg-cyan-600 transition"
            >
              <LucideIcons.Zap className="w-4 h-4 mr-2" /> Go Live
            </button>
          )}
        </header>

        <div className="bg-[#181822] rounded-xl overflow-hidden shadow-2xl aspect-video relative">
          <video
            ref={videoRef}
            playsInline
            className="w-full h-full object-cover"
          />
          {started && (
            <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {status}
            </div>
          )}
          {!started && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4">
              <LucideIcons.VideoOff className="w-12 h-12 text-gray-500 mb-4" />
              <p className="text-lg text-gray-400">{status}</p>
            </div>
          )}
        </div>

        <div className="bg-[#181822] p-4 rounded-xl shadow-xl space-y-3">
          <h3 className="text-xl font-semibold">Stream Information</h3>
          <input
            type="text"
            value={streamTitle}
            onChange={(e) => setStreamTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[#28283d] border border-[#35354a] rounded-lg text-white outline-none focus:ring-1 focus:ring-cyan-500"
            placeholder="Stream title..."
            disabled={started}
          />
          <div className="flex flex-col relative mt-3">
            <label className="text-sm font-medium text-gray-400 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#28283d] border border-[#35354a] rounded-lg text-white appearance-none focus:ring-1 focus:ring-cyan-500"
              disabled={started}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-[#181822] p-4 rounded-xl shadow-xl space-y-3">
          <h3 className="text-xl font-semibold">Audio & Video</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col relative">
              <label className="text-sm font-medium text-gray-400 mb-1">
                Microphone
              </label>
              <select
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                className="w-full px-3 py-2 bg-[#28283d] border border-[#35354a] rounded-lg text-white"
                disabled={started}
              >
                {microphones.map((m) => (
                  <option key={m.deviceId} value={m.deviceId}>
                    {m.label || "Microphone"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col relative">
              <label className="text-sm font-medium text-gray-400 mb-1">
                Camera
              </label>
              <select
                value={selectedCam}
                onChange={(e) => setSelectedCam(e.target.value)}
                className="w-full px-3 py-2 bg-[#28283d] border border-[#35354a] rounded-lg text-white"
                disabled={started}
              >
                {cameras.map((c) => (
                  <option key={c.deviceId} value={c.deviceId}>
                    {c.label || "Camera"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 flex flex-col space-y-6">
        <div className="bg-[#181822] p-4 rounded-xl shadow-xl flex flex-col h-[450px]">
          <h3 className="text-xl font-semibold mb-3">Live Chat</h3>

          <div className="flex-1 overflow-y-auto space-y-2">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No messages yet...</p>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="text-sm">
                  <span className="font-semibold text-cyan-400 mr-2">
                    {msg.user}:
                  </span>
                  <span className="text-gray-300">{msg.text}</span>
                </div>
              ))
            )}
          </div>

          <div className="pt-3 border-t border-[#35354a] text-gray-500 text-sm text-center">
            {started
              ? "You are live — viewers can chat here."
              : "Go live to see chat messages"}
          </div>
        </div>
        <div className="bg-[#181822] p-4 rounded-xl shadow-xl">
          <h3 className="text-xl font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={toggleMuteMic}
              disabled={!started}
              className="flex flex-col items-center justify-center p-4 bg-[#28283d] rounded-xl hover:bg-[#35354a] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isMicMuted ? (
                <LucideIcons.Mic className="w-6 h-6 mb-1 text-cyan-400" />
              ) : (
                <LucideIcons.MicOff className="w-6 h-6 mb-1 text-red-400" />
              )}
              <span className="text-gray-300 text-sm">
                {!isMicMuted ? "Mute" : "Unmute"}
              </span>
            </button>

            <button
              onClick={toggleVideo}
              disabled={!started}
              className="flex flex-col items-center justify-center p-4 bg-[#28283d] rounded-xl hover:bg-[#35354a] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isVideoDisabled ? (
                <LucideIcons.Video className="w-6 h-6 mb-1 text-cyan-400" />
              ) : (
                <CiVideoOff className="w-6 h-6 mb-1 text-red-400" />
              )}
              <span className="text-gray-300 text-sm">
                {!isVideoDisabled ? "Disable" : "Enable"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
