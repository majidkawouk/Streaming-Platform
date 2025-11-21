"use client";
import { Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { FaGoogle, FaTwitch } from "react-icons/fa6";
import { useUser } from "@/context/UserContext";
import { useState } from "react";

export default function Register() {
  const { register } = useUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpassword, setCpassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== cpassword) {
      setError("Passwords do not match");
      return;
    }
    await register(username, email, password, setError);
    console.log("Registered successfully");

  };

  return (
    <form
      onSubmit={handleRegister}
      className="border-[1px] text-white rounded-lg gap-5 shadow-xl border-gray-600 md:w-[40%] lg:w-[30%] w-[50%] min-h-150 py-10 flex flex-col items-center"
    >
      <h1 className="text-2xl font-semibold">Create Your Account</h1>
      <p>Join the stream. Join the community.</p>

      {error && (
        <div className="w-[80%] p-2 bg-red-800/50 border border-red-400 text-red-300 rounded-lg text-center">
          {error}
        </div>
      )}


      <div className="flex flex-col space-y-2 w-[80%]">
        <p className="text-gray-200 text-base font-medium">Username</p>
        <div className="relative">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full bg-[#282a36] text-gray-300 placeholder-gray-500 rounded-lg py-3 pl-10 pr-4 border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="flex flex-col space-y-2 w-[80%]">
        <p className="text-gray-200 text-base font-medium">Email</p>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full bg-[#282a36] text-gray-300 placeholder-gray-500 rounded-lg py-3 pl-10 pr-4 border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
      </div>


      <div className="flex flex-col space-y-2 w-[80%]">
        <p className="text-gray-200 text-base font-medium">Password</p>
        <div className="relative">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full bg-[#282a36] text-gray-300 placeholder-gray-500 rounded-lg py-3 pl-10 pr-4 border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
      </div>

     
      <div className="flex flex-col space-y-2 w-[80%]">
        <p className="text-gray-200 text-base font-medium">Confirm Password</p>
        <div className="relative">
          <input
            type="password"
            value={cpassword}
            onChange={(e) => setCpassword(e.target.value)}
            placeholder="Confirm your password"
            className="w-full bg-[#282a36] text-gray-300 placeholder-gray-500 rounded-lg py-3 pl-10 pr-4 border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <button
        type="submit"
        className="w-[80%] bg-cyan-400 font-semibold text-center text-black p-3 rounded-md mt-3 cursor-pointer"
      >
        Register
      </button>

      <p className="text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-cyan-300 font-bold">
          Log in
        </Link>
      </p>

      <div className="flex flex-col gap-4 w-full items-center">
        <div className="bg-gray-800 p-3 w-[80%] font-semibold gap-4 flex items-center justify-center rounded-md cursor-pointer transition hover:ring-cyan-400 hover:ring">
          <FaTwitch className="w-6 h-6" />
          <p>Continue with Twitch</p>
        </div>
        <div className="bg-gray-800 p-3 w-[80%] font-semibold flex gap-4 items-center justify-center rounded-md cursor-pointer transition hover:ring-cyan-400 hover:ring">
          <FaGoogle className="w-6 h-6" />
          <p>Continue with Google</p>
        </div>
      </div>
    </form>
  );
}
