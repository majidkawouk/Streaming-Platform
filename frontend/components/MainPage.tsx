"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StreamThum from "@/components/StreamThum";
import Image from "next/image";

interface Producer {
  producerId: string;
  socketId: string;
  name: string;
  category: string;
}

interface Stream {
  id: number;
  title: string;
  category: string;
  thumbnail_url: string | null;
  is_live: boolean;
  stream_key: string;
  started_at: string;
  ended_at: string | null;
  description: string;
  user: {
    id: number;
    username: string;
    email: string;
    password: string;
    created_at: string;
  };
}

interface StreamData {
  socketId: string;
  name: string;
  category: string;
  videoProducerId: string;
  audioProducerId: string;
  title: string;
  description: string;
  username: string;
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
        const producersRes = await fetch("http://localhost:3000/producers");
        const producers = await producersRes.json();

        const streamsRes = await fetch("http://localhost:3000/streams");
        const streams: Stream[] = await streamsRes.json();

        const streamsDataMap = new Map<string, Stream>();
        streams.forEach((stream) => {
          if (stream.is_live) {
            streamsDataMap.set(stream.stream_key, stream);
          }
        });

        const streamsMap = new Map<string, StreamData>();

        producers.video.forEach((producer: Producer) => {
          const streamData =
            streamsDataMap.get(producer.socketId) ||
            streams.find((s: Stream) => s.is_live);

          if (!streamsMap.has(producer.socketId)) {
            streamsMap.set(producer.socketId, {
              socketId: producer.socketId,
              name: producer.name,
              category: streamData?.category || producer.category,
              videoProducerId: producer.producerId,
              audioProducerId: "",
              title: streamData?.title || "",
              description: streamData?.description || "",
              username: streamData?.user.username || "",
            });
          } else {
            const stream = streamsMap.get(producer.socketId)!;
            stream.videoProducerId = producer.producerId;
          }
        });

        producers.audio.forEach((producer: Producer) => {
          const streamData =
            streamsDataMap.get(producer.socketId) ||
            streams.find((s: Stream) => s.is_live);

          if (!streamsMap.has(producer.socketId)) {
            streamsMap.set(producer.socketId, {
              socketId: producer.socketId,
              name: producer.name,
              category: streamData?.category || producer.category,
              videoProducerId: "",
              audioProducerId: producer.producerId,
              title: streamData?.title || "",
              description: streamData?.description || "",
              username: streamData?.user.username || "",
            });
          } else {
            const stream = streamsMap.get(producer.socketId)!;
            stream.audioProducerId = producer.producerId;
          }
        });

        const streamsList = Array.from(streamsMap.values()).filter(
          (s) => s.videoProducerId && s.audioProducerId
        );

        setStreamsList(streamsList);
      } catch (err) {
        console.error("Error fetching streams:", err);
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
    <div className="min-h-screen p-5 space-y-12 w-full">
      <section>
        <h1 className="text-white font-bold text-3xl mb-6">Live Channels</h1>

        {streamsList.length === 0 ? (
          <p className="text-gray-400">No live streams currently.</p>
        ) : (
          <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {streamsList.map((stream) => (
              <Link
                key={stream.socketId}
                href={`/${stream.socketId}`}
                className="relative rounded-2xl shadow-lg"
              >
                <StreamThum
                  title={stream.title}
                  channelName={stream.username}
                />
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
              <Image
                src={cat.image}
                alt={cat.name}
                width={300}
                height={300}
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
