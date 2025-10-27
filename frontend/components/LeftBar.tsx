import { Compass, HomeIcon } from "lucide-react";

export default function LeftBar(){
    return(
        <div className="flex flex-col gap-6 w-60 h-screen bg-[#1F2937] p-4 text-gray-200 border-r border-gray-700">
            <div className="flex flex-col gap-2">

                <div className="flex items-center space-x-3 p-2 rounded-md bg-gray-700 text-cyan-300 cursor-pointer">
                    <HomeIcon className="w-6 h-6"/> 
                    <p className="font-semibold">Home</p>
                </div>


                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
                    <Compass className="w-6 h-6"/> 
                    <p>Browse</p>
                </div>
            </div>


            <div className="flex flex-col gap-3 pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-xs font-semibold uppercase">Followed Channels</p>

    
                <div className="flex items-center justify-between text-sm hover:bg-gray-700 p-1 rounded-md cursor-pointer">
                    
           
                    <div className="flex items-center gap-2">
                        <div className="bg-cyan-300 w-6 h-6 rounded-full flex-shrink-0">
           
                        </div>
                        <p className="font-medium truncate">Streamer Name</p> 
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <div className="bg-red-500 w-2 h-2 rounded-full flex-shrink-0"></div> 
                        <p className="text-gray-400 text-xs">21k</p> 
                    </div>
                </div>

            </div>
        </div>
    )
}