import React from 'react';
import { TreeState } from '../types';

interface OverlayProps {
  mode: string;
  setMode: (m: string) => void;
}

export const Overlay: React.FC<OverlayProps> = ({ mode, setMode }) => {
  const isTree = mode === TreeState.TREE;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 md:p-12">
      {/* Header */}
      <header className="flex flex-col items-start">
        <h1 className="text-4xl md:text-6xl font-serif text-amber-100 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] tracking-wide">
          SOPHIE BB's <span className="text-emerald-400 text-2xl md:text-3xl font-light block mt-2 tracking-widest font-sans">CHRISTMAS TREE</span>
        </h1>
      </header>

      {/* Controls */}
      <div className="flex flex-col items-center pointer-events-auto gap-6 mb-8">
         <p className="text-emerald-100/60 font-serif italic text-lg max-w-md text-center">
            {isTree 
              ? "Experience the elegance of unity and form." 
              : "Embrace the chaos of creation before the moment connects."}
         </p>
         
         <button 
           onClick={() => setMode(isTree ? TreeState.SCATTERED : TreeState.TREE)}
           className={`
             relative overflow-hidden group px-10 py-4 rounded-full 
             border border-amber-200/30 backdrop-blur-md transition-all duration-700
             ${isTree ? 'bg-emerald-900/40' : 'bg-transparent'}
           `}
         >
            <div className={`absolute inset-0 bg-gradient-to-r from-amber-200/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <span className="relative z-10 font-sans text-amber-50 tracking-[0.2em] uppercase text-sm font-semibold group-hover:text-amber-300 transition-colors">
              {isTree ? 'Scatter Elements' : 'Assemble Tree'}
            </span>
         </button>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 right-8 text-right hidden md:block">
        <p className="text-amber-500/40 text-xs font-sans tracking-widest uppercase">
          Interactive 3D Experience
        </p>
      </div>
    </div>
  );
};