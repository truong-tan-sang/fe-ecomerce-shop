"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Info, X, XCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const tone = useMemo(() => {
    if (type === "error") {
      return {
        bg: "from-[#1b0c0f] via-[#2d0d12] to-[#1b0c0f]",
        border: "border-red-500/50",
        glow: "shadow-[0_0_18px_rgba(248,113,113,0.45)]",
        accent: "bg-gradient-to-r from-red-500 to-red-400",
        icon: <XCircle size={18} className="text-red-300" aria-hidden />,
      };
    }
    if (type === "info") {
      return {
        bg: "from-[#0d1117] via-[#0c141f] to-[#0d1117]",
        border: "border-blue-400/50",
        glow: "shadow-[0_0_18px_rgba(96,165,250,0.35)]",
        accent: "bg-gradient-to-r from-blue-400 to-cyan-300",
        icon: <Info size={18} className="text-blue-200" aria-hidden />,
      };
    }
    return {
      bg: "from-[#0f130d] via-[#111811] to-[#0f130d]",
      border: "border-emerald-400/50",
      glow: "shadow-[0_0_18px_rgba(52,211,153,0.35)]",
      accent: "bg-gradient-to-r from-emerald-400 to-lime-300",
      icon: <CheckCircle size={18} className="text-emerald-200" aria-hidden />,
    };
  }, [type]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev - 100 / (duration / 50);
        return next < 0 ? 0 : next;
      });
    }, 50);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 320); // Allow fade-out animation
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  return (
    <div
      className={`fixed top-4 right-4 z-[60] transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      <div
        className={`relative overflow-hidden text-white px-5 py-4 min-w-[320px] max-w-md border ${tone.border} ${tone.glow} bg-gradient-to-br ${tone.bg}`}
        style={{
          boxShadow: "0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Corner brackets */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t border-l border-white/40" />
          <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t border-r border-white/40" />
          <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b border-l border-white/40" />
          <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b border-r border-white/40" />
        </div>

        {/* Floating shapes */}
        <div className="pointer-events-none absolute -right-6 -top-4 h-16 w-16 rotate-12 bg-white/3 group-hover:bg-white/5" style={{ clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" }} />
        <div className="pointer-events-none absolute -left-4 bottom-6 h-10 w-10 -rotate-6 bg-white/5" style={{ clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }} />

        {/* Content */}
        <div className="relative flex items-start gap-3">
          <div className="mt-[2px] flex h-8 w-8 items-center justify-center rounded-sm bg-white/10 border border-white/15 shadow-inner">
            {tone.icon}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-semibold leading-5 tracking-tight">{message}</span>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="p-1 rounded-sm hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
            {/* <div className="text-[11px] uppercase tracking-[0.12em] text-white/70">system message</div> */}
          </div>
        </div>

        {/* Accent line */}
        <div className={`mt-3 h-[1px] w-full ${tone.accent}`} />

        {/* Progress bar */}
        <div className="relative mt-2 h-1 bg-white/10 overflow-hidden rounded-sm">
          <div
            className={`h-full ${tone.accent}`}
            style={{ width: `${progress}%`, transition: "width 80ms linear" }}
          />
        </div>
      </div>
    </div>
  );
}

// Toast container for managing multiple toasts
interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}
