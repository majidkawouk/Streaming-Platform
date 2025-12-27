import { User } from "lucide-react";

interface Props {
  title: string;
  channelName: string;
}

export default function StreamThum({ title, channelName }: Props) {
  return (
    <div className="h-80 w-full space-y-2 text-white">
      <div className="bg-neutral-800 w-full h-[80%] rounded-md relative">
        <div className="bg-red-500 px-3 rounded-lg absolute top-3 left-3 font-semibold">
          LIVE
        </div>
      </div>

      <div className="flex gap-2">
        <div className="rounded-full flex items-center justify-center bg-black w-12 h-12">
          <User className="w-7 h-7" />
        </div>

        <div className="flex flex-col overflow-hidden">
          <h1 className="font-semibold text-lg truncate">
            {title || "No title"}
          </h1>

          <h2 className="text-sm text-white ">{channelName}</h2>

        </div>
      </div>
    </div>
  );
}
