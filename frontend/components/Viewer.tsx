"use client";

import { useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { FaCrown, FaPlay, FaUserAlt } from "react-icons/fa";
import { SlFrame } from "react-icons/sl";
import { IoStop } from "react-icons/io5";
import {
  HiMiniSpeakerXMark,
  HiSpeakerWave,
  HiCog6Tooth,
} from "react-icons/hi2";

export default function Viewer({ params }: { params: { viewer: string } }) {
  const { viewer } = params;
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [status, setStatus] = useState("Connecting...");
  const [messages, setMessages] = useState<{ user: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [socketId, setSocketId] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (!isMounted) return;

    const startStream = async () => {
      try {
        const socket = io("http://localhost:3000");
        socketRef.current = socket;

        socket.on("connect", () => setSocketId(socket.id ?? null));

        socket.on(
          "chat-message",
          (msg: { user: string; text: string; producerId: string }) => {
            if (msg.producerId === viewer) {
              setMessages((prev) => [...prev, msg]);
            }
          }
        );

        const res = await fetch("http://localhost:3000/rtpCapabilities");
        const rtpCapabilities = await res.json();

        const device = new mediasoupClient.Device();
        await device.load({ routerRtpCapabilities: rtpCapabilities });

        socket.emit(
          "createTransport",
          { consuming: true },
          async (params: any) => {
            const recvTransport = device.createRecvTransport(params);

            recvTransport.on("connect", ({ dtlsParameters }, callback) => {
              socket.emit("connectTransport", {
                dtlsParameters,
                consuming: true,
              });
              callback();
            });

            socket.emit(
              "consume",
              { producerId: viewer, rtpCapabilities: device.rtpCapabilities },
              async (data: any) => {
                if (data.error) return setStatus("Cannot consume stream");

                const consumer = await recvTransport.consume(data);
                const stream = new MediaStream();
                stream.addTrack(consumer.track);

                if (videoRef.current) {
                  videoRef.current.srcObject = stream;
                  try {
                    await videoRef.current.play();
                    setIsPlaying(true);
                  } catch {
                    setIsPlaying(false);
                  }
                }

                setStatus("LIVE");
              }
            );
          }
        );
      } catch (err) {
        console.error(err);
        setStatus("Failed to connect");
      }
    };

    startStream();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isMounted, viewer]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit("chat-message", {
      user: socketRef.current.id,
      text: input,
      producerId: viewer,
    });
    setMessages((prev) => [...prev, { user: "You", text: input }]);
    setInput("");
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    try {
      if (!isFullscreen) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0e0e10] text-white font-inter overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-[1400px] flex flex-col">
          <div
            ref={containerRef}
            className={`relative w-full bg-black aspect-video group overflow-hidden ${
              isFullscreen ? "fixed inset-0 z-50" : ""
            }`}
          >
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted={muted}
              className="w-full h-full object-contain"
            />

            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white text-sm px-3 py-1 rounded-full font-semibold shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-5 py-3 flex justify-between items-center">
              <HiCog6Tooth className="w-6 h-6 cursor-pointer hover:text-gray-300" />

              <div className="flex items-center gap-3">
                <SlFrame
                  className="w-6 h-6 cursor-pointer hover:text-gray-300"
                  onClick={toggleFullscreen}
                  title="Fullscreen"
                />

                {muted ? (
                  <HiMiniSpeakerXMark
                    className="w-6 h-6 cursor-pointer hover:text-gray-300"
                    onClick={() => setMuted(false)}
                  />
                ) : (
                  <HiSpeakerWave
                    className="w-6 h-6 cursor-pointer hover:text-gray-300"
                    onClick={() => setMuted(true)}
                  />
                )}

                {isPlaying ? (
                  <IoStop
                    className="w-6 h-6 cursor-pointer hover:text-gray-300"
                    onClick={() => {
                      videoRef.current?.pause();
                      setIsPlaying(false);
                    }}
                  />
                ) : (
                  <FaPlay
                    className="w-6 h-6 cursor-pointer hover:text-gray-300"
                    onClick={() => {
                      videoRef.current?.play();
                      setIsPlaying(true);
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <FaCrown />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Streamer_{viewer}</h2>
                <p className="text-sm text-gray-400">Streaming now</p>
              </div>
            </div>
          <button className="px-4 py-2 bg-cyan-600 rounded-lg font-semibold hover:bg-cyan-700 transition text-sm">
              Follow
            </button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-[350px] bg-[#18181b] flex flex-col border-l border-[#202024]">
        <div className="px-4 py-3 border-b border-[#202024]">
          <h2 className="text-lg font-semibold">Live Chat</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-[#3a3a40] scrollbar-track-[#18181b]">
          {messages.map((msg, idx) => {
            const color = [
              "text-purple-400",
              "text-pink-400",
              "text-cyan-400",
              "text-yellow-400",
              "text-green-400",
            ][idx % 5];
            return (
              <div key={idx} className="text-sm leading-relaxed">
                <span className={`font-semibold ${color}`}>
                  <FaUserAlt className="inline mr-1 text-xs" />{" "}
                  {msg.user.slice(0, 6)}
                </span>
                : {msg.text}
              </div>
            );
          })}
        </div>

        <div className="p-3 border-t border-[#202024] flex gap-2 bg-[#18181b]">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-[#0e0e10] rounded-lg text-sm outline-none placeholder-gray-500"
            placeholder="Send a message"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-[#9147ff] rounded-lg font-semibold hover:bg-[#772ce8] transition text-sm"
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}
