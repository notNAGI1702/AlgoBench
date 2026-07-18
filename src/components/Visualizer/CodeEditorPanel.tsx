import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, AlertTriangle, Terminal } from 'lucide-react';
import { usePlaybackStore, playbackStore } from '../../store/usePlaybackStore';
import { runAlgorithm } from '../../engines/CodeRunner';
import { SORTING_ALGORITHMS } from '../../algorithms/sortingTemplates';
import { SEARCHING_ALGORITHMS } from '../../algorithms/searchingTemplates';
import { PATHFINDING_ALGORITHMS } from '../../algorithms/pathfindingTemplates';

export const CodeEditorPanel: React.FC = () => {
  const activeCategory = usePlaybackStore((s) => s.activeCategory);
  const activeAlgorithmId = usePlaybackStore((s) => s.activeAlgorithmId);
  const arrayInput = usePlaybackStore((s) => s.arrayInput);
  const gridWalls = usePlaybackStore((s) => s.gridWalls);
  const startNode = usePlaybackStore((s) => s.startNode);
  const endNode = usePlaybackStore((s) => s.endNode);
  const gridRows = usePlaybackStore((s) => s.gridRows);
  const gridCols = usePlaybackStore((s) => s.gridCols);
  const logs = usePlaybackStore((s) => s.logs);
  
  const [editorValue, setEditorValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Load default template on algorithm change
  useEffect(() => {
    let template = '';
    if (activeCategory === 'sorting') {
      template = SORTING_ALGORITHMS[activeAlgorithmId]?.codeTemplate || '';
    } else if (activeCategory === 'searching') {
      template = SEARCHING_ALGORITHMS[activeAlgorithmId]?.codeTemplate || '';
    } else if (activeCategory === 'pathfinding') {
      template = PATHFINDING_ALGORITHMS[activeAlgorithmId]?.codeTemplate || '';
    }
    setEditorValue(template);
    playbackStore.setState({ 
      logs: [`Loaded ${activeAlgorithmId} template. Ready to run.`],
      steps: [],
      currentStepIndex: 0,
      isPlaying: false
    });
  }, [activeCategory, activeAlgorithmId]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setEditorValue(value);
    }
  };

  const handleResetTemplate = () => {
    let template = '';
    if (activeCategory === 'sorting') {
      template = SORTING_ALGORITHMS[activeAlgorithmId]?.codeTemplate || '';
    } else if (activeCategory === 'searching') {
      template = SEARCHING_ALGORITHMS[activeAlgorithmId]?.codeTemplate || '';
    } else if (activeCategory === 'pathfinding') {
      template = PATHFINDING_ALGORITHMS[activeAlgorithmId]?.codeTemplate || '';
    }
    setEditorValue(template);
    playbackStore.setState({ 
      logs: [`Reset to default ${activeAlgorithmId} template.`],
      steps: [],
      currentStepIndex: 0,
      isPlaying: false
    });
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    playbackStore.setState({ 
      isPlaying: false, 
      logs: ['Running code sandbox...', 'Initializing worker environment...'] 
    });

    // In search mode, search for value 45 as default target (present in default input array)
    const target = 45; 

    const result = await runAlgorithm(editorValue, activeCategory, {
      inputArray: arrayInput,
      target,
      gridWalls,
      startNode,
      endNode,
      gridRows,
      gridCols
    });

    setIsRunning(false);

    if (result.success) {
      playbackStore.setState({
        steps: result.steps,
        currentStepIndex: 0,
        isPlaying: false,
        logs: [
          ...playbackStore.getState().logs,
          `✔ Sandbox finished execution.`,
          `✔ Generated ${result.steps.length} replay steps.`,
          `✔ Operations tracked: comparisons/queries and swaps/moves.`
        ]
      });
    } else {
      playbackStore.setState({
        steps: [],
        currentStepIndex: 0,
        isPlaying: false,
        logs: [
          ...playbackStore.getState().logs,
          `✖ Execution Error:`,
          result.error || 'Unknown runtime error'
        ]
      });
    }
  };

  return (
    <div className="flex flex-col h-[520px] w-full neo-border bg-[#FAF6F0] neo-shadow-static">
      {/* Editor Header Panel */}
      <div className="flex items-center justify-between border-b-2 border-[#1E1E1E] bg-[#FAF6F0] p-2.5">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 block rounded-full bg-[#FF5A00] neo-border"></span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider">Monaco Code Editor</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleResetTemplate}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-bold bg-[#FAF6F0] neo-border neo-shadow hover:bg-neutral-100"
            title="Reset Template Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold bg-[#FF5A00] text-[#FAF6F0] neo-border neo-shadow hover:bg-[#E04F00] disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* Editor Frame */}
      <div className="flex-1 min-h-0 border-b-2 border-[#1E1E1E] bg-white">
        <Editor
          height="100%"
          language="javascript"
          value={editorValue}
          onChange={handleEditorChange}
          theme="vs"
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 18,
            padding: { top: 12, bottom: 12 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </div>

      {/* Terminal Logs console */}
      <div className="h-[120px] bg-[#1E1E1E] text-neutral-300 font-mono text-[11px] p-3 overflow-y-auto flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-neutral-400 border-b border-neutral-700 pb-1 mb-1 font-bold">
          <Terminal className="w-3.5 h-3.5 text-[#FF5A00]" />
          <span>SANDBOX CONSOLE LOGGER</span>
        </div>
        {logs.map((log, i) => {
          const isError = log.includes('✖') || log.includes('Error');
          const isSuccess = log.includes('✔');
          return (
            <div 
              key={i} 
              className={`${
                isError ? 'text-red-400 font-bold' : isSuccess ? 'text-[#10B981] font-bold' : 'text-neutral-300'
              }`}
            >
              {isError && <AlertTriangle className="inline w-3 h-3 mr-1 align-text-bottom" />}
              {log}
            </div>
          );
        })}
      </div>
    </div>
  );
};
