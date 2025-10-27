"use client";

import { useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import { motion } from "framer-motion";
import { FaCrown, FaUserAlt } from "react-icons/fa";

export default function Viewer({ params }: { params: { viewer: string } }) {
  const { viewer } = params;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Connecting...");
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket>();

  useEffect(() => {
    const startStream = async () => {
      const socket = io("http://localhost:3000");
      socketRef.current = socket;

      socket.on("connect", () => setSocketId(socket.id));

   socket.on("chat-message", (msg: { user: string; text: string; producerId: string }) => {
  if (msg.producerId === viewer) { 
    setMessages((prev) => [...prev, msg]);
  }
});




      const res = await fetch("http://localhost:3000/rtpCapabilities");
      const rtpCapabilities = await res.json();
      const device = new mediasoupClient.Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });

      socket.emit("createTransport", { consuming: true }, async (params: any) => {
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
              videoRef.current.muted = true;
              await videoRef.current.play();
              setTimeout(() => {
                if (videoRef.current) videoRef.current.muted = false;
              }, 1500);
            }

            setStatus("LIVE");
          }
        );
      });
    };

    startStream();
  }, [viewer]);

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

  return (
    <div className="flex flex-col md:flex-row h-screen text-white font-inter">
   
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="w-full max-w-[1100px] flex flex-col">
          <div className="relative rounded-lg overflow-hidden shadow-2xl">
            <video
              ref={videoRef}
              playsInline
              className="w-full aspect-video bg-black"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              LIVE
            </div>
          </div>

          <div className="flex justify-between mt-3 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <FaCrown />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Streamer_{viewer}</h2>
                <p className="text-sm text-gray-400">Streaming now</p>
              </div>
            </div>
            <div className="text-sm text-gray-400 mt-2">{status}</div>
          </div>
        </div>
      </div>


      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full md:w-[350px] bg-[#18181b] flex flex-col border-l border-[#202024]"
      >
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
                  <FaUserAlt className="inline mr-1 text-xs" /> {msg.user.slice(0, 6)}
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
      </motion.div>
    </div>
  );
}
