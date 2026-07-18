import React, { useState, useEffect } from 'react';
import { usePlaybackStore, playbackStore } from '../../store/usePlaybackStore';

interface GridCanvasProps {
  isRace?: boolean;
  raceSide?: 'left' | 'right';
}

export const GridCanvas: React.FC<GridCanvasProps> = ({ isRace = false, raceSide = 'left' }) => {
  const steps = usePlaybackStore((s) => isRace && raceSide === 'right' ? s.raceSteps : s.steps);
  const currentStepIndex = usePlaybackStore((s) => isRace && raceSide === 'right' ? s.raceCurrentStepIndex : s.currentStepIndex);
  
  const gridWalls = usePlaybackStore((s) => s.gridWalls);
  const startNode = usePlaybackStore((s) => s.startNode);
  const endNode = usePlaybackStore((s) => s.endNode);
  const rows = usePlaybackStore((s) => s.gridRows);
  const cols = usePlaybackStore((s) => s.gridCols);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'add' | 'remove' | null>(null);
  
  // Use current step state if available
  const currentStep = steps[currentStepIndex];
  const gridState = currentStep?.gridState;
  
  // Clean up drawing state on mouse up anywhere
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDrawing(false);
      setDrawMode(null);
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleCellMouseDown = (r: number, c: number) => {
    // Cannot draw walls on start or end node
    if ((r === startNode[0] && c === startNode[1]) || (r === endNode[0] && c === endNode[1])) {
      return;
    }
    
    // If visualization has steps loaded, clear them before drawing new walls
    if (steps.length > 0) {
      playbackStore.setState({ steps: [], currentStepIndex: 0, isPlaying: false });
    }
    
    const key = `${r},${c}`;
    const isWall = !!gridWalls[key];
    const newMode = isWall ? 'remove' : 'add';
    
    setDrawMode(newMode);
    setIsDrawing(true);
    
    toggleWall(r, c, newMode);
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (!isDrawing || !drawMode) return;
    if ((r === startNode[0] && c === startNode[1]) || (r === endNode[0] && c === endNode[1])) {
      return;
    }
    toggleWall(r, c, drawMode);
  };

  const toggleWall = (r: number, c: number, mode: 'add' | 'remove') => {
    const key = `${r},${c}`;
    playbackStore.setState((s) => {
      const nextWalls = { ...s.gridWalls };
      if (mode === 'add') {
        nextWalls[key] = true;
      } else {
        delete nextWalls[key];
      }
      return { gridWalls: nextWalls };
    });
  };

  const handleClearWalls = () => {
    playbackStore.setState({ gridWalls: {}, steps: [], currentStepIndex: 0, isPlaying: false });
  };

  // Build grid layout cell-by-cell
  const gridCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      const isStart = r === startNode[0] && c === startNode[1];
      const isEnd = r === endNode[0] && c === endNode[1];
      
      // Determine state: either read from snapshot step (if run), otherwise read from walls
      let type: 'empty' | 'wall' | 'visited' | 'enqueued' | 'path' = 'empty';
      if (gridState) {
        type = gridState[key] || 'empty';
      } else {
        type = gridWalls[key] ? 'wall' : 'empty';
      }

      // Neo-Brutalist cell class assignment
      let cellClass = 'bg-[#FAF6F0]';
      let content = null;

      if (isStart) {
        cellClass = 'bg-[#FF5A00] text-[#FAF6F0] font-mono font-bold';
        content = 'S';
      } else if (isEnd) {
        cellClass = 'bg-[#10B981] text-[#FAF6F0] font-mono font-bold';
        content = 'E';
      } else {
        switch (type) {
          case 'wall':
            cellClass = 'bg-[#1E1E1E]';
            break;
          case 'visited':
            cellClass = 'bg-[#EADFD0] border-neutral-300';
            break;
          case 'enqueued':
            cellClass = 'bg-[#FEE2E2] border-neutral-200';
            break;
          case 'path':
            cellClass = 'bg-[#FF5A00] text-[#FAF6F0] font-bold animate-pulse';
            content = '●';
            break;
          default:
            cellClass = 'bg-[#FAF6F0] hover:bg-neutral-100';
        }
      }

      gridCells.push(
        <div
          key={key}
          onMouseDown={() => handleCellMouseDown(r, c)}
          onMouseEnter={() => handleCellMouseEnter(r, c)}
          className={`aspect-square border border-[#1E1E1E]/20 flex items-center justify-center text-xs select-none cursor-pointer ${cellClass} transition-colors duration-75`}
          style={{ touchAction: 'none' }}
        >
          {content}
        </div>
      );
    }
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Grid Canvas Wrapper */}
      <div className={`neo-border bg-[#FAF6F0] neo-shadow-static overflow-auto max-w-full ${isRace ? 'p-2' : 'p-4'}`}>
        <div 
          className="grid gap-[1px] bg-neutral-300 border border-neutral-300 select-none mx-auto"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            minWidth: isRace ? '340px' : '600px',
            maxWidth: isRace ? '500px' : '900px'
          }}
        >
          {gridCells}
        </div>
      </div>
      
      {/* Control Tools under canvas */}
      {!isRace && (
        <div className="flex justify-between items-center bg-[#FAF6F0] neo-border p-2 px-3 text-xs font-mono">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3.5 h-3.5 block bg-[#FF5A00] neo-border"></span> Start
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-3.5 h-3.5 block bg-[#10B981] neo-border"></span> Target
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 block bg-[#1E1E1E] neo-border"></span> Wall
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 block bg-[#EADFD0] border border-[#1E1E1E]/20"></span> Visited
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 block bg-[#FF5A00] text-[#FAF6F0] text-center leading-none text-[8px] neo-border">●</span> Shortest Path
            </span>
          </div>
          
          <button
            onClick={handleClearWalls}
            className="px-2.5 py-1 neo-border bg-[#FAF6F0] neo-shadow text-[11px] font-bold hover:bg-neutral-100"
          >
            Clear Grid Walls
          </button>
        </div>
      )}
    </div>
  );
};
