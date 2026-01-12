"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { VideoIcon } from "lucide-react";

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
              className="group bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-cyan-300 transition-all duration-300"
            >
              <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    
               <VideoIcon className="w-20 h-20 text-cyan-300"/>
                  </div>
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 bg-red-600 rounded-md flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="text-xs font-bold text-white uppercase">Live</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-white text-lg line-clamp-2 group-hover:text-cyan-400 transition-colors">
                  {stream.title || stream.name}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {stream.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 font-medium truncate">{stream.username}</p>
                    <p className="text-xs text-gray-500">{stream.category}</p>
                  </div>
                </div>
                {stream.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{stream.description}</p>
                )}
              </div>
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
