import { CheckCircle2, X, XCircle } from "lucide-react";

const Toast = ({ message, type = "error", onClose }) => {
  if (!message) return null;
  
  const isSuccess = type === "success";
  const palette = isSuccess
    ? "bg-white/60 dark:bg-slate-900/60 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 shadow-[0_8px_30px_rgba(16,185,129,0.15)]"
    : "bg-white/60 dark:bg-slate-900/60 border-coral/30 text-coral dark:text-coral shadow-[0_8px_30px_rgba(244,63,94,0.15)]";
    
  const Icon = isSuccess ? CheckCircle2 : XCircle;
  const iconColor = isSuccess ? "text-emerald-500" : "text-coral";

  return (
    <div className={`fixed left-1/2 top-6 z-[100] w-[min(92vw,28rem)] -translate-x-1/2 animate-[slideDown_0.3s_ease-out] rounded-2xl border px-4 py-3.5 backdrop-blur-xl ${palette}`}>
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-3 text-sm font-black">
          <Icon size={20} className={`flex-shrink-0 ${iconColor}`} /> 
          <span>{message}</span>
        </p>
        <button 
          className={`rounded-full p-1.5 transition-colors ${isSuccess ? "hover:bg-emerald-500/20" : "hover:bg-coral/20"}`} 
          onClick={onClose} 
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
