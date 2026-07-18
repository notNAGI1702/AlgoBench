import React from 'react';
import { playbackStore } from '../../store/usePlaybackStore';
import { ArrowUpRight, BarChart3, Search, Map } from 'lucide-react';

export const CategoryGrid: React.FC = () => {
  const handleSelectCategory = (cat: 'sorting' | 'searching' | 'pathfinding') => {
    const defaultAlg = cat === 'sorting' ? 'bubble' : cat === 'searching' ? 'linear' : 'bfs';
    playbackStore.setState({ 
      activeTab: 'visualizer', 
      activeCategory: cat, 
      activeAlgorithmId: defaultAlg,
      steps: [],
      currentStepIndex: 0,
      isPlaying: false
    });
  };

  return (
    <div className="py-12 border-b-2 border-[#1E1E1E]">
      {/* Title */}
      <h2 className="font-serif text-3xl font-bold tracking-tight mb-8 text-left uppercase text-[#1E1E1E]">
        EXPLORE CATEGORIES.
      </h2>
      
      {/* Asymmetric cards list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sorting Card */}
        <div 
          onClick={() => handleSelectCategory('sorting')}
          className="group neo-border bg-[#FAF6F0] p-6 neo-shadow hover:-translate-y-1 hover:bg-white transition-all cursor-pointer flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#FF5A00]/10 border border-[#FF5A00]/20 text-[#FF5A00]">
                <BarChart3 className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-[#FF5A00] transition-colors" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1E1E1E] mb-2 uppercase">Sorting</h3>
            <p className="font-sans text-xs text-neutral-600 leading-relaxed">
              Trace execution steps of Bubble, Insertion, Merge, Quick, and Heap Sort. Play back array swaps and writes.
            </p>
          </div>
          <div className="mt-4 font-mono text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            5 Algorithms Supported
          </div>
        </div>

        {/* Searching Card */}
        <div 
          onClick={() => handleSelectCategory('searching')}
          className="group neo-border bg-[#FAF6F0] p-6 neo-shadow hover:-translate-y-1 hover:bg-white transition-all cursor-pointer flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#002FA7]/10 border border-[#002FA7]/20 text-[#002FA7]">
                <Search className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-[#002FA7] transition-colors" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1E1E1E] mb-2 uppercase">Searching</h3>
            <p className="font-sans text-xs text-neutral-600 leading-relaxed">
              Check indexes sequentially with Linear Search, or halve searching boundaries via sorted Binary Search intervals.
            </p>
          </div>
          <div className="mt-4 font-mono text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            2 Algorithms Supported
          </div>
        </div>

        {/* Pathfinding Card */}
        <div 
          onClick={() => handleSelectCategory('pathfinding')}
          className="group neo-border bg-[#FAF6F0] p-6 neo-shadow hover:-translate-y-1 hover:bg-white transition-all cursor-pointer flex flex-col justify-between min-h-[220px]"
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]">
                <Map className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-neutral-400 group-hover:text-[#10B981] transition-colors" />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1E1E1E] mb-2 uppercase">Pathfinding</h3>
            <p className="font-sans text-xs text-neutral-600 leading-relaxed">
              Run BFS, DFS, Dijkstra, and A* on dynamic grid wall mazes. Paint custom walls and watch heuristics guide paths.
            </p>
          </div>
          <div className="mt-4 font-mono text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            4 Algorithms Supported
          </div>
        </div>

      </div>
    </div>
  );
};
