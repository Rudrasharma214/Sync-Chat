import React from "react";

const AuthImagePattern = ({ title, subtitle }) => {
  const shapes = [
    "rounded-xl bg-primary",
    "rounded-full bg-secondary",
    "rotate-12 rounded-md bg-accent",
    "rounded-3xl scale-110 bg-base-200",
    "rotate-3 rounded-xl scale-90 bg-primary",
    "rounded-full rotate-45 bg-neutral",
    "rounded-full -rotate-12 bg-secondary",
    "rounded-2xl -rotate-6 bg-base-200 ",
    "rounded-md scale-105 bg-accent",
  ];

  return (
    <div className="hidden lg:flex items-center justify-center bg-transparent p-12">
      <div className="w-full max-w-md text-center">
        {/* Pattern grid with theme-based colored shapes */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`w-24 h-24 transition-all duration-700 ${shapes[i % shapes.length]} animate-pulse`}
            />
          ))}
        </div>

        {/* Text below the grid */}
        <h2 className="text-3xl font-bold text-base-content drop-shadow mb-3">{title}</h2>
        <p className="text-base-content/60 text-base">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
