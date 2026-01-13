"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, Pause, Maximize, Loader, Volume2, VolumeX } from "lucide-react";

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
  const { streamId } = useParams<{ streamId: string }>();
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!streamId) return;

    fetch(`http://localhost:3000/streams/by-id/${streamId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Stream not found");
        return r.json();
      })
      .then(setStream)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [streamId]);

 const togglePlay = async () => {
  if (!videoRef.current) return;

  if (videoRef.current.paused) {
    try {
      await videoRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Playback failed:", err);
      setIsPlaying(false);
    }
  } else {
    videoRef.current.pause();
    setIsPlaying(false);
  }
};

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
      setMuted(v === 0);
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const t = Number(e.target.value);
    videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const goFullscreen = () => {
    videoRef.current?.requestFullscreen();
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!stream || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
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
    <div className="min-h-screen  text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div
          className="relative rounded-xl overflow-hidden"
          onMouseMove={showControlsTemporarily}
        >
          <video
            ref={videoRef}
            src={stream.Stream_Url}
            className="w-full aspect-video bg-black"
            preload="metadata"
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              setDuration(video.duration || 0);
            }}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              setCurrentTime(video.currentTime);
            }}
          />

          {showControls && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 space-y-2">
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={seek}
                className="w-full h-1 accent-cyan-400 cursor-pointer"
              />

              <div className="flex items-center gap-4">
                <button onClick={togglePlay}>
                  {isPlaying ? <Pause /> : <Play />}
                </button>

                <div className="flex items-center gap-2 group">
                  <button onClick={toggleMute}>
                    {muted ? <VolumeX /> : <Volume2 />}
                  </button>

                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={changeVolume}
                    className="w-20 h-1 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex-1" />
                <button onClick={goFullscreen}>
                  <Maximize />
                </button>
              </div>
            </div>
          )}
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
