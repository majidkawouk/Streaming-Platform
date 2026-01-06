"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import * as LucideIcons from "lucide-react";

interface ProfileUser {
  id: string;
  username: string;
  email: string;
}

interface Stream {
  id: string;
  title: string;
  category: string;
  Stream_Url?: string | null;
  is_live?: boolean;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  const { user: currentUser, token } = useUser();

  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("streams");
  const [loading, setLoading] = useState(true);

  const isOwn = String(currentUser?.id) === String(userId);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        const pr = await fetch(`http://localhost:3000/followers/${userId}`);
        if (pr.ok) setProfileUser(await pr.json());

        const sr = await fetch(`http://localhost:3000/streams/${userId}/url`);
        if (sr.ok) {
          const data = await sr.json();
          setStreams(Array.isArray(data) ? data : [data]);
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  useEffect(() => {
    if (!token || !userId) return;

    fetch(`http://localhost:3000/followers/${userId}/is-following`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setIsFollowing(Boolean(d.isFollowing)));
  }, [userId, token]);

  const handleFollow = async () => {
    if (!token) return alert("Login required");

    const endpoint = isFollowing
      ? "http://localhost:3000/followers/unfollow"
      : "http://localhost:3000/followers/follow";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetUserId: userId }),
    });

    if (res.ok) setIsFollowing((p) => !p);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] flex items-center justify-center">
        <LucideIcons.Loader className="w-12 h-12 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] flex items-center justify-center text-white">
        User not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-white">
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-48" />

      <div className="max-w-6xl mx-auto px-4 pb-12 -mt-24">
        <div className="bg-[#181822] rounded-xl p-8 mb-8">
          <h1 className="text-4xl font-bold">{profileUser.username}</h1>

          {!isOwn && (
            <button
              onClick={handleFollow}
              className={`mt-6 px-6 py-2 rounded-lg ${
                isFollowing
                  ? "bg-[#28283d]"
                  : "bg-cyan-500 hover:bg-cyan-600"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )}
        </div>

        <div className="border-b border-[#35354a] mb-8 flex gap-8">
          {["streams", "about"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-3 ${
                activeTab === t
                  ? "text-cyan-400 border-b-2 border-cyan-400"
                  : "text-gray-400"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {activeTab === "streams" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.length ? (
              streams.map((s) => (
                <Link
                  key={s.id}
                  href={`/profile/${userId}/streams/${s.id}`}
                  className="group"
                >
                  <div className="bg-[#181822] border border-[#35354a] hover:border-cyan-500 rounded-xl overflow-hidden">
                    <div className="aspect-video bg-[#28283d] relative">
                      {s.is_live && (
                        <span className="absolute top-2 left-2 bg-red-600 text-xs px-2 py-1 rounded">
                          LIVE
                        </span>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LucideIcons.Play className="w-12 h-12 text-cyan-400 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold">{s.title}</h3>
                      <span className="text-sm text-cyan-400">
                        {s.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-400">No streams yet</p>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="bg-[#181822] p-8 rounded-xl">
            <p>Email: {isOwn ? profileUser.email : "Hidden"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
