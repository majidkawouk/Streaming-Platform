"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import * as LucideIcons from "lucide-react";

interface Stream {
  id: string;
  title: string;
  category: string;
  Stream_Url: string;
  is_live: boolean;
  user: {
    id: string;
    username: string;
  };
}

export default function StreamPlayerPage() {
  const { streamId, id: userId } = useParams();
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!streamId) return;

    const load = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/streams/by-id/${streamId}`
        );

        if (!res.ok) throw new Error("Stream not found");

        setStream(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [streamId]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const goFullscreen = () => {
    videoRef.current?.requestFullscreen();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LucideIcons.Loader className="w-10 h-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <p className="mb-4">{error || "Stream not found"}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-cyan-500 rounded"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="relative bg-[#0a0a0e] rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            src={stream.Stream_Url}
            className="w-full aspect-video"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            controls={false}
          />

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center gap-4">
            <button onClick={togglePlay}>
              {isPlaying ? (
                <LucideIcons.Pause className="w-6 h-6" />
              ) : (
                <LucideIcons.Play className="w-6 h-6" />
              )}
            </button>

            <button onClick={goFullscreen}>
              <LucideIcons.Maximize className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h1 className="text-2xl font-bold">{stream.title}</h1>
          <p className="text-cyan-400">{stream.category}</p>

          <p className="mt-2 text-gray-400">
            By{" "}
            <span
              className="text-white cursor-pointer hover:underline"
              onClick={() => router.push(`/profile/${stream.user.id}`)}
            >
              {stream.user.username}
            </span>
          </p>

          {stream.is_live && (
            <span className="inline-block mt-3 bg-red-600 text-xs px-3 py-1 rounded">
              LIVE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
