import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none animate-bounce">
      <div className="px-4 py-2.5 rounded-full bg-slate-900/90 border border-purple-400/40 text-white font-extrabold text-xs sm:text-sm shadow-2xl backdrop-blur-md flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-300" />
        <span>{message}</span>
      </div>
    </div>
  );
};
