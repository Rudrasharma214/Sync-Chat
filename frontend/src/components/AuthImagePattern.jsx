import React from "react";
import { useTheme } from "../context/ThemeContext";

const AuthImagePattern = ({ title, subtitle }) => {
  const { isDarkMode } = useTheme();
  const shapes = isDarkMode
    ? [
      "rounded-xl bg-amber-400/30",
      "rounded-full bg-amber-500/28",
      "rotate-12 rounded-md bg-orange-300/24",
      "rounded-3xl scale-110 bg-slate-600/38",
      "rotate-3 rounded-xl scale-90 bg-amber-500/24",
      "rounded-full rotate-45 bg-slate-500/32",
      "rounded-full -rotate-12 bg-amber-300/26",
      "rounded-2xl -rotate-6 bg-slate-700/42",
      "rounded-md scale-105 bg-orange-200/20",
    ]
    : [
      "rounded-xl bg-amber-400/60",
      "rounded-full bg-amber-500/45",
      "rotate-12 rounded-md bg-orange-300/60",
      "rounded-3xl scale-110 bg-slate-200/80",
      "rotate-3 rounded-xl scale-90 bg-amber-500/40",
      "rounded-full rotate-45 bg-slate-300/70",
      "rounded-full -rotate-12 bg-amber-300/60",
      "rounded-2xl -rotate-6 bg-slate-100/90",
      "rounded-md scale-105 bg-orange-200/70",
    ];

  return (
    <div className="theme-bg relative hidden items-center justify-center overflow-hidden lg:flex">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.14),_transparent_55%)]" />
      <div className="relative w-full max-w-md px-8 text-center lg:px-10">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`w-24 h-24 transition-all duration-700 ${shapes[i % shapes.length]} animate-pulse`}
            />
          ))}
        </div>

        <h2 className="theme-text mb-3 text-4xl font-bold drop-shadow-sm">{title}</h2>
        <p className="theme-muted text-base">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
