import { Loader2, Sparkles } from "lucide-react";

const Loading = ({ message = "Loading SkillConnect..." }) => {
  return (
    <div className="flex min-h-[360px] w-full items-center justify-center p-8">
      <div className="flex flex-col items-center max-w-xs text-center">
        <div className="relative flex items-center justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-inner">
            <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin absolute -inset-1 opacity-70" />
        </div>
        <p className="text-sm font-semibold text-slate-700 tracking-tight">
          {message}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Fetching latest real-time information...
        </p>
      </div>
    </div>
  );
};

export default Loading;
