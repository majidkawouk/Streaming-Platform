import { User } from "lucide-react";

export default function StreamThum() {
  return (
    <div className="h-80 w-100 space-y-2">
      <div className="bg-white w-full h-[80%] rounded-md relative">
        <div className="bg-red-500 text-white px-3 rounded-lg absolute top-3 left-3 font-semibold">
          LIVE
        </div>
        <div className="bg-gray-500 rounded-md px-2 absolute bottom-4 right-3">12k viewers</div>
      </div>
      <div className="flex w-full h-[20%] gap-2 text-white">
        <div className="rounded-full flex items-center justify-center bg-black  w-12 h-12"><User className="w-8 h-8"/></div>
        <div className="flex flex-col">
          <h1 className="font-semibold text-lg">Steream desc</h1>
          <h2 className=" text-sm text-gray-400">Chanel name</h2>
        </div>
      </div>
    </div>
  );
}
