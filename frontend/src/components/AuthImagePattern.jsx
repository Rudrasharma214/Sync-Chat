import React from "react";

const AuthImagePattern = ({ title, subtitle }) => {
  const shapes = [
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
    <div className="relative hidden items-center justify-center overflow-hidden bg-white lg:flex">
      <div className="relative w-full max-w-md px-8 text-center lg:px-10">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`w-24 h-24 transition-all duration-700 ${shapes[i % shapes.length]} animate-pulse`}
            />
          ))}
        </div>

        <h2 className="mb-3 text-4xl font-bold text-slate-900 drop-shadow-sm">{title}</h2>
        <p className="text-base text-slate-700">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
