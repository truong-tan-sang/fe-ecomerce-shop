"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Info, X, XCircle } from "lucide-react";
import { theme } from "@/lib/theme";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  const icon = type === "error" ? (
    <XCircle size={18} style={{ color: theme.status.error }} aria-hidden />
  ) : type === "info" ? (
    <Info size={18} style={{ color: theme.status.info }} aria-hidden />
  ) : (
    <CheckCircle size={18} style={{ color: theme.status.success }} aria-hidden />
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 320); // Allow fade-out animation
    }, duration);

    return () => {
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
        className={`relative overflow-hidden px-5 py-4 min-w-[320px] max-w-md border shadow-sm bg-gradient-to-br`}
        style={{
          color: theme.text.primary,
          background: theme.gradient.toast,
          borderColor: theme.border.accent,
          boxShadow: `0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 ${theme.border.light}`,
        }}
      >
        {/* Corner brackets */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t border-l" style={{ borderColor: theme.border.light }} />
          <div className="absolute -top-[1px] -right-[1px] w-3 h-3 border-t border-r" style={{ borderColor: theme.border.light }} />
          <div className="absolute -bottom-[1px] -left-[1px] w-3 h-3 border-b border-l" style={{ borderColor: theme.border.light }} />
          <div className="absolute -bottom-[1px] -right-[1px] w-3 h-3 border-b border-r" style={{ borderColor: theme.border.light }} />
        </div>

        {/* Floating shapes */}
        <div className="pointer-events-none absolute -right-6 -top-4 h-16 w-16 rotate-12" style={{ background: `${theme.ui.shape.primary}33`, clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" }} />
        <div className="pointer-events-none absolute -left-4 bottom-6 h-10 w-10 -rotate-6" style={{ background: `${theme.ui.shape.primary}44`, clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)" }} />

        {/* Content */}
        <div className="relative flex items-start gap-3">
          <div className="mt-[2px] flex h-8 w-8 items-center justify-center rounded-sm border border" style={{ background: `${theme.ui.shape.primary}22`, borderColor: theme.border.light }}>
            {icon}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-3">
              <span className="text-sm font-semibold leading-5 tracking-tight">{message}</span>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="p-1 rounded-sm hover:opacity-80 transition-opacity cursor-pointer"
                aria-label="Close"
              >
                <X size={14} style={{ color: theme.text.primary }} />
              </button>
            </div>
            {/* <div className="text-[11px] uppercase tracking-[0.12em] text-white/70">system message</div> */}
          </div>
        </div>

        {/* Accent line */}
        <div className="relative mt-3 h-[2px] w-full overflow-hidden" style={{ background: theme.border.light }}>
          <div className="absolute inset-0 bg-gradient-to-r animate-toast-shimmer" style={{ backgroundImage: `linear-gradient(to right, transparent, ${theme.accent.primary}, transparent)` }} />
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
