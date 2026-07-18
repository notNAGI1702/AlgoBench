import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="py-8 bg-[#FAF6F0] border-t-2 border-[#1E1E1E] flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-neutral-500">
      <div>
        © 2026 AlgoBench.
      </div>
      <div className="flex gap-4 items-center">
        <span>VITE</span>
        <span>•</span>
        <span>REACT 19</span>
        <span>•</span>
        <span>TAILWIND V4</span>
        <span>•</span>
        <span>MONACO EDITOR</span>
      </div>
    </footer>
  );
};
