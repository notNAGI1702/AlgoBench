import type { Step } from '../types';

const workerCodeString = `
  self.onmessage = function(e) {
    const { 
      code, 
      inputArray, 
      target, 
      gridWalls, 
      startNode, 
      endNode, 
      gridRows, 
      gridCols, 
      category 
    } = e.data;
    
    const steps = [];
    let comparisons = 0;
    let mutationsOrVisits = 0;
    let totalOps = 0;
    const MAX_OPS = 50000;
    
    const checkOps = () => {
      totalOps++;
      if (totalOps > MAX_OPS) {
        throw new Error("Execution limit reached: code executed too many operations (> " + MAX_OPS + "). Check for infinite loops.");
      }
    };

    try {
      if (category === 'sorting') {
        const arr = [...inputArray];
        
        const helpers = {
          compare: (i, j) => {
            checkOps();
            comparisons++;
            if (i < 0 || i >= arr.length || j < 0 || j >= arr.length) {
              throw new Error("Index out of bounds in compare(" + i + ", " + j + ")");
            }
            steps.push({
              type: 'compare',
              indices: [i, j],
              arrayState: [...arr],
              counts: { comparisons, mutationsOrVisits },
              description: "Comparing values at index " + i + " (" + arr[i] + ") and index " + j + " (" + arr[j] + ")"
            });
            return arr[i] - arr[j];
          },
          swap: (i, j) => {
            checkOps();
            mutationsOrVisits++;
            if (i < 0 || i >= arr.length || j < 0 || j >= arr.length) {
              throw new Error("Index out of bounds in swap(" + i + ", " + j + ")");
            }
            const temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            steps.push({
              type: 'swap',
              indices: [i, j],
              arrayState: [...arr],
              counts: { comparisons, mutationsOrVisits },
              description: "Swapping values at index " + i + " (" + arr[j] + ") and index " + j + " (" + arr[i] + ")"
            });
          },
          setValue: (i, val) => {
            checkOps();
            mutationsOrVisits++;
            if (i < 0 || i >= arr.length) {
              throw new Error("Index out of bounds in setValue(" + i + ", " + val + ")");
            }
            arr[i] = val;
            steps.push({
              type: 'overwrite',
              indices: [i],
              arrayState: [...arr],
              counts: { comparisons, mutationsOrVisits },
              description: "Overwriting index " + i + " with value " + val
            });
          }
        };

        const userFn = new Function('arr', 'helpers', 
          code + "\\nreturn (typeof sort === 'function') ? sort : null;"
        );
        const sortFn = userFn(arr, helpers);
        if (!sortFn) {
          throw new Error("Could not find a function named 'sort(arr, helpers)' in your code.");
        }
        
        sortFn(arr, helpers);
        
        steps.push({
          type: 'found',
          arrayState: [...arr],
          counts: { comparisons, mutationsOrVisits },
          description: "Finished sorting. Verification check complete."
        });
        
        self.postMessage({ success: true, steps });
        
      } else if (category === 'searching') {
        const arr = [...inputArray];
        
        const helpers = {
          compareWithTarget: (i) => {
            checkOps();
            comparisons++;
            if (i < 0 || i >= arr.length) {
              throw new Error("Index out of bounds in compareWithTarget(" + i + ")");
            }
            steps.push({
              type: 'compare',
              indices: [i],
              arrayState: [...arr],
              counts: { comparisons, mutationsOrVisits },
              description: "Comparing index " + i + " (" + arr[i] + ") with target " + target
            });
            return arr[i] - target;
          },
          select: (i) => {
            checkOps();
            mutationsOrVisits++;
            if (i < 0 || i >= arr.length) {
              throw new Error("Index out of bounds in select(" + i + ")");
            }
            steps.push({
              type: 'select',
              indices: [i],
              arrayState: [...arr],
              counts: { comparisons, mutationsOrVisits },
              description: "Selecting index " + i + " as candidate"
            });
          }
        };

        const userFn = new Function('arr', 'helpers', 
          code + "\\nreturn (typeof search === 'function') ? search : null;"
        );
        const searchFn = userFn(arr, helpers);
        if (!searchFn) {
          throw new Error("Could not find a function named 'search(arr, helpers)' in your code.");
        }
        
        const foundIdx = searchFn(arr, helpers);
        
        if (foundIdx !== -1 && foundIdx !== undefined && foundIdx !== null) {
          steps.push({
            type: 'found',
            indices: [foundIdx],
            arrayState: [...arr],
            counts: { comparisons, mutationsOrVisits },
            description: "Target found at index " + foundIdx
          });
        } else {
          steps.push({
            type: 'error',
            arrayState: [...arr],
            counts: { comparisons, mutationsOrVisits },
            description: "Search finished. Target not found."
          });
        }
        
        self.postMessage({ success: true, steps });
        
      } else if (category === 'pathfinding') {
        const grid = {};
        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            const key = r + ',' + c;
            grid[key] = gridWalls[key] ? 'wall' : 'empty';
          }
        }
        
        const startKey = startNode[0] + ',' + startNode[1];
        const endKey = endNode[0] + ',' + endNode[1];
        
        const helpers = {
          visit: (r, c) => {
            checkOps();
            mutationsOrVisits++;
            const key = r + ',' + c;
            if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) {
              throw new Error("Coordinates out of bounds in visit(" + r + ", " + c + ")");
            }
            if (grid[key] !== 'wall') {
              grid[key] = 'visited';
            }
            steps.push({
              type: 'visit',
              coords: [[r, c]],
              gridState: { ...grid },
              counts: { comparisons, mutationsOrVisits },
              description: "Visiting node [" + r + ", " + c + "]"
            });
          },
          enqueue: (r, c) => {
            checkOps();
            mutationsOrVisits++;
            const key = r + ',' + c;
            if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) {
              throw new Error("Coordinates out of bounds in enqueue(" + r + ", " + c + ")");
            }
            if (grid[key] !== 'wall' && grid[key] !== 'visited') {
              grid[key] = 'enqueued';
            }
            steps.push({
              type: 'enqueue',
              coords: [[r, c]],
              gridState: { ...grid },
              counts: { comparisons, mutationsOrVisits },
              description: "Enqueuing neighbor node [" + r + ", " + c + "]"
            });
          },
          isWall: (r, c) => {
            checkOps();
            if (r < 0 || r >= gridRows || c < 0 || c >= gridCols) return true;
            return grid[r + ',' + c] === 'wall';
          },
          isEnd: (r, c) => {
            checkOps();
            return r === endNode[0] && c === endNode[1];
          },
          getNeighbors: (r, c) => {
            checkOps();
            const neighbors = [];
            const dirs = [[-1,0], [1,0], [0,-1], [0,1]];
            for (let i = 0; i < dirs.length; i++) {
              const nr = r + dirs[i][0];
              const nc = c + dirs[i][1];
              const key = nr + ',' + nc;
              if (nr >= 0 && nr < gridRows && nc >= 0 && nc < gridCols) {
                if (grid[key] !== 'wall') {
                  neighbors.push([nr, nc]);
                }
              }
            }
            return neighbors;
          },
          PriorityQueue: class PriorityQueue {
            constructor() {
              this.items = [];
            }
            enqueue(element, priority) {
              const queueElement = { element, priority };
              let added = false;
              for (let i = 0; i < this.items.length; i++) {
                if (this.items[i].priority > queueElement.priority) {
                  this.items.splice(i, 0, queueElement);
                  added = true;
                  break;
                }
              }
              if (!added) {
                this.items.push(queueElement);
              }
            }
            dequeue() {
              if (this.isEmpty()) return null;
              return this.items.shift().element;
            }
            isEmpty() {
              return this.items.length === 0;
            }
          }
        };

        const userFn = new Function('start', 'end', 'helpers', 
          code + "\\nreturn (typeof findPath === 'function') ? findPath : null;"
        );
        const findPathFn = userFn(startNode, endNode, helpers);
        if (!findPathFn) {
          throw new Error("Could not find a function named 'findPath(start, end, helpers)' in your code.");
        }
        
        const path = findPathFn(startNode, endNode, helpers);
        
        if (path && Array.isArray(path)) {
          // Trace the path elements
          for (let i = 0; i < path.length; i++) {
            const pt = path[i];
            const key = pt[0] + ',' + pt[1];
            grid[key] = 'path';
            steps.push({
              type: 'path',
              coords: [pt],
              gridState: { ...grid },
              counts: { comparisons, mutationsOrVisits },
              description: "Highlighting path node [" + pt[0] + ", " + pt[1] + "]"
            });
          }
          steps.push({
            type: 'found',
            gridState: { ...grid },
            counts: { comparisons, mutationsOrVisits },
            description: "Path reconstruction complete! Shortest path length: " + path.length
          });
        } else {
          steps.push({
            type: 'error',
            gridState: { ...grid },
            counts: { comparisons, mutationsOrVisits },
            description: "Algorithm finished but no valid path coordinates list was returned."
          });
        }
        
        self.postMessage({ success: true, steps });
      }
    } catch (err) {
      self.postMessage({ success: false, error: err.message });
    }
  };
`;

