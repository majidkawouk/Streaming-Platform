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
import { useUser } from "@/context/UserContext";
import { RiFullscreenExitFill } from "react-icons/ri";

interface StreamData {
  id: string;
  title: string;
  category: string;
  description: string;
  is_live: boolean;
  user: {
    id: string;
    username: string;
  };
}

export default function Viewer({ params }: { params: { viewer: string } }) {
  const viewerId = params.viewer;

  const user = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [videoProducerId, setVideoProducerId] = useState<string | null>(null);
  const [audioProducerId, setAudioProducerId] = useState<string | null>(null);
  const [status, setStatus] = useState("Connecting...");
  const [messages, setMessages] = useState<{ user: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [socketId, setSocketId] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const hasInteractedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamData, setStreamData] = useState<StreamData | null>(null);

  useEffect(() => {
    const fetchStreamData = async () => {
      try {
        const res = await fetch("http://localhost:3000/streams");
        const streams = await res.json();
                const currentStream = streams.find(
          (s: StreamData) => s.is_live && s.user.id
        );
        
        if (currentStream) {
          setStreamData(currentStream);
        }
      } catch (err) {
        console.error("Failed to fetch stream data:", err);
      }
    };
    
    fetchStreamData();
  }, [viewerId]);

  useEffect(() => {
    const fetchProducers = async () => {
      try {
        const res = await fetch("http://localhost:3000/producers");
        const data = await res.json();
        console.log("All Producers:", data);

        const videoProducer = data.video.find(
          (v: any) => v.socketId === viewerId
        );
        const audioProducer = data.audio.find(
          (a: any) => a.socketId === viewerId
        );

        if (videoProducer) {
          setVideoProducerId(videoProducer.producerId);
          console.log("Video Producer ID:", videoProducer.producerId);
        } else {
          console.warn("No video producer found for socket:", viewerId);
          setStatus("No video stream available");
        }

        if (audioProducer) {
          setAudioProducerId(audioProducer.producerId);
          console.log("Audio Producer ID:", audioProducer.producerId);
        } else {
          console.warn("No audio producer found for socket:", viewerId);
        }
      } catch (err) {
        console.error("Failed to fetch producers:", err);
        setStatus("Failed to load stream");
      }
    };
    fetchProducers();
  }, [viewerId]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted || !videoProducerId || !audioProducerId) return;

    const startStream = async () => {
      try {
        const socket = io("http://localhost:3000");
        socketRef.current = socket;

        socket.on("connect", () => {
          const mySocketId = socket.id;
          setSocketId(mySocketId ?? null);

          socket.emit("joinRoom", { streamerSocketId: viewerId });
        });

        socket.on(
          "chat-message",
          (msg: { socketId: string; text: string; user: string }) => {
            if (msg.socketId === socketRef.current?.id) return;
            setMessages((prev) => [
              ...prev,
              { user: msg.user, text: msg.text },
            ]);
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

            const stream = new MediaStream();
            mediaStreamRef.current = stream;

            const consumePromises: Promise<void>[] = [];

            const videoPromise = new Promise<void>((resolve, reject) => {
              socket.emit(
                "consume",
                {
                  producerId: videoProducerId,
                  rtpCapabilities: device.rtpCapabilities,
                },
                async (data: any) => {
                  if (data.error) {
                    console.error("Cannot consume video stream:", data.error);
                    reject(data.error);
                    return;
                  }

                  try {
                    const consumer = await recvTransport.consume(data);
                    stream.addTrack(consumer.track);
                    console.log("Video track added to stream");
                    resolve();
                  } catch (err) {
                    reject(err);
                  }
                }
              );
            });
            consumePromises.push(videoPromise);

            const audioPromise = new Promise<void>((resolve, reject) => {
              socket.emit(
                "consume",
                {
                  producerId: audioProducerId,
                  rtpCapabilities: device.rtpCapabilities,
                },
                async (data: any) => {
                  if (data.error) {
                    console.error("Cannot consume audio stream:", data.error);
                    reject(data.error);
                    return;
                  }

                  try {
                    const consumer = await recvTransport.consume(data);
                    stream.addTrack(consumer.track);
                    console.log("Audio track added to stream");
                    resolve();
                  } catch (err) {
                    reject(err);
                  }
                }
              );
            });
            consumePromises.push(audioPromise);

            Promise.all(consumePromises)
              .then(async () => {
                console.log("Both tracks ready, starting playback");
                if (videoRef.current) {
                  videoRef.current.srcObject = stream;
                  videoRef.current.muted = true;

                  try {
                    await videoRef.current.play();
                    setIsPlaying(true);
                    setStatus("LIVE");
                    console.log("Stream playing successfully");
                  } catch (err) {
                    console.error("Error playing stream:", err);
                    setIsPlaying(false);
                    setStatus("Click to play");
                  }
                }
              })
              .catch((err) => {
                console.error("Error consuming tracks:", err);
                setStatus("Failed to load stream");
              });
          }
        );
      } catch (err) {
        console.error("Stream error:", err);
        setStatus("Failed to connect");
      }
    };

    startStream();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isMounted, videoProducerId, audioProducerId, viewerId]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit("chat-message", {
      streamerSocketId: viewerId,
      text: input,
      user: user.user?.username || "Guest",
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
              muted
              className="w-full h-full object-contain"
            />

            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white text-sm px-3 py-1 rounded-full font-semibold shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {status}
            </div>

            {muted && status === "LIVE" && (
              <div className="absolute top-16 left-4 flex items-center gap-2 bg-yellow-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold shadow-lg animate-pulse">
                <HiMiniSpeakerXMark className="w-4 h-4" />
                Click speaker icon to unmute
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-5 py-3 flex justify-between items-center">
              <HiCog6Tooth className="w-6 h-6 cursor-pointer hover:text-gray-300" />

              <div className="flex items-center gap-3">
                {isFullscreen ? (
                  <RiFullscreenExitFill
                    className="w-6 h-6 cursor-pointer hover:text-gray-300"
                    onClick={toggleFullscreen}
                    title="Fullscreen"
                  />
                ) : (
                  <SlFrame
                    className="w-6 h-6 cursor-pointer hover:text-gray-300"
                    onClick={toggleFullscreen}
                    title="Fullscreen"
                  />
                )}

                {muted ? (
                  <HiMiniSpeakerXMark
                    className="w-6 h-6 cursor-pointer hover:text-gray-300"
                    onClick={() => {
                      setMuted(false);
                      hasInteractedRef.current = true;
                      if (videoRef.current) {
                        videoRef.current.muted = false;
                      }
                    }}
                  />
                ) : (
                  <HiSpeakerWave
                    className="w-6 h-6 cursor-pointer hover:text-gray-300"
                    onClick={() => {
                      setMuted(true);
                      if (videoRef.current) {
                        videoRef.current.muted = true;
                      }
                    }}
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
          <div className="mt-4 px-2 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FaCrown className="text-xl" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-xl">
                    {streamData?.user?.username || `Streamer_${viewerId.slice(0, 6)}`}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {streamData?.category || "Live"} • Streaming now
                  </p>
                </div>
              </div>
              <button className="px-5 py-2 bg-cyan-600 rounded-lg font-semibold hover:bg-cyan-700 transition text-sm">
                Follow
              </button>
            </div>

            {streamData?.title && (
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {streamData.title}
                </h1>
              </div>
            )}

            {streamData?.description && (
              <div className="bg-[#18181b] rounded-lg p-4 border border-[#202024]">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                  About this stream
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {streamData.description}
                </p>
              </div>
            )}
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