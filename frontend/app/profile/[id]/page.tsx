"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import StreamThum from "@/components/StreamThum";
import Link from "next/link";
import * as LucideIcons from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  followers?: number;
  following?: number;
  totalViews?: number;
  created_at?: string;
}

interface Stream {
  id: string | number;
  title: string;
  category: string;
  user?: { id: string | number };
}

export default function Profile() {
  const params = useParams();
  const { user: currentUser, token } = useUser();

  const userId = params?.id as string;
  const isOwnProfile = currentUser?.id === userId;

  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [userStreams, setUserStreams] = useState<Stream[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("streams");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await fetch(
          `http://localhost:3000/followers/${userId}`
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfileUser(profileData);
        }

        const streamsRes = await fetch(`http://localhost:3000/streams`);
        if (streamsRes.ok) {
          const streamsData = await streamsRes.json();
          const filtered = streamsData.filter(
            (s: Stream) => String(s.user?.id) === String(userId)
          );
          setUserStreams(filtered);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProfileData();
  }, [userId]);

  useEffect(() => {
    if (!token || !userId) return;
    const check = async () => {
      const res = await fetch(
        `http://localhost:3000/followers/${userId}/is-following`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setIsFollowing(Boolean(data.isFollowing));
      }
    };
    check();
  }, [userId, token]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

 
  const handleFollow = async () => {
    if (!token) return alert("You must be logged in to follow users");

    try {
      const url = isFollowing
        ? "http://localhost:3000/followers/unfollow"
        : "http://localhost:3000/followers/follow";

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        setProfileUser((p) =>
          p
            ? {
                ...p,
                followers: p.followers
                  ? p.followers + (isFollowing ? -1 : 1)
                  : 1,
              }
            : null
        );
      } else {
        const err = await res.json();
        console.error("Follow failed:", err);
      }
    } catch (error) {
      console.error("Follow error:", error);
    }
  };
  if(!isMounted){
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0e] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <LucideIcons.Loader className="w-12 h-12 text-cyan-500" />
          </div>
          <p className="text-gray-400">Loading profile...</p>
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
        <div className="absolute inset-0 bg-[#0a0a0e]/30"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
     
        <div className="bg-[#181822] rounded-xl shadow-2xl p-8 -mt-24 relative z-10 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
          
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg border-4 border-[#28283d]">
                <LucideIcons.User className="w-16 h-16 text-white" />
              </div>
            </div>

       
            <div className="flex-1">
              <div className="mb-4">
                <h1 className="text-4xl font-bold mb-2">
                  {profileUser.username}
                </h1>
                <p className="text-gray-400 mb-4">
                  @{profileUser.username.toLowerCase()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#28283d] p-4 rounded-lg border border-[#35354a]">
                  <p className="text-gray-400 text-sm mb-1">Followers</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {profileUser.followers || 0}
                  </p>
                </div>
                <div className="bg-[#28283d] p-4 rounded-lg border border-[#35354a]">
                  <p className="text-gray-400 text-sm mb-1">Following</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {profileUser.following || 0}
                  </p>
                </div>
                <div className="bg-[#28283d] p-4 rounded-lg border border-[#35354a]">
                  <p className="text-gray-400 text-sm mb-1">Total Views</p>
                  <p className="text-2xl font-bold text-cyan-400">
                    {profileUser.totalViews || 0}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                {isOwnProfile ? (
                  <>
                    <button className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold transition flex items-center gap-2">
                      <LucideIcons.Settings className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <Link
                      href="/broadcaster"
                      className="px-6 py-2 bg-[#28283d] hover:bg-[#35354a] rounded-lg font-semibold transition flex items-center gap-2 border border-[#35354a]"
                    >
                      <LucideIcons.Play className="w-4 h-4" />
                      Go Live
                    </Link>
                  </>
                ) : (
                  <>
                    {!isMounted ? (
                      <>
                        <div className="w-36 h-10 bg-[#28283d] rounded-lg" />
                        <div className="w-36 h-10 bg-[#28283d] rounded-lg" />
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleFollow}
                          className={`px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                            isFollowing
                              ? "bg-[#28283d] hover:bg-[#35354a] border border-cyan-500"
                              : "bg-cyan-500 hover:bg-cyan-600"
                          }`}
                        >
                          <LucideIcons.UserPlus className="w-4 h-4" />
                          {isFollowing ? "Following" : "Follow"}
                        </button>

                        <button className="px-6 py-2 bg-[#28283d] hover:bg-[#35354a] rounded-lg font-semibold transition flex items-center gap-2 border border-[#35354a]">
                          <LucideIcons.MessageCircle className="w-4 h-4" />
                          Message
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

     
        <div className="border-b border-[#35354a] mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("streams")}
              className={`px-4 py-3 font-semibold transition border-b-2 ${
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
              className={`px-4 py-3 font-semibold transition border-b-2 ${
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
        </div>

  
        {activeTab === "streams" && (
          <div>
            {userStreams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userStreams.map((stream) => (
                  <Link
                    key={stream.id}
                    href={`/${userId}`}
                    className="group cursor-pointer"
                  >
                    <div className="bg-[#181822] rounded-xl overflow-hidden border border-[#35354a] hover:border-cyan-500 transition">
                      <div className="aspect-video bg-[#28283d] relative overflow-hidden">
                        <StreamThum />
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                          <LucideIcons.Play className="w-12 h-12 text-cyan-400 opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-2 line-clamp-2">
                          {stream.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-cyan-400">
                            {stream.category}
                          </span>
                          <span className="text-gray-400 flex items-center gap-1">
                            <LucideIcons.Eye className="w-3 h-3" />0 views
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#181822] rounded-xl p-12 text-center border border-[#35354a]">
                <LucideIcons.Video className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No streams yet</p>
                <p className="text-gray-500 text-sm">
                  {isOwnProfile
                    ? "Start streaming to share your content"
                    : `${profileUser.username} hasn't streamed yet`}
                </p>
              </div>
            )}
          </div>
        )}

       
        {activeTab === "about" && (
          <div className="bg-[#181822] rounded-xl p-8 border border-[#35354a]">
            <h2 className="text-2xl font-bold mb-6">
              About {profileUser.username}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-gray-400 text-sm font-semibold mb-2">
                  Email
                </h3>
                <p className="text-white">
                  {isOwnProfile ? profileUser.email : "Hidden"}
                </p>
              </div>

              <div>
                <h3 className="text-gray-400 text-sm font-semibold mb-2">
                  Member Since
                </h3>
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
                <h3 className="text-gray-400 text-sm font-semibold mb-2">
                  Bio
                </h3>
                <p className="text-gray-400">
                  {isOwnProfile
                    ? "No bio added yet"
                    : `${profileUser.username} is a streamer on our platform`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