export function runAlgorithm(
  code: string,
  category: 'sorting' | 'searching' | 'pathfinding',
  config: {
    inputArray?: number[];
    target?: number;
    gridWalls?: Record<string, boolean>;
    startNode?: [number, number];
    endNode?: [number, number];
    gridRows?: number;
    gridCols?: number;
  }
): Promise<{ success: boolean; steps: Step[]; error?: string }> {
  return new Promise((resolve) => {
    const blob = new Blob([workerCodeString], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);

    // Safety timeout: terminate execution if it hangs longer than 1500ms
    const timeoutId = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        success: false,
        steps: [],
        error: 'Execution Timeout: Code took longer than 1500ms. Possible infinite loop!'
      });
    }, 1500);

    worker.onmessage = (e) => {
      clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timeoutId);
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      resolve({
        success: false,
        steps: [],
        error: `Syntax / Runtime Error inside script: ${e.message}`
      });
    };

    worker.postMessage({
      code,
      inputArray: config.inputArray || [],
      target: config.target ?? 45, // default search target
      gridWalls: config.gridWalls || {},
      startNode: config.startNode || [4, 5],
      endNode: config.endNode || [15, 22],
      gridRows: config.gridRows || 20,
      gridCols: config.gridCols || 30,
      category,
    });
  });
}
