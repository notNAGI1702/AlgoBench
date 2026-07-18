import React, { useState, useEffect } from 'react';
import { usePlaybackStore, playbackStore } from '../../store/usePlaybackStore';
import { ArrayCanvas } from './ArrayCanvas';
import { GridCanvas } from './GridCanvas';
import { ControlPanel } from './ControlPanel';
import { StatsBar } from './StatsBar';
import { CodeEditorPanel } from './CodeEditorPanel';
import { SORTING_ALGORITHMS } from '../../algorithms/sortingTemplates';
import { SEARCHING_ALGORITHMS } from '../../algorithms/searchingTemplates';
import { PATHFINDING_ALGORITHMS } from '../../algorithms/pathfindingTemplates';
import { Shuffle, Check, Grid, LayoutList } from 'lucide-react';

export const VisualizerView: React.FC = () => {
  const activeCategory = usePlaybackStore((s) => s.activeCategory);
  const activeAlgorithmId = usePlaybackStore((s) => s.activeAlgorithmId);
  const arrayInput = usePlaybackStore((s) => s.arrayInput);
  
  const [arrayTextInput, setArrayTextInput] = useState('');
  
  // Keep text input updated when store array updates
  useEffect(() => {
    setArrayTextInput(arrayInput.join(', '));
  }, [arrayInput]);

  const handleCategoryChange = (cat: 'sorting' | 'searching' | 'pathfinding') => {
    const defaultAlg = cat === 'sorting' ? 'bubble' : cat === 'searching' ? 'linear' : 'bfs';
    playbackStore.setState({ 
      activeCategory: cat, 
      activeAlgorithmId: defaultAlg,
      steps: [],
      currentStepIndex: 0,
      isPlaying: false
    });
  };

  const handleAlgorithmChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playbackStore.setState({ 
      activeAlgorithmId: e.target.value,
      steps: [],
      currentStepIndex: 0,
      isPlaying: false
    });
  };

  // Preset generators
  const generateRandomPreset = () => {
    const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 95) + 5);
    playbackStore.setState({ arrayInput: arr, steps: [], currentStepIndex: 0, isPlaying: false });
  };

  const generateSortedPreset = () => {
    const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 95) + 5).sort((a, b) => a - b);
    playbackStore.setState({ arrayInput: arr, steps: [], currentStepIndex: 0, isPlaying: false });
  };

  const generateReverseSortedPreset = () => {
    const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 95) + 5).sort((a, b) => b - a);
    playbackStore.setState({ arrayInput: arr, steps: [], currentStepIndex: 0, isPlaying: false });
  };

  const generateDuplicatesPreset = () => {
    const options = [10, 25, 45, 70, 90];
    const arr = Array.from({ length: 15 }, () => options[Math.floor(Math.random() * options.length)]);
    playbackStore.setState({ arrayInput: arr, steps: [], currentStepIndex: 0, isPlaying: false });
  };

  const generateSingleElementPreset = () => {
    playbackStore.setState({ arrayInput: [42], steps: [], currentStepIndex: 0, isPlaying: false });
  };

  const handleApplyCustomArray = () => {
    const parsed = arrayTextInput
      .split(',')
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => !isNaN(n));
      
    if (parsed.length > 0) {
      playbackStore.setState({ arrayInput: parsed, steps: [], currentStepIndex: 0, isPlaying: false });
    }
  };

  // Graph/Pathfinder wall randomizer
  const generateRandomWalls = () => {
    const nextWalls: Record<string, boolean> = {};
    const rows = 20;
    const cols = 30;
    const startNode = playbackStore.getState().startNode;
    const endNode = playbackStore.getState().endNode;
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Skip start and end nodes
        if ((r === startNode[0] && c === startNode[1]) || (r === endNode[0] && c === endNode[1])) {
          continue;
        }
        // ~25% wall density
        if (Math.random() < 0.25) {
          nextWalls[`${r},${c}`] = true;
        }
      }
    }
    playbackStore.setState({ gridWalls: nextWalls, steps: [], currentStepIndex: 0, isPlaying: false });
  };

  // Get active algorithms lists
  const currentAlgDetails = () => {
    if (activeCategory === 'sorting') {
      return SORTING_ALGORITHMS[activeAlgorithmId];
    } else if (activeCategory === 'searching') {
      return SEARCHING_ALGORITHMS[activeAlgorithmId];
    } else {
      return PATHFINDING_ALGORITHMS[activeAlgorithmId];
    }
  };

  const details = currentAlgDetails();

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 py-8">
      {/* Category selector row */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {/* Category tabs */}
        <div className="flex neo-border bg-[#1E1E1E] p-1.5 gap-1.5 neo-shadow-static w-full md:w-auto">
          {(['sorting', 'searching', 'pathfinding'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-mono font-bold uppercase border-2 transition-colors ${
                activeCategory === cat
                  ? 'bg-[#FF5A00] text-[#FAF6F0] border-[#1E1E1E]'
                  : 'bg-transparent text-neutral-400 border-transparent hover:text-[#FAF6F0]'
              }`}
            >
              {cat === 'pathfinding' ? 'Pathfinding' : cat}
            </button>
          ))}
        </div>

        {/* Algorithm dropdown selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-bold whitespace-nowrap">
            ALGORITHM:
          </label>
          <select
            value={activeAlgorithmId}
            onChange={handleAlgorithmChange}
            className="flex-1 md:w-56 px-3 py-2 neo-border bg-[#FAF6F0] font-mono text-xs font-bold neo-shadow-static cursor-pointer focus:outline-none"
          >
            {activeCategory === 'sorting' &&
              Object.values(SORTING_ALGORITHMS).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            {activeCategory === 'searching' &&
              Object.values(SEARCHING_ALGORITHMS).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            {activeCategory === 'pathfinding' &&
              Object.values(PATHFINDING_ALGORITHMS).map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
          </select>
        </div>
      </div>

      {/* Main visualizer grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Visualizer Canvas + Presets (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          
          {/* Canvas Rendering */}
          {activeCategory === 'pathfinding' ? <GridCanvas /> : <ArrayCanvas />}
          
          {/* Control Dock */}
          <ControlPanel />
          
          {/* Stats Bar */}
          <StatsBar />

          {/* Presets and Custom Inputs panel */}
          <div className="neo-border bg-[#FAF6F0] p-4 neo-shadow-static">
            <h3 className="font-mono text-xs uppercase font-bold tracking-wider text-neutral-500 border-b border-[#1E1E1E]/20 pb-2 mb-3">
              Preset & Custom Inputs Config
            </h3>
            
            {activeCategory !== 'pathfinding' ? (
              // Sorting/Searching Array presets
              <div className="flex flex-col gap-4">
                {/* Array Input Boxes */}
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={arrayTextInput}
                    onChange={(e) => setArrayTextInput(e.target.value)}
                    placeholder="Enter comma-separated values, e.g. 10, 4, 30, 20"
                    className="flex-1 px-3 py-2 neo-border font-mono text-xs bg-white focus:outline-none"
                  />
                  <button
                    onClick={handleApplyCustomArray}
                    className="px-3 bg-neutral-800 text-[#FAF6F0] font-mono text-xs font-bold neo-border neo-shadow hover:bg-neutral-700 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Apply
                  </button>
                </div>
                
                {/* Quick Presets Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={generateRandomPreset}
                    className="px-2.5 py-1.5 bg-[#FAF6F0] neo-border neo-shadow text-[11px] font-mono font-bold hover:bg-neutral-100 flex items-center gap-1"
                  >
                    <Shuffle className="w-3 h-3" />
                    Random
                  </button>
                  <button
                    onClick={generateSortedPreset}
                    className="px-2.5 py-1.5 bg-[#FAF6F0] neo-border neo-shadow text-[11px] font-mono font-bold hover:bg-neutral-100"
                  >
                    Sorted Preset
                  </button>
                  <button
                    onClick={generateReverseSortedPreset}
                    className="px-2.5 py-1.5 bg-[#FAF6F0] neo-border neo-shadow text-[11px] font-mono font-bold hover:bg-neutral-100"
                  >
                    Reverse Preset
                  </button>
                  <button
                    onClick={generateDuplicatesPreset}
                    className="px-2.5 py-1.5 bg-[#FAF6F0] neo-border neo-shadow text-[11px] font-mono font-bold hover:bg-neutral-100"
                  >
                    Duplicates
                  </button>
                  <button
                    onClick={generateSingleElementPreset}
                    className="px-2.5 py-1.5 bg-[#FAF6F0] neo-border neo-shadow text-[11px] font-mono font-bold hover:bg-neutral-100"
                  >
                    Single Element
                  </button>
                </div>
              </div>
            ) : (
              // Pathfinding presets
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={generateRandomWalls}
                  className="px-3 py-1.5 bg-[#FAF6F0] neo-border neo-shadow text-xs font-mono font-bold hover:bg-neutral-100 flex items-center gap-1.5"
                >
                  <Grid className="w-4 h-4 text-[#FF5A00]" />
                  Generate Random Grid Walls (25% Density)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Monaco Code Editor + Info Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6 w-full">
          <CodeEditorPanel />

          {/* Algorithm Info Pane */}
          <div className="neo-border bg-[#FAF6F0] p-4 neo-shadow-static">
            <h3 className="font-serif text-lg font-bold text-[#1E1E1E] flex items-center gap-2 mb-2">
              <LayoutList className="w-5 h-5 text-[#FF5A00]" />
              {details?.name}
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-sans">
              {details?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default VisualizerView;
