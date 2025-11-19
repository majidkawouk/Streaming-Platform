"use client";
import { Search, TvMinimalPlay, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import Link from "next/link";

export default function Header() {
  const {logout,user} = useUser()
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-[#111120] p-4 flex items-center justify-between shadow-md border-b border-gray-800">
   
      <div className="flex items-center">
        <TvMinimalPlay className="text-cyan-300 w-10 h-10 m-1" />
        <p className="text-cyan-300 text-lg font-semibold ml-2 tracking-wide">
          Streaming Platform
        </p>
      </div>


      <div className="flex space-x-5 pr-4 items-center">
 
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-5 h-5 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-800 text-white placeholder-gray-500 rounded-md py-2 pl-10 pr-4 ring-1 ring-gray-700 focus:ring-cyan-300 focus:outline-none transition-all w-64"
          />
        </div>


        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="text-cyan-300 rounded-full p-1 hover:bg-gray-800 transition-all focus:ring-2 ring-cyan-300"
          >
            <User className="w-8   h-8" />
          </button>


         {dropdownOpen && (
    <div
      className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg ring-1 ring-gray-700 z-50 animate-fadeIn"
    >
      <ul className="py-2 text-sm text-gray-200">
        <li className="px-4 py-2 hover:bg-gray-800 cursor-pointer transition">
          <Link  href={`/profile/${user?.id}`}>Profile</Link>
        </li>
        <li className="px-4 py-2 hover:bg-gray-800 cursor-pointer transition">
          <Link href="/settings">Settings</Link>
        </li>
        <li className="text-red-400 hover:bg-red-500/20 cursor-pointer transition">
          {user ? 
            <button 
              onClick={logout}
       
              className="block w-full text-left px-4 py-2 " 
            >
              Sign Out
            </button> 
            :
            <Link href={'/login'}
      
              className="block px-4 py-2"
            >
              login
            </Link> 
          }
        </li>
      </ul>
    </div>
 )}
        </div>
      </div>
    </header>
  );
}
