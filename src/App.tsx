import React from 'react';
import { usePlaybackStore, playbackStore } from './store/usePlaybackStore';
import { Hero } from './components/Landing/Hero';
import { CategoryGrid } from './components/Landing/CategoryGrid';
import { Footer } from './components/Landing/Footer';
import { VisualizerView } from './components/Visualizer/VisualizerView';
import { RaceView } from './components/Race/RaceView';
import { Zap } from 'lucide-react';

const App: React.FC = () => {
  const activeTab = usePlaybackStore((s) => s.activeTab);

  const handleTabChange = (tab: 'landing' | 'visualizer' | 'race') => {
    playbackStore.setState({ 
      activeTab: tab,
      isPlaying: false,
      steps: [],
      raceSteps: [],
      currentStepIndex: 0,
      raceCurrentStepIndex: 0
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between max-w-[1320px] mx-auto border-x-2 border-[#1E1E1E] bg-[#FAF6F0] relative">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#FAF6F0] border-b-2 border-[#1E1E1E] px-4 md:px-6 py-2 flex justify-between items-center select-none">
        {/* Brand logo */}
        <div 
          onClick={() => handleTabChange('landing')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="bg-[#FF5A00] text-[#FAF6F0] border-2 border-[#1E1E1E] p-1.5 neo-shadow group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-[#1E1E1E] uppercase">
            Algo<span className="text-[#FF5A00]">Bench</span>
          </span>
        </div>

        {/* Navigation tabs */}
        <nav className="flex gap-2 md:gap-4 font-mono text-xs font-bold uppercase">
          <button
            onClick={() => handleTabChange('landing')}
            className={`px-3 py-1.5 border-2 transition-all cursor-pointer ${
              activeTab === 'landing'
                ? 'bg-[#1E1E1E] text-[#FAF6F0] border-[#1E1E1E]'
                : 'border-transparent hover:border-[#1E1E1E]/20 text-neutral-600'
            }`}
          >
            Home
          </button>
          
          <button
            onClick={() => handleTabChange('visualizer')}
            className={`px-3 py-1.5 border-2 transition-all cursor-pointer ${
              activeTab === 'visualizer'
                ? 'bg-[#1E1E1E] text-[#FAF6F0] border-[#1E1E1E]'
                : 'border-transparent hover:border-[#1E1E1E]/20 text-neutral-600'
            }`}
          >
            Workspace
          </button>
          
          <button
            onClick={() => handleTabChange('race')}
            className={`px-3 py-1.5 border-2 transition-all cursor-pointer ${
              activeTab === 'race'
                ? 'bg-[#1E1E1E] text-[#FAF6F0] border-[#1E1E1E]'
                : 'border-transparent hover:border-[#1E1E1E]/20 text-neutral-600'
            }`}
          >
            Race Mode
          </button>
        </nav>
      </header>

      {/* Main Content Router */}
      <main className="flex-1 w-full p-3 md:p-5">
        {activeTab === 'landing' && (
          <div className="flex flex-col gap-5">
            <Hero />
            <CategoryGrid />
          </div>
        )}
        
        {activeTab === 'visualizer' && <VisualizerView />}
        
        {activeTab === 'race' && <RaceView />}
      </main>

      {/* Footer */}
      <div className="px-4 md:px-8">
        <Footer />
      </div>
    </div>
  );
};

export default App;
