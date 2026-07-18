import React, { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { usePlaybackStore, playbackStore } from '../../store/usePlaybackStore';

export const ControlPanel: React.FC = () => {
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const currentStepIndex = usePlaybackStore((s) => s.currentStepIndex);
  const steps = usePlaybackStore((s) => s.steps);
  const speed = usePlaybackStore((s) => s.speed);
  
  const raceActive = usePlaybackStore((s) => s.raceActive);
  const raceSteps = usePlaybackStore((s) => s.raceSteps);
  const raceCurrentStepIndex = usePlaybackStore((s) => s.raceCurrentStepIndex);
  
  const timerRef = useRef<any | null>(null);
  
  const totalSteps = raceActive 
    ? Math.max(steps.length, raceSteps.length) 
    : steps.length;
    
  const currentActiveIndex = raceActive
    ? Math.max(currentStepIndex, raceCurrentStepIndex)
    : currentStepIndex;

  const isFinished = totalSteps > 0 && currentActiveIndex >= totalSteps - 1;
  const canPlay = totalSteps > 0;
  
  // Custom playback tick logic
  useEffect(() => {
    if (isPlaying) {
      const tick = () => {
        const s = playbackStore.getState();
        
        let increment = 1;
        let nextDelay = s.speed;
        
        // Multi-stepping for ultra-high speeds
        if (s.speed < 12) {
          increment = Math.max(1, Math.ceil((12 - s.speed) * 1.5));
          nextDelay = 12;
        }
        
        if (s.raceActive) {
          const leftLen = s.steps.length;
          const rightLen = s.raceSteps.length;
          
          const targetLeft = Math.min(s.currentStepIndex + increment, leftLen - 1);
          const targetRight = Math.min(s.raceCurrentStepIndex + increment, rightLen - 1);
          
          playbackStore.setState({ 
            currentStepIndex: targetLeft,
            raceCurrentStepIndex: targetRight
          });
          
          const leftFinished = targetLeft >= leftLen - 1;
          const rightFinished = targetRight >= rightLen - 1;
          
          if (!leftFinished || !rightFinished) {
            timerRef.current = setTimeout(tick, nextDelay);
          } else {
            playbackStore.setState({ isPlaying: false });
          }
        } else {
          if (s.currentStepIndex >= s.steps.length - 1) {
            playbackStore.setState({ isPlaying: false });
            return;
          }
          
          const nextIndex = Math.min(s.currentStepIndex + increment, s.steps.length - 1);
          playbackStore.setState({ currentStepIndex: nextIndex });
          
          if (nextIndex < s.steps.length - 1) {
            timerRef.current = setTimeout(tick, nextDelay);
          } else {
            playbackStore.setState({ isPlaying: false });
          }
        }
      };
      
      timerRef.current = setTimeout(tick, speed);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, speed]);
  
  const handlePlayPause = () => {
    if (!canPlay) return;
    if (isFinished) {
      // Auto-restart if we reached the end
      if (raceActive) {
        playbackStore.setState({ 
          currentStepIndex: 0, 
          raceCurrentStepIndex: 0, 
          isPlaying: true 
        });
      } else {
        playbackStore.setState({ 
          currentStepIndex: 0, 
          isPlaying: true 
        });
      }
    } else {
      playbackStore.setState({ isPlaying: !isPlaying });
    }
  };
  
  const handleStepForward = () => {
    if (raceActive) {
      playbackStore.setState({
        currentStepIndex: Math.min(currentStepIndex + 1, steps.length - 1),
        raceCurrentStepIndex: Math.min(raceCurrentStepIndex + 1, raceSteps.length - 1),
        isPlaying: false
      });
    } else {
      if (currentStepIndex < steps.length - 1) {
        playbackStore.setState({ 
          currentStepIndex: currentStepIndex + 1,
          isPlaying: false 
        });
      }
    }
  };
  
  const handleStepBackward = () => {
    if (raceActive) {
      playbackStore.setState({
        currentStepIndex: Math.max(currentStepIndex - 1, 0),
        raceCurrentStepIndex: Math.max(raceCurrentStepIndex - 1, 0),
        isPlaying: false
      });
    } else {
      if (currentStepIndex > 0) {
        playbackStore.setState({ 
          currentStepIndex: currentStepIndex - 1,
          isPlaying: false 
        });
      }
    }
  };
  
  const handleReset = () => {
    if (raceActive) {
      playbackStore.setState({ 
        currentStepIndex: 0,
        raceCurrentStepIndex: 0,
        isPlaying: false 
      });
    } else {
      playbackStore.setState({ 
        currentStepIndex: 0,
        isPlaying: false 
      });
    }
  };
  
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetIdx = parseInt(e.target.value, 10);
    if (raceActive) {
      playbackStore.setState({
        currentStepIndex: Math.min(targetIdx, steps.length - 1),
        raceCurrentStepIndex: Math.min(targetIdx, raceSteps.length - 1),
        isPlaying: false
      });
    } else {
      playbackStore.setState({ 
        currentStepIndex: targetIdx,
        isPlaying: false 
      });
    }
  };
  
  // Convert speed value (delay in ms) back to slider percentage (0 to 100)
  // delay ranges: 800ms (Crawl) -> 450ms (Slow) -> 100ms (Normal) -> 50ms (Fast) -> 1ms (Instant)
  const getSliderValue = (delay: number) => {
    if (delay >= 100) {
      // 0 to 50 maps delay 800 down to 100
      return Math.round((800 - delay) / 14);
    } else {
      // 51 to 100 maps delay 99 down to 1
      return Math.round(50 + (100 - delay) / 1.98);
    }
  };

  const sliderValue = getSliderValue(speed);

  const handleSpeedSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    let delay = 100;
    if (val <= 50) {
      // Linear interpolation from 800ms down to 100ms
      delay = 800 - 14 * val;
    } else {
      // Linear interpolation from 99ms down to 1ms
      delay = Math.max(1, Math.round(100 - 1.98 * (val - 50)));
    }
    playbackStore.setState({ speed: delay });
  };

  const getSpeedLabel = (val: number) => {
    if (val === 100) return 'INSTANT';
    if (val >= 75) return 'FAST';
    if (val >= 50) return 'NORMAL';
    if (val >= 25) return 'SLOW';
    return 'CRAWL';
  };
  
  return (
    <div className="neo-border bg-[#FAF6F0] p-4 flex flex-col xl:flex-row gap-4 justify-between items-center neo-shadow-static w-full">
      {/* Playback Action Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleStepBackward}
          disabled={currentActiveIndex === 0 || !canPlay}
          className="p-2.5 neo-border bg-[#FAF6F0] rounded-none neo-shadow hover:bg-neutral-100 disabled:opacity-50 disabled:pointer-events-none"
          title="Step Backward"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button
          onClick={handlePlayPause}
          disabled={!canPlay}
          className={`p-3 neo-border rounded-none neo-shadow text-[#FAF6F0] font-bold ${
            isPlaying 
              ? 'bg-neutral-800 hover:bg-neutral-700' 
              : 'bg-[#FF5A00] hover:bg-[#E04F00]'
          } disabled:opacity-50 disabled:pointer-events-none`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
        </button>
        
        <button
          onClick={handleStepForward}
          disabled={isFinished || !canPlay}
          className="p-2.5 neo-border bg-[#FAF6F0] rounded-none neo-shadow hover:bg-neutral-100 disabled:opacity-50 disabled:pointer-events-none"
          title="Step Forward"
        >
          <SkipForward className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleReset}
          disabled={!canPlay || currentActiveIndex === 0}
          className="p-2.5 neo-border bg-[#FAF6F0] rounded-none neo-shadow hover:bg-neutral-100 disabled:opacity-50 disabled:pointer-events-none"
          title="Reset to Start"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Scrub Timeline */}
      <div className="w-full xl:flex-1 flex items-center gap-3 px-2 min-w-0">
        <span className="font-mono text-sm select-none w-12 text-right">
          {currentActiveIndex}
        </span>
        <input
          type="range"
          min={0}
          max={totalSteps > 0 ? totalSteps - 1 : 0}
          value={currentActiveIndex}
          onChange={handleScrub}
          disabled={!canPlay}
          className="flex-1 h-3 bg-[#EADFD0] neo-border rounded-none appearance-none cursor-pointer accent-[#FF5A00] disabled:cursor-not-allowed"
        />
        <span className="font-mono text-sm select-none w-12 text-left">
          {totalSteps > 0 ? totalSteps - 1 : 0}
        </span>
      </div>

      {/* Speed Slider */}
      <div className="flex items-center gap-2 w-full xl:w-auto justify-between xl:justify-start">
        <span className="font-mono text-xs select-none uppercase tracking-wider text-neutral-500 mr-1">Speed</span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={sliderValue}
          onChange={handleSpeedSliderChange}
          className="flex-1 xl:flex-none xl:w-28 h-2.5 bg-[#EADFD0] neo-border rounded-none appearance-none cursor-pointer accent-[#FF5A00]"
        />
        <span className="font-mono text-xs font-bold w-16 text-center select-none bg-[#1E1E1E] text-[#FAF6F0] px-1 py-0.5">
          {getSpeedLabel(sliderValue)}
        </span>
      </div>
    </div>
  );
};
