"use client";
import StreamThum from "@/components/StreamThum";
import Link from "next/link";
import { useEffect, useState } from "react";
export default function   HomePage() {
  const [producersList, setProducersList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("http://localhost:3000/producers");
      const data = await res.json();
      setProducersList(data);
    };
    fetchData();
  }, []);

  return (
      <div className="bg-[#111120] p-5 space-y-8 block">
       <h1 className="text-white font-bold text-4xl">Live Channels</h1>
       <div className="flex gap-4">
        {producersList.map((producer: { id: string }  ) => (
          <Link key={producer.id } href={`/${producer.id}`} className=" block">
            <StreamThum/>
            <h1 className="text-white">dasdasdasdasd</h1>
            {producer.id}
          </Link>
        ))}
        </div>
        
        
      </div>
  );
}
