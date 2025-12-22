"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import StreamThum from "@/components/StreamThum";
import Link from "next/link";
import * as LucideIcons from "lucide-react";

export default function Profile() {
  const params = useParams();

  const [userId, setUserId] = useState<string | null>(null);
  const { user: currentUser, token } = useUser();

  const [profileUser, setProfileUser] = useState(null);
  const [streams, setStreams] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("streams");
  const [loading, setLoading] = useState(true);
  const [isOwn, setIsOwn] = useState(false);

  
  useEffect(() => {
    if (params?.id) {
      setUserId(String(params.id));
    }
  }, [params]);

 
  useEffect(() => {
    if (currentUser?.id && userId) {
      setIsOwn(String(currentUser.id) === String(userId));
    }
  }, [currentUser, userId]);

  
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const pr = await fetch(`http://localhost:3000/followers/${userId}`);
        if (pr.ok) setProfileUser(await pr.json());

        const sr = await fetch(`http://localhost:3000/streams`);
        if (sr.ok) {
          const data = await sr.json();
          setStreams(data.filter((s) => String(s.user?.id) === userId));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!token || !userId) return;

    const check = async () => {
      const r = await fetch(
        `http://localhost:3000/followers/${userId}/is-following`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (r.ok) {
        const data = await r.json();
        setIsFollowing(Boolean(data.isFollowing));
      }
    };

    check();
  }, [userId, token]);



  const handleFollow = async () => {
    if (!token) return alert("You must be logged in to follow users");

    try {
      const url = isFollowing
        ? "http://localhost:3000/followers/unfollow"
        : "http://localhost:3000/followers/follow";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (res.ok) {
        setIsFollowing((prev) => !prev);

        setProfileUser((p) =>
          p
            ? {
                ...p,
                followers: p.followers
                  ? p.followers + (isFollowing ? -1 : 1)
                  : isFollowing
                  ? 0
                  : 1,
              }
            : null
        );
      }
    } catch (e) {
      console.error("Follow error:", e);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] text-white flex items-center justify-center">
        <div className="text-center">
          <LucideIcons.Loader className="w-12 h-12 animate-spin text-cyan-500 mx-auto" />
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] text-white flex items-center justify-center">
        <div className="text-center">
          <LucideIcons.AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0e] text-white">


      <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-48 relative">
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="bg-[#181822] rounded-xl shadow-2xl p-8 -mt-24 relative z-10 mb-8">

          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center border-4 border-[#28283d] shadow-lg">
              <LucideIcons.User className="w-16 h-16 text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold">{profileUser.username}</h1>
              <p className="text-gray-400 mb-4">@{profileUser.username.toLowerCase()}</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: "Followers", value: profileUser.followers || 0 },
                  { label: "Following", value: profileUser.following || 0 },
                  { label: "Total Views", value: profileUser.totalViews || 0 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-[#28283d] p-4 rounded-lg border border-[#35354a]"
                  >
                    <p className="text-gray-400 text-sm">{item.label}</p>
                    <p className="text-2xl font-bold text-cyan-400">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                {isOwn ? (
                  <>
                    <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg flex items-center gap-2">
                      <LucideIcons.Settings className="w-4 h-4" />
                      Edit Profile
                    </button>

                    <Link
                      href="/broadcaster"
                      className="px-6 py-2 bg-[#28283d] hover:bg-[#35354a] rounded-lg flex items-center gap-2 border border-[#35354a]"
                    >
                      <LucideIcons.Play className="w-4 h-4" />
                      Go Live
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`px-6 py-2 rounded-lg flex items-center gap-2 font-semibold transition ${
                        isFollowing
                          ? "bg-[#28283d] border border-cyan-500 hover:bg-[#35354a]"
                          : "bg-cyan-500 hover:bg-cyan-600"
                      }`}
                    >
                      <LucideIcons.UserPlus className="w-4 h-4" />
                      {isFollowing ? "Following" : "Follow"}
                    </button>

                    <button className="px-6 py-2 bg-[#28283d] hover:bg-[#35354a] rounded-lg border border-[#35354a] flex items-center gap-2">
                      <LucideIcons.MessageCircle className="w-4 h-4" />
                      Message
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-[#35354a] mb-8 flex gap-8">
          <button
            onClick={() => setActiveTab("streams")}
            className={`px-4 py-3 font-semibold border-b-2 ${
              activeTab === "streams"
                ? "text-cyan-400 border-cyan-400"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <LucideIcons.Video className="w-4 h-4" />
              Streams
            </span>
          </button>

          <button
            onClick={() => setActiveTab("about")}
            className={`px-4 py-3 font-semibold border-b-2 ${
              activeTab === "about"
                ? "text-cyan-400 border-cyan-400"
                : "text-gray-400 border-transparent hover:text-white"
            }`}
          >
            <span className="flex items-center gap-2">
              <LucideIcons.Info className="w-4 h-4" />
              About
            </span>
          </button>
        </div>

        {activeTab === "streams" && (
          <div>
            {streams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {streams.map((s) => (
                  <Link
                    key={s.id}
                    href={`/${userId}`}
                    className="group cursor-pointer"
                  >
                    <div className="bg-[#181822] border border-[#35354a] hover:border-cyan-500 rounded-xl overflow-hidden transition">
                      <div className="aspect-video bg-[#28283d] relative">
                        <StreamThum />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition">
                          <LucideIcons.Play className="w-12 h-12 text-cyan-400 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-white line-clamp-2 mb-2">
                          {s.title}
                        </h3>

                        <div className="flex justify-between text-sm">
                          <span className="text-cyan-400">{s.category}</span>
                          <span className="text-gray-400 flex items-center gap-1">
                            <LucideIcons.Eye className="w-3 h-3" />
                            {0} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#181822] p-12 rounded-xl border border-[#35354a] text-center">
                <LucideIcons.Video className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No streams yet</p>
                <p className="text-gray-500 text-sm">
                  {isOwn
                    ? "Start streaming to share your content."
                    : `${profileUser.username} hasn't streamed yet.`}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "about" && (
          <div className="bg-[#181822] p-8 rounded-xl border border-[#35354a]">
            <h2 className="text-2xl font-bold mb-6">
              About {profileUser.username}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-gray-400 text-sm mb-1">Email</h3>
                <p className="text-white">
                  {isOwn ? profileUser.email : "Hidden"}
                </p>
              </div>

              <div>
                <h3 className="text-gray-400 text-sm mb-1">Member Since</h3>
                <p className="text-white">
                  {profileUser.created_at
                    ? new Date(profileUser.created_at).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long" }
                      )
                    : "-"}
                </p>
              </div>

              <div>
                <h3 className="text-gray-400 text-sm mb-1">Bio</h3>
                <p className="text-gray-400">
                  {isOwn
                    ? "No bio added yet."
                    : `${profileUser.username} is a streamer on our platform.`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
