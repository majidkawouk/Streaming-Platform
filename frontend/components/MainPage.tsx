"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StreamThum from "@/components/StreamThum";

export default function Mainpage() {
  const [producersList, setProducersList] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); 
  }, []);

  useEffect(() => {
    if (!isMounted) return; 

    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3000/producers");
        const data = await res.json();
        setProducersList(data);
      } catch (err) {
        console.error("Error fetching producers:", err);
      }
    };

    fetchData();
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
    <div className="min-h-screen p-5 space-y-12">
    
      <section>
        <h1 className="text-white font-bold text-3xl mb-6">Live Channels</h1>

        {producersList.length === 0 ? (
          <p className="text-gray-400">No live streams currently.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {producersList.map((producer) => (
              <Link
                key={producer.id}
                href={`/${producer.id}`}
                className="group relative overflow-hidden rounded-2xl hover:scale-[1.03] transition-transform shadow-lg"
              >
                <StreamThum />
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
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-3">
                <h3 className="text-white font-semibold text-lg">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
