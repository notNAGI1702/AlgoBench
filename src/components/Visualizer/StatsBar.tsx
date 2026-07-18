import React from 'react';
import { usePlaybackStore } from '../../store/usePlaybackStore';

interface StatsBarProps {
  customTitle?: string;
  isRace?: boolean;
  raceSide?: 'left' | 'right';
}

export const StatsBar: React.FC<StatsBarProps> = ({ customTitle, isRace = false, raceSide = 'left' }) => {
  const steps = usePlaybackStore((s) => isRace && raceSide === 'right' ? s.raceSteps : s.steps);
  const currentStepIndex = usePlaybackStore((s) => isRace && raceSide === 'right' ? s.raceCurrentStepIndex : s.currentStepIndex);

  const currentStep = steps[currentStepIndex];

  const comparisons = currentStep?.counts.comparisons ?? 0;
  const mutationsOrVisits = currentStep?.counts.mutationsOrVisits ?? 0;
  const description = currentStep?.description ?? 'No operations logged yet.';

  return (
    <div className="neo-border bg-[#FAF6F0] p-3 neo-shadow-static flex flex-col xl:flex-row gap-3 items-stretch justify-between w-full">
      {/* Title / Status */}
      <div className="flex items-center gap-2 border-b-2 xl:border-b-0 xl:border-r-2 border-[#1E1E1E] pb-2 xl:pb-0 xl:pr-4">
        <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-bold">STATE:</span>
        <span className="font-bold text-sm">
          {customTitle ? customTitle : (steps.length === 0 ? 'IDLE (Generate steps)' : 'ACTIVE PLAYBACK')}
        </span>
      </div>

      {/* Counters Grid */}
      <div className="flex flex-col sm:flex-row xl:flex-1 gap-4 items-center justify-around xl:justify-start xl:pl-4 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-bold uppercase">COMPARE:</span>
          <span className="text-base font-bold bg-[#FF5A00] text-[#FAF6F0] px-2 py-0.5 border border-[#1E1E1E]">
            {comparisons}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-bold uppercase">MUTATION/VISIT:</span>
          <span className="text-base font-bold bg-[#10B981] text-[#FAF6F0] px-2 py-0.5 border border-[#1E1E1E]">
            {mutationsOrVisits}
          </span>
        </div>

        {!isRace && (
          <div className="hidden lg:flex items-center gap-2 flex-1 min-w-0 max-w-sm text-left text-xs text-neutral-600 pl-4 border-l border-neutral-300">
            <span className="font-bold text-neutral-500 whitespace-nowrap">INFO:</span>
            <span className="truncate italic font-sans flex-1" title={description}>
              {description}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
