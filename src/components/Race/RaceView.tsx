import React, { useState, useEffect } from 'react';
import { usePlaybackStore, playbackStore } from '../../store/usePlaybackStore';
import { ArrayCanvas } from '../Visualizer/ArrayCanvas';
import { GridCanvas } from '../Visualizer/GridCanvas';
import { StatsBar } from '../Visualizer/StatsBar';
import { ControlPanel } from '../Visualizer/ControlPanel';
import { runAlgorithm } from '../../engines/CodeRunner';
import { SORTING_ALGORITHMS } from '../../algorithms/sortingTemplates';
import { SEARCHING_ALGORITHMS } from '../../algorithms/searchingTemplates';
import { PATHFINDING_ALGORITHMS } from '../../algorithms/pathfindingTemplates';
import { Zap, Trophy, RefreshCw, Shuffle } from 'lucide-react';

export const RaceView: React.FC = () => {
  const activeCategory = usePlaybackStore((s) => s.activeCategory);
  const arrayInput = usePlaybackStore((s) => s.arrayInput);
  const gridWalls = usePlaybackStore((s) => s.gridWalls);
  const startNode = usePlaybackStore((s) => s.startNode);
  const endNode = usePlaybackStore((s) => s.endNode);
  const gridRows = usePlaybackStore((s) => s.gridRows);
  const gridCols = usePlaybackStore((s) => s.gridCols);
  
  const stepsLeft = usePlaybackStore((s) => s.steps);
  const stepsRight = usePlaybackStore((s) => s.raceSteps);
  const currentStepLeft = usePlaybackStore((s) => s.currentStepIndex);
  const currentStepRight = usePlaybackStore((s) => s.raceCurrentStepIndex);
  
  const raceAlgorithmIdLeft = usePlaybackStore((s) => s.raceAlgorithmIdLeft);
  const raceAlgorithmIdRight = usePlaybackStore((s) => s.raceAlgorithmIdRight);
  
  const [isCompiling, setIsCompiling] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [arrayTextInput, setArrayTextInput] = useState('');

  // Keep raceActive context synchronized
  useEffect(() => {
    playbackStore.setState({ raceActive: true });
    return () => {
      playbackStore.setState({ raceActive: false });
    };
  }, []);

  // Update text field on array changes
  useEffect(() => {
    setArrayTextInput(arrayInput.join(', '));
  }, [arrayInput]);

  const handleLeftAlgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playbackStore.setState({ 
      raceAlgorithmIdLeft: e.target.value,
      steps: [],
      raceSteps: [],
      currentStepIndex: 0,
      raceCurrentStepIndex: 0,
      isPlaying: false
    });
    setErrorMessage('');
  };

  const handleRightAlgChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playbackStore.setState({ 
      raceAlgorithmIdRight: e.target.value,
      steps: [],
      raceSteps: [],
      currentStepIndex: 0,
      raceCurrentStepIndex: 0,
      isPlaying: false
    });
    setErrorMessage('');
  };

  const generateRandomInput = () => {
    if (activeCategory === 'pathfinding') {
      const nextWalls: Record<string, boolean> = {};
      for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
          if ((r === startNode[0] && c === startNode[1]) || (r === endNode[0] && c === endNode[1])) {
            continue;
          }
          if (Math.random() < 0.25) {
            nextWalls[`${r},${c}`] = true;
          }
        }
      }
      playbackStore.setState({ 
        gridWalls: nextWalls,
        steps: [],
        raceSteps: [],
        currentStepIndex: 0,
        raceCurrentStepIndex: 0,
        isPlaying: false
      });
    } else {
      const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 95) + 5);
      playbackStore.setState({ 
        arrayInput: arr,
        steps: [],
        raceSteps: [],
        currentStepIndex: 0,
        raceCurrentStepIndex: 0,
        isPlaying: false
      });
    }
    setErrorMessage('');
  };

  const generateSortedPreset = () => {
    const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 95) + 5).sort((a, b) => a - b);
    playbackStore.setState({ arrayInput: arr, steps: [], raceSteps: [], currentStepIndex: 0, raceCurrentStepIndex: 0, isPlaying: false });
  };

  const generateReverseSortedPreset = () => {
    const arr = Array.from({ length: 15 }, () => Math.floor(Math.random() * 95) + 5).sort((a, b) => b - a);
    playbackStore.setState({ arrayInput: arr, steps: [], raceSteps: [], currentStepIndex: 0, raceCurrentStepIndex: 0, isPlaying: false });
  };

  const generateDuplicatesPreset = () => {
    const options = [10, 25, 45, 70, 90];
    const arr = Array.from({ length: 15 }, () => options[Math.floor(Math.random() * options.length)]);
    playbackStore.setState({ arrayInput: arr, steps: [], raceSteps: [], currentStepIndex: 0, raceCurrentStepIndex: 0, isPlaying: false });
  };

  const handleApplyCustomArray = () => {
    const parsed = arrayTextInput
      .split(',')
      .map((x) => parseInt(x.trim(), 10))
      .filter((n) => !isNaN(n));
      
    if (parsed.length > 0) {
      playbackStore.setState({ arrayInput: parsed, steps: [], raceSteps: [], currentStepIndex: 0, raceCurrentStepIndex: 0, isPlaying: false });
    }
  };

  const handlePrepareRace = async () => {
    setIsCompiling(true);
    setErrorMessage('');
    playbackStore.setState({ isPlaying: false });

    let codeLeft = '';
    let codeRight = '';

    if (activeCategory === 'sorting') {
      codeLeft = SORTING_ALGORITHMS[raceAlgorithmIdLeft]?.codeTemplate || '';
      codeRight = SORTING_ALGORITHMS[raceAlgorithmIdRight]?.codeTemplate || '';
    } else if (activeCategory === 'searching') {
      codeLeft = SEARCHING_ALGORITHMS[raceAlgorithmIdLeft]?.codeTemplate || '';
      codeRight = SEARCHING_ALGORITHMS[raceAlgorithmIdRight]?.codeTemplate || '';
    } else {
      codeLeft = PATHFINDING_ALGORITHMS[raceAlgorithmIdLeft]?.codeTemplate || '';
      codeRight = PATHFINDING_ALGORITHMS[raceAlgorithmIdRight]?.codeTemplate || '';
    }

    const leftRes = await runAlgorithm(codeLeft, activeCategory, {
      inputArray: arrayInput,
      target: 45,
      gridWalls,
      startNode,
      endNode,
      gridRows,
      gridCols
    });

    const rightRes = await runAlgorithm(codeRight, activeCategory, {
      inputArray: arrayInput,
      target: 45,
      gridWalls,
      startNode,
      endNode,
      gridRows,
      gridCols
    });

    setIsCompiling(false);

    if (leftRes.success && rightRes.success) {
      playbackStore.setState({
        steps: leftRes.steps,
        raceSteps: rightRes.steps,
        currentStepIndex: 0,
        raceCurrentStepIndex: 0
      });
    } else {
      const err = !leftRes.success 
        ? `Left Alg Error: ${leftRes.error}` 
        : `Right Alg Error: ${rightRes.error}`;
      setErrorMessage(err);
    }
  };

  const isLeftFinished = stepsLeft.length > 0 && currentStepLeft >= stepsLeft.length - 1;
  const isRightFinished = stepsRight.length > 0 && currentStepRight >= stepsRight.length - 1;
  const raceFinished = isLeftFinished && isRightFinished;

  let winnerName = '';
  let winnerSteps = 0;
  let loserName = '';
  let loserSteps = 0;

  const leftName = activeCategory === 'sorting' ? SORTING_ALGORITHMS[raceAlgorithmIdLeft]?.name 
                 : activeCategory === 'searching' ? SEARCHING_ALGORITHMS[raceAlgorithmIdLeft]?.name
                 : PATHFINDING_ALGORITHMS[raceAlgorithmIdLeft]?.name;

  const rightName = activeCategory === 'sorting' ? SORTING_ALGORITHMS[raceAlgorithmIdRight]?.name 
                  : activeCategory === 'searching' ? SEARCHING_ALGORITHMS[raceAlgorithmIdRight]?.name
                  : PATHFINDING_ALGORITHMS[raceAlgorithmIdRight]?.name;

  if (raceFinished) {
    const leftTotal = stepsLeft.length;
    const rightTotal = stepsRight.length;
    
    if (leftTotal < rightTotal) {
      winnerName = leftName;
      winnerSteps = leftTotal;
      loserName = rightName;
      loserSteps = rightTotal;
    } else if (rightTotal < leftTotal) {
      winnerName = rightName;
      winnerSteps = rightTotal;
      loserName = leftName;
      loserSteps = leftTotal;
    }
  }

  const handleCategoryChange = (cat: 'sorting' | 'searching' | 'pathfinding') => {
    const left = cat === 'sorting' ? 'bubble' : cat === 'searching' ? 'linear' : 'bfs';
    const right = cat === 'sorting' ? 'quick' : cat === 'searching' ? 'binary' : 'dfs';
    
    playbackStore.setState({
      activeCategory: cat,
      raceAlgorithmIdLeft: left,
      raceAlgorithmIdRight: right,
      steps: [],
      raceSteps: [],
      currentStepIndex: 0,
      raceCurrentStepIndex: 0,
      isPlaying: false
    });
    setErrorMessage('');
  };

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto px-4 py-2 select-none">
      {/* Category selection & Init Row */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
        <div className="flex neo-border bg-[#1E1E1E] p-1 gap-1 w-full md:w-auto">
          {(['sorting', 'searching', 'pathfinding'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border-2 transition-colors ${
                activeCategory === cat
                  ? 'bg-[#FF5A00] text-[#FAF6F0] border-[#1E1E1E]'
                  : 'bg-transparent text-neutral-400 border-transparent hover:text-[#FAF6F0]'
              }`}
            >
              {cat === 'pathfinding' ? 'Pathfinding' : cat}
            </button>
          ))}
        </div>

        <button
          onClick={handlePrepareRace}
          disabled={isCompiling}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-mono font-bold bg-[#FF5A00] text-[#FAF6F0] neo-border neo-shadow hover:bg-[#E04F00] w-full md:w-auto justify-center"
        >
          <Zap className="w-4 h-4 fill-current" />
          {isCompiling ? 'Readying...' : 'Initialize Race'}
        </button>
      </div>

      {/* Selectors panel */}
      <div className="neo-border bg-[#FAF6F0] p-3 neo-shadow-static flex flex-col md:flex-row gap-3 items-center justify-around font-mono text-xs">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="font-bold uppercase text-[#FF5A00]">LEFT ALG:</span>
          <select
            value={raceAlgorithmIdLeft}
            onChange={handleLeftAlgChange}
            className="px-2 py-1 neo-border bg-[#FAF6F0] font-bold focus:outline-none cursor-pointer text-xs"
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

        <div className="text-neutral-400 font-serif text-sm italic select-none hidden md:block">vs</div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="font-bold uppercase text-[#002FA7]">RIGHT ALG:</span>
          <select
            value={raceAlgorithmIdRight}
            onChange={handleRightAlgChange}
            className="px-2 py-1 neo-border bg-[#FAF6F0] font-bold focus:outline-none cursor-pointer text-xs"
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

      {/* Input Presets Configuration Panel */}
      <div className="neo-border bg-[#FAF6F0] p-3 neo-shadow-static">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <span className="font-mono text-xs uppercase font-bold text-neutral-500 whitespace-nowrap">
            INPUT PRESETS:
          </span>
          
          {activeCategory !== 'pathfinding' ? (
            <div className="flex-grow w-full flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={arrayTextInput}
                  onChange={(e) => setArrayTextInput(e.target.value)}
                  placeholder="Enter array, e.g. 10, 4, 30, 20"
                  className="flex-1 px-2.5 py-1 neo-border font-mono text-xs bg-white focus:outline-none"
                />
                <button
                  onClick={handleApplyCustomArray}
                  className="px-2.5 bg-neutral-800 text-[#FAF6F0] font-mono text-xs font-bold neo-border neo-shadow hover:bg-neutral-700"
                >
                  Apply
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={generateRandomInput}
                  className="px-2 py-1 bg-[#FAF6F0] neo-border neo-shadow text-[10px] font-mono font-bold hover:bg-neutral-100 flex items-center gap-1"
                >
                  <Shuffle className="w-3 h-3 text-[#FF5A00]" />
                  Random
                </button>
                <button
                  onClick={generateSortedPreset}
                  className="px-2 py-1 bg-[#FAF6F0] neo-border neo-shadow text-[10px] font-mono font-bold hover:bg-neutral-100"
                >
                  Sorted
                </button>
                <button
                  onClick={generateReverseSortedPreset}
                  className="px-2 py-1 bg-[#FAF6F0] neo-border neo-shadow text-[10px] font-mono font-bold hover:bg-neutral-100"
                >
                  Reverse
                </button>
                <button
                  onClick={generateDuplicatesPreset}
                  className="px-2 py-1 bg-[#FAF6F0] neo-border neo-shadow text-[10px] font-mono font-bold hover:bg-neutral-100"
                >
                  Duplicates
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={generateRandomInput}
                className="px-2.5 py-1 bg-[#FAF6F0] neo-border neo-shadow text-xs font-mono font-bold hover:bg-neutral-100 flex items-center gap-1"
              >
                <Shuffle className="w-3.5 h-3.5 text-[#FF5A00]" />
                Generate Random Walls
              </button>
              <button
                onClick={() => playbackStore.setState({ gridWalls: {}, steps: [], raceSteps: [], currentStepIndex: 0, raceCurrentStepIndex: 0, isPlaying: false })}
                className="px-2.5 py-1 bg-[#FAF6F0] neo-border neo-shadow text-xs font-mono font-bold hover:bg-neutral-100"
              >
                Clear Grid Walls
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error messages banner */}
      {errorMessage && (
        <div className="neo-border bg-red-100 text-red-700 font-mono text-xs p-3 neo-shadow-static">
          ✖ {errorMessage}
        </div>
      )}

      {/* Side-by-Side Playback Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Arena Panel */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-[#FAF6F0] p-1.5 border-t-2 border-x-2 border-[#1E1E1E]">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider bg-[#FF5A00] text-[#FAF6F0] px-2 py-0.5 border border-[#1E1E1E]">
              {leftName}
            </span>
            <span className="font-mono text-[11px] font-bold">
              {stepsLeft.length > 0 ? `Steps: ${currentStepLeft + 1} / ${stepsLeft.length}` : 'Uninitialized'}
            </span>
          </div>
          {activeCategory === 'pathfinding' ? (
            <GridCanvas isRace raceSide="left" />
          ) : (
            <ArrayCanvas isRace raceSide="left" />
          )}
          <StatsBar customTitle="LEFT ALGORITHM" isRace raceSide="left" />
        </div>

        {/* Right Arena Panel */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center bg-[#FAF6F0] p-1.5 border-t-2 border-x-2 border-[#1E1E1E]">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider bg-[#002FA7] text-[#FAF6F0] px-2 py-0.5 border border-[#1E1E1E]">
              {rightName}
            </span>
            <span className="font-mono text-[11px] font-bold">
              {stepsRight.length > 0 ? `Steps: ${currentStepRight + 1} / ${stepsRight.length}` : 'Uninitialized'}
            </span>
          </div>
          {activeCategory === 'pathfinding' ? (
            <GridCanvas isRace raceSide="right" />
          ) : (
            <ArrayCanvas isRace raceSide="right" />
          )}
          <StatsBar customTitle="RIGHT ALGORITHM" isRace raceSide="right" />
        </div>
      </div>

      {/* Shared Control Dock */}
      <ControlPanel />

      {/* Race Winner Summary Banner */}
      {raceFinished && (
        <div className="neo-border bg-[#FAF6F0] p-4 neo-shadow-static flex flex-col md:flex-row gap-4 justify-between items-center border-[#FF5A00] border-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FF5A00] neo-border rounded-none text-[#FAF6F0] neo-shadow">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold uppercase tracking-wide">RACE FINISHED!</h2>
              {winnerName ? (
                <p className="text-xs font-mono text-neutral-600 mt-1">
                  Winner: <span className="font-bold text-[#FF5A00]">{winnerName}</span> (completed in <span className="font-bold">{winnerSteps} steps</span>). 
                  Runner up was {loserName} (took {loserSteps} steps).
                </p>
              ) : (
                <p className="text-xs font-mono text-neutral-600 mt-1">
                  It's a dead heat! Both algorithms finished in the exact same step count ({stepsLeft.length} steps).
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handlePrepareRace}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-[#1E1E1E] text-[#FAF6F0] neo-border neo-shadow hover:bg-neutral-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restart Matchup
          </button>
        </div>
      )}
    </div>
  );
};
export default RaceView;
