"use client";
import { Eye, EyeClosed, Mail,Lock } from "lucide-react";

import Link from "next/link";
import { useState } from "react";
import { FaGoogle, FaTwitch } from "react-icons/fa6";
import { useUser } from "@/context/UserContext";
export default function Login() {
  const [showpass, setshowpass] = useState(false);
  const [email, setemail] = useState<string>("");
  const [password, setopassword] = useState<string>("");
  const { login } = useUser();

  return (
    <form className="border-[1px] text-white rounded-lg gap-5 shadow-xl  border-gray-600 md:w-[40%] lg:w-[30%] w-[50%] min-h-150 py-10  flex flex-col items-center">
      <h1 className="text-2xl font-semibold">Welcome Back</h1>
      <p>Log in to continue your journey</p>
      <div className="flex flex-col space-y-2 w-[80%]">
        <p className="text-gray-200 text-base font-medium">Email</p>
        <div className="relative">
          <input
            type="text"
            onChange={(e) => setemail(e.target.value)}
            value={email}
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
            onChange={(e) => setopassword(e.target.value)}
            value={password}
            type={showpass ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full bg-[#282a36] text-gray-300 placeholder-gray-500 rounded-lg py-3 pl-10 pr-4 border border-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />

          {showpass ? (
            <Eye
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 cursor-pointer"
              onClick={() => setshowpass((showpass) => !showpass)}
            />
          ) : (
            <EyeClosed
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 cursor-pointer"
              onClick={() => setshowpass((showpass) => !showpass)}
            />
          )}
        </div>
        <p className="text-sm text-gray-400 text-right cursor-pointer hover:text-cyan-300">
          forget password?
        </p>
      </div>

      <button
        className="w-[80%] bg-cyan-400  text-center font-semibold text-black p-3 rounded-md mt-3 "
        onClick={() => login(email, password)}
      >
        Login
      </button>

      <p className="text-gray-400">
        Don&apos;t have an account ?{" "}
        <Link href="/register" className="text-cyan-300 font-bold">
          Sign Up
        </Link>
      </p>
      <div className="flex justify-center items-center gap-2 text-gray-500">
        <hr className="text-gray-500 w-12" />
        or continue with
         <hr className="text-gray-500  w-12" />
      </div>

      <div className="flex gap-4">
        <div className="bg-gray-800 p-3 rounded-full cursor-pointer transition hover:ring-cyan-400 hover:ring">
          <FaTwitch className="w-6 h-6" />
        </div>
        <div className="bg-gray-800 p-3 rounded-full cursor-pointer transition hover:ring-cyan-400 hover:ring">
          <FaGoogle className="w-6 h-6" />
        </div>
      </div>
    </form>
  );
}
