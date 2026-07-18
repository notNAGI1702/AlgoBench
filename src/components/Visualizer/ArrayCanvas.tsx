import React from 'react';
import { usePlaybackStore } from '../../store/usePlaybackStore';

interface ArrayCanvasProps {
  isRace?: boolean;
  raceSide?: 'left' | 'right';
}

export const ArrayCanvas: React.FC<ArrayCanvasProps> = ({ isRace = false, raceSide = 'left' }) => {
  const steps = usePlaybackStore((s) => isRace && raceSide === 'right' ? s.raceSteps : s.steps);
  const currentStepIndex = usePlaybackStore((s) => isRace && raceSide === 'right' ? s.raceCurrentStepIndex : s.currentStepIndex);
  const arrayInput = usePlaybackStore((s) => s.arrayInput);

  // Use current step state if available, otherwise default to initial input
  const currentStep = steps[currentStepIndex];
  const arrayState = currentStep?.arrayState ?? arrayInput;
  const activeIndices = currentStep?.indices ?? [];
  const stepType = currentStep?.type;

  // Find max value for scaling heights
  const maxVal = Math.max(...arrayState, 1);

  return (
    <div className={`neo-border bg-[#FAF6F0] p-6 flex flex-col justify-end neo-shadow-static relative overflow-hidden w-full select-none ${isRace ? 'h-90' : 'h-100'}`}>
      {/* Background grid lines for blueprint feel */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex flex-col justify-between p-6">
        <div className="border-b border-[#1E1E1E] w-full"></div>
        <div className="border-b border-[#1E1E1E] w-full"></div>
        <div className="border-b border-[#1E1E1E] w-full"></div>
        <div className="border-b border-[#1E1E1E] w-full"></div>
      </div>

      {/* Array Bars */}
      <div className="flex items-end justify-between h-full gap-1 md:gap-2 z-10">
        {arrayState.map((value, idx) => {
          // Determine bar styling based on step states
          const isActive = activeIndices.includes(idx);
          let barBg = 'bg-[#FAF6F0]';
          let borderCol = 'border-[#1E1E1E]';
          let textCol = 'text-[#1E1E1E]';

          if (stepType === 'found') {
            // Completed state - turn all success green
            barBg = 'bg-[#10B981]';
            textCol = 'text-[#FAF6F0]';
          } else if (isActive) {
            if (stepType === 'compare') {
              barBg = 'bg-[#FF5A00]'; // Orange highlight
              textCol = 'text-[#FAF6F0]';
            } else if (stepType === 'swap' || stepType === 'overwrite') {
              barBg = 'bg-[#10B981]'; // Success Green highlight
              textCol = 'text-[#FAF6F0]';
            } else if (stepType === 'select') {
              barBg = 'bg-[#002FA7]'; // Cobalt Blue highlight
              textCol = 'text-[#FAF6F0]';
            }
          }

          // Percentage height
          const heightPercent = `${(value / maxVal) * 85}%`;
          const showText = arrayState.length <= 25;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end h-full transition-all duration-75"
            >
              {/* Bar */}
              <div
                style={{ height: heightPercent }}
                className={`w-full neo-border ${barBg} ${borderCol} flex items-end justify-center pb-2 relative transition-all duration-100`}
              >
                {showText && (
                  <span className={`font-mono text-xs font-bold leading-none rotate-90 sm:rotate-0 mb-1 select-none ${textCol}`}>
                    {value}
                  </span>
                )}
              </div>

              {/* Index marker */}
              {showText && (
                <span className="font-mono text-[10px] text-neutral-400 mt-1 select-none font-bold">
                  {idx}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {arrayState.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-neutral-400">
          Empty Array Input
        </div>
      )}
    </div>
  );
};
