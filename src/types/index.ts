export type StepType = 
  | 'compare'     // Highlight elements being compared
  | 'swap'        // Show swap action & update array state
  | 'select'      // Highlight pivot or search target
  | 'found'       // Target found or destination reached
  | 'visit'       // Graph node visited / expanded
  | 'enqueue'     // Graph node added to queue/fringe
  | 'path'        // Final shortest-path node highlight
  | 'overwrite'   // Element value changed (e.g., merge sort write)
  | 'error';      // Execution error step

export interface Step {
  type: StepType;
  
  // Sorting/Searching state snapshots and targets
  indices?: number[];       // Active indices (e.g. [i, j])
  arrayState?: number[];    // Entire array values at this snapshot

  // Pathfinding state snapshots (Full state, not delta)
  coords?: [number, number][]; // Active coordinates (e.g. [[r, c]])
  gridState?: Record<string, 'visited' | 'enqueued' | 'path' | 'wall' | 'empty'>; 
  // Key format: "row,col" -> state (e.g., "12,15": "visited")

  // Live operation metrics
  counts: {
    comparisons: number;
    mutationsOrVisits: number; // Swaps/writes for sorting, visits/enqueues for searching/graphs
  };

  // Contextual info
  description?: string;     // Text explanation shown in the step logs (e.g. "Swapping 15 and 4")
}

export type AlgorithmCategory = 'sorting' | 'searching' | 'pathfinding';

export interface AlgorithmConfig {
  id: string;
  name: string;
  category: AlgorithmCategory;
  defaultTemplate: string;
  description: string;
}

export interface ExecutionResult {
  steps: Step[];
  success: boolean;
  error?: string;
}
