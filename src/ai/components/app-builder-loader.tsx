import { Loader2Icon, WrenchIcon, CpuIcon } from "lucide-react";

export function AppBuilderLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-6 space-y-4">
      <div className="flex items-center space-x-3">
        <WrenchIcon className="w-6 h-6 animate-bounce text-blue-500" />
        <CpuIcon className="w-6 h-6 animate-bounce text-purple-500 delay-150" />
        <Loader2Icon className="w-6 h-6 animate-spin text-green-500" />
      </div>
      <p className="text-sm text-gray-500">Generating your app...</p>

      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full w-1/3 bg-gradient-to-r from-blue-500 to-purple-500 animate-[progress_1.5s_ease-in-out_infinite]" />
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
