"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StreamThum from "@/components/StreamThum";

interface Producer {
  producerId: string;
  socketId: string;
  name: string;
  category: string;
}

interface StreamData {
  socketId: string;
  name: string;
  category: string;
  videoProducerId: string;
  audioProducerId: string;
}

export default function Mainpage() {
  const [streamsList, setStreamsList] = useState<StreamData[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/producers");
        const data = await res.json();
        console.log("Fetched producers:", data);

        const streamsMap = new Map<string, StreamData>();

        // Process video producers
        data.video.forEach((producer: Producer) => {
          if (!streamsMap.has(producer.socketId)) {
            streamsMap.set(producer.socketId, {
              socketId: producer.socketId,
              name: producer.name,
              category: producer.category,
              videoProducerId: producer.producerId,
              audioProducerId: "",
            });
          } else {
            const stream = streamsMap.get(producer.socketId)!;
            stream.videoProducerId = producer.producerId;
          }
        });

        // Process audio producers
        data.audio.forEach((producer: Producer) => {
          if (!streamsMap.has(producer.socketId)) {
            streamsMap.set(producer.socketId, {
              socketId: producer.socketId,
              name: producer.name,
              category: producer.category,
              videoProducerId: "",
              audioProducerId: producer.producerId,
            });
          } else {
            const stream = streamsMap.get(producer.socketId)!;
            stream.audioProducerId = producer.producerId;
          }
        });

        // Convert map to array and filter streams that have both video and audio
        const streams = Array.from(streamsMap.values()).filter(
          (stream) => stream.videoProducerId && stream.audioProducerId
        );

        setStreamsList(streams);
        console.log("Processed streams:", streams);
      } catch (err) {
        console.error("Error fetching producers:", err);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [isMounted]);

  if (!isMounted) return null;

  const categories = [
    { name: "Gaming", image: "/gaming.jpg" },
    { name: "Music", image: "/music.jpg" },
    { name: "Coding", image: "/coding.jpg" },
    { name: "IRL", image: "/irl.jpg" },
    { name: "Sports", image: "/sports.webp" },
  ];

  return (
    <div className="min-h-screen p-5 space-y-12  w-full">
      <section>
        <h1 className="text-white font-bold text-3xl mb-6">Live Channels</h1>

        {streamsList.length === 0 ? (
          <p className="text-gray-400">No live streams currently.</p>
        ) : (
          <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3  lg:grid-cols-4 gap-10 ">
            {streamsList.map((stream) => (
              <Link
                key={stream.socketId}
                href={`/${stream.socketId}`}
                className="relative rounded-2xl shadow-lg"
              >
                <StreamThum />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h1 className="text-white font-bold text-3xl mb-6">
          Browse by Category
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/category/${cat.name.toLowerCase()}`}
              className="relative group overflow-hidden rounded-2xl shadow-lg"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                <h3 className="text-white font-semibold text-lg">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
