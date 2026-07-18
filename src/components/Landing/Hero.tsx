import React, { useEffect, useState } from 'react';
import { ArrowRight, Cpu, Code } from 'lucide-react';
import { playbackStore } from '../../store/usePlaybackStore';

export const Hero: React.FC = () => {
  const handleEnterWorkspace = () => {
    playbackStore.setState({ activeTab: 'visualizer', activeCategory: 'sorting', activeAlgorithmId: 'bubble' });
  };

  const handleEnterRace = () => {
    playbackStore.setState({ activeTab: 'race', activeCategory: 'sorting', raceAlgorithmIdLeft: 'bubble', raceAlgorithmIdRight: 'quick' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[500px] border-b-2 border-[#1E1E1E] pb-12">
      {/* Left Column: Bold Typography & Action Callouts */}
      <div className="lg:col-span-7 flex flex-col items-start text-left">
        <div className="bg-[#FF5A00] text-[#FAF6F0] border-2 border-[#1E1E1E] px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider mb-6 neo-shadow">
          Interactive SDE Portfolio
        </div>
        
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-[#1E1E1E] leading-[1.05] mb-6">
          ALGORITHM <br />
          <span className="text-[#FF5A00] underline decoration-wavy underline-offset-8">VISUALIZER</span> <br />
          PLAYGROUND.
        </h1>
        
        <p className="font-sans text-base text-neutral-600 max-w-xl mb-8 leading-relaxed">
          An interactive, high-performance sandbox to write, compile, and visualize sorting, searching, and pathfinding algorithms. Code in real-time inside Monaco, execution is sandboxed, and trace playback side-by-side.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={handleEnterWorkspace}
            className="px-6 py-3.5 bg-[#FF5A00] text-[#FAF6F0] font-mono text-sm font-bold uppercase border-2 border-[#1E1E1E] neo-shadow hover:bg-[#E04F00] flex items-center justify-center gap-2 group cursor-pointer"
          >
            Enter Playground
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          
          <button
            onClick={handleEnterRace}
            className="px-6 py-3.5 bg-[#FAF6F0] text-[#1E1E1E] font-mono text-sm font-bold uppercase border-2 border-[#1E1E1E] neo-shadow hover:bg-neutral-100 flex items-center justify-center gap-2 cursor-pointer"
          >
            Launch Race Mode
            <Cpu className="w-4 h-4 text-[#FF5A00]" />
          </button>
        </div>
      </div>

      {/* Right Column: Looping Mini Sorting Loop Canvas */}
      <div className="lg:col-span-5 flex justify-center w-full">
        <div className="w-full max-w-[380px] bg-[#FAF6F0] neo-border p-5 neo-shadow-static flex flex-col gap-4 relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-[#1E1E1E]/20 pb-2">
            <span className="font-mono text-xs font-bold text-neutral-500 uppercase flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-[#FF5A00]" />
              Active Loop: Bubble Sort
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping"></span>
          </div>

          {/* Render Mini Sorting Loop Canvas */}
          <MiniSortLoop />

          <div className="text-[10px] font-mono text-neutral-400 leading-normal bg-white p-2 border border-dashed border-[#1E1E1E]/20 text-center">
            Looping array of 10 items. orange bars denote comparison, green bars show completed sort state.
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini Self-Contained sorting loop component
const MiniSortLoop: React.FC = () => {
  const [array, setArray] = useState<number[]>([35, 12, 80, 45, 95, 23, 62, 18, 55, 71]);
  const [activeIdx, setActiveIdx] = useState<number[]>([]);
  const [isSorted, setIsSorted] = useState(false);

  useEffect(() => {
    let active = true;
    
    const runLoop = async () => {
      while (active) {
        // Reset state
        const initial = Array.from({ length: 10 }, () => Math.floor(Math.random() * 85) + 15);
        setArray(initial);
        setActiveIdx([]);
        setIsSorted(false);
        await new Promise((r) => setTimeout(r, 800));

        // Bubble Sort Generation
        const arr = [...initial];
        const n = arr.length;
        
        for (let i = 0; i < n - 1; i++) {
          let swapped = false;
          for (let j = 0; j < n - i - 1; j++) {
            if (!active) return;
            setActiveIdx([j, j + 1]);
            await new Promise((r) => setTimeout(r, 120));

            if (arr[j] > arr[j + 1]) {
              const temp = arr[j];
              arr[j] = arr[j + 1];
              arr[j + 1] = temp;
              setArray([...arr]);
              swapped = true;
              await new Promise((r) => setTimeout(r, 80));
            }
          }
          if (!swapped) break;
        }

        if (!active) return;
        setIsSorted(true);
        setActiveIdx([]);
        await new Promise((r) => setTimeout(r, 1500));
      }
    };

    runLoop();

    return () => {
      active = false;
    };
  }, []);

  const max = Math.max(...array);

  return (
    <div className="h-44 bg-white border border-[#1E1E1E]/20 flex items-end justify-between p-4 gap-1.5">
      {array.map((val, idx) => {
        const isHighlight = activeIdx.includes(idx);
        const height = `${(val / max) * 100}%`;
        
        let color = 'bg-[#FAF6F0]';
        if (isSorted) {
          color = 'bg-[#10B981]';
        } else if (isHighlight) {
          color = 'bg-[#FF5A00]';
        }

        return (
          <div
            key={idx}
            style={{ height }}
            className={`flex-1 border border-[#1E1E1E] transition-all duration-100 ${color}`}
          />
        );
      })}
    </div>
  );
};
