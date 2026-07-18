import { useSyncExternalStore } from 'react';
import type { Step, AlgorithmCategory } from '../types';

export interface VisualizerState {
  currentStepIndex: number;
  isPlaying: boolean;
  steps: Step[];
  speed: number; // tick delay in ms
  arrayInput: number[];
  gridWalls: Record<string, boolean>; // "row,col" -> true
  startNode: [number, number];
  endNode: [number, number];
  gridRows: number;
  gridCols: number;
  
  // Race state
  raceActive: boolean;
  raceCurrentStepIndex: number;
  raceSteps: Step[];
  
  // Navigation
  activeTab: 'landing' | 'visualizer' | 'race';
  activeCategory: AlgorithmCategory;
  activeAlgorithmId: string;
  raceAlgorithmIdLeft: string;
  raceAlgorithmIdRight: string;
  
  // Monaco & Logs
  customCode: string;
  logs: string[];
}

let state: VisualizerState = {
  currentStepIndex: 0,
  isPlaying: false,
  steps: [],
  speed: 100,
  arrayInput: [45, 12, 85, 32, 9, 70, 22, 51, 63, 17, 38, 90, 5, 58, 77],
  gridWalls: {},
  startNode: [4, 5],
  endNode: [15, 22],
  gridRows: 20,
  gridCols: 30,
  raceActive: false,
  raceCurrentStepIndex: 0,
  raceSteps: [],
  activeTab: 'landing',
  activeCategory: 'sorting',
  activeAlgorithmId: 'bubble',
  raceAlgorithmIdLeft: 'bubble',
  raceAlgorithmIdRight: 'quick',
  customCode: '',
  logs: [],
};

const listeners = new Set<() => void>();

export const playbackStore = {
  getState() {
    return state;
  },
  setState(nextState: Partial<VisualizerState> | ((prev: VisualizerState) => Partial<VisualizerState>)) {
    const changes = typeof nextState === 'function' ? nextState(state) : nextState;
    
    // Check if anything actually changed to prevent redundant renders
    let changed = false;
    for (const key in changes) {
      const k = key as keyof VisualizerState;
      if (!Object.is(state[k], changes[k])) {
        changed = true;
        break;
      }
    }
    
    if (changed) {
      state = { ...state, ...changes };
      listeners.forEach((listener) => listener());
    }
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }
};

export function usePlaybackStore<T>(selector: (state: VisualizerState) => T): T {
  return useSyncExternalStore(
    playbackStore.subscribe,
    () => selector(playbackStore.getState())
  );
}
