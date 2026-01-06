"use client";

import { useRef, useState } from "react";
import * as Icons from "lucide-react";

interface Props {
  src: string;
  poster?: string;
}

export default function CustomVideoPlayer({ src, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);


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

  const onTimeUpdate = () => {
    if (!videoRef.current) return;
    setProgress(videoRef.current.currentTime);
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const onSeek = (value: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = value;
    setProgress(value);
  };

  const onVolumeChange = (value: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = value;
    setVolume(value);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const formatTime = (time: number) => {
    if (!time) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };


  return (
    <div className="w-full bg-black rounded-xl overflow-hidden relative">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full max-h-[70vh] bg-black"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onClick={togglePlay}
      />

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={progress}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="w-full mb-2"
        />

        <div className="flex items-center justify-between gap-4">
          <button onClick={togglePlay}>
            {isPlaying ? (
              <Icons.Pause className="w-6 h-6" />
            ) : (
              <Icons.Play className="w-6 h-6" />
            )}
          </button>

          <span className="text-sm text-gray-300">
            {formatTime(progress)} / {formatTime(duration)}
          </span>

          <div className="flex items-center gap-2">
            <Icons.Volume2 className="w-5 h-5" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
            />
          </div>

          <button onClick={toggleFullscreen}>
            <Icons.Maximize className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
