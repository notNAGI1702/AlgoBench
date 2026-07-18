export interface PathAlgorithmConfig {
  id: string;
  name: string;
  description: string;
  codeTemplate: string;
}

export const PATHFINDING_ALGORITHMS: Record<string, PathAlgorithmConfig> = {
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    description: 'Explores nodes layer by layer, expanding outward equally in all directions. Guarantees the shortest path on unweighted grids. $O(V + E)$ complexity.',
    codeTemplate: `function findPath(start, end, helpers) {
  const { visit, enqueue, getNeighbors, isEnd } = helpers;
  
  const queue = [start];
  const parent = {};
  const visited = new Set();
  const startKey = start[0] + ',' + start[1];
  
  visited.add(startKey);
  
  while (queue.length > 0) {
    const curr = queue.shift();
    const currKey = curr[0] + ',' + curr[1];
    
    // visit(row, col) updates the node status to 'visited' and logs the step
    visit(curr[0], curr[1]);
    
    if (isEnd(curr[0], curr[1])) {
      // Reconstruct final path from end to start using parents
      const path = [];
      let tempKey = end[0] + ',' + end[1];
      while (tempKey !== startKey) {
        const p = parent[tempKey];
        if (!p) break;
        path.unshift(p);
        tempKey = p[0] + ',' + p[1];
      }
      path.push(end);
      return path; // Return list of coordinates: [[r1,c1], [r2,c2], ...]
    }
    
    // getNeighbors(row, col) returns accessible adjacents (up, down, left, right), excluding walls
    const neighbors = getNeighbors(curr[0], curr[1]);
    for (let i = 0; i < neighbors.length; i++) {
      const n = neighbors[i];
      const nKey = n[0] + ',' + n[1];
      
      if (!visited.has(nKey)) {
        visited.add(nKey);
        parent[nKey] = curr;
        // enqueue(row, col) highlights nodes currently waiting to be explored
        enqueue(n[0], n[1]);
        queue.push(n);
      }
    }
  }
  return null; // Return null if no path exists
}`
  },
  dfs: {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    description: 'Explores as deep as possible along each branch before backtracking. Does not guarantee the shortest path. $O(V + E)$ complexity.',
    codeTemplate: `function findPath(start, end, helpers) {
  const { visit, enqueue, getNeighbors, isEnd } = helpers;
  
  const stack = [start];
  const parent = {};
  const visited = new Set();
  const startKey = start[0] + ',' + start[1];
  
  visited.add(startKey);
  
  while (stack.length > 0) {
    const curr = stack.pop();
    visit(curr[0], curr[1]);
    
    if (isEnd(curr[0], curr[1])) {
      const path = [];
      let tempKey = end[0] + ',' + end[1];
      while (tempKey !== startKey) {
        const p = parent[tempKey];
        if (!p) break;
        path.unshift(p);
        tempKey = p[0] + ',' + p[1];
      }
      path.push(end);
      return path;
    }
    
    const neighbors = getNeighbors(curr[0], curr[1]);
    // Push neighbors in reverse order to explore top/left neighbors first
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const n = neighbors[i];
      const nKey = n[0] + ',' + n[1];
      if (!visited.has(nKey)) {
        visited.add(nKey);
        parent[nKey] = curr;
        enqueue(n[0], n[1]);
        stack.push(n);
      }
    }
  }
  return null;
}`
  },
  dijkstra: {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    description: 'Explores paths based on cumulative cost. Guarantees the shortest path. In this grid, edge weights are uniform (1). $O((V + E) \\log V)$ complexity.',
    codeTemplate: `function findPath(start, end, helpers) {
  const { visit, enqueue, getNeighbors, isEnd, PriorityQueue } = helpers;
  
  // Use pre-injected priority queue helper
  // Methods: enqueue(item, priority), dequeue(), isEmpty()
  const pq = new PriorityQueue();
  const dist = {};
  const parent = {};
  const startKey = start[0] + ',' + start[1];
  
  dist[startKey] = 0;
  pq.enqueue(start, 0);
  enqueue(start[0], start[1]);
  
  while (!pq.isEmpty()) {
    const curr = pq.dequeue();
    const currKey = curr[0] + ',' + curr[1];
    
    visit(curr[0], curr[1]);
    
    if (isEnd(curr[0], curr[1])) {
      const path = [];
      let tempKey = end[0] + ',' + end[1];
      while (tempKey !== startKey) {
        const p = parent[tempKey];
        if (!p) break;
        path.unshift(p);
        tempKey = p[0] + ',' + p[1];
      }
      path.push(end);
      return path;
    }
    
    const neighbors = getNeighbors(curr[0], curr[1]);
    for (let i = 0; i < neighbors.length; i++) {
      const n = neighbors[i];
      const nKey = n[0] + ',' + n[1];
      const alt = dist[currKey] + 1; // Grid edge weight is 1
      
      if (dist[nKey] === undefined || alt < dist[nKey]) {
        dist[nKey] = alt;
        parent[nKey] = curr;
        enqueue(n[0], n[1]);
        pq.enqueue(n, alt);
      }
    }
  }
  return null;
}`
  },
  astar: {
    id: 'astar',
    name: 'A* Search',
    description: 'Uses heuristics (Manhattan distance in this grid) to guide exploration, yielding a much faster shortest-path search than Dijkstra. $O(E \\log V)$ complexity.',
    codeTemplate: `function findPath(start, end, helpers) {
  const { visit, enqueue, getNeighbors, isEnd, PriorityQueue } = helpers;
  
  function getManhattanDistance(nodeA, nodeB) {
    return Math.abs(nodeA[0] - nodeB[0]) + Math.abs(nodeA[1] - nodeB[1]);
  }
  
  const pq = new PriorityQueue();
  const gScore = {};
  const parent = {};
  const startKey = start[0] + ',' + start[1];
  
  gScore[startKey] = 0;
  // Priority is fScore = gScore + hScore
  pq.enqueue(start, getManhattanDistance(start, end));
  enqueue(start[0], start[1]);
  
  while (!pq.isEmpty()) {
    const curr = pq.dequeue();
    const currKey = curr[0] + ',' + curr[1];
    
    visit(curr[0], curr[1]);
    
    if (isEnd(curr[0], curr[1])) {
      const path = [];
      let tempKey = end[0] + ',' + end[1];
      while (tempKey !== startKey) {
        const p = parent[tempKey];
        if (!p) break;
        path.unshift(p);
        tempKey = p[0] + ',' + p[1];
      }
      path.push(end);
      return path;
    }
    
    const neighbors = getNeighbors(curr[0], curr[1]);
    for (let i = 0; i < neighbors.length; i++) {
      const n = neighbors[i];
      const nKey = n[0] + ',' + n[1];
      const tentativeG = gScore[currKey] + 1;
      
      if (gScore[nKey] === undefined || tentativeG < gScore[nKey]) {
        gScore[nKey] = tentativeG;
        parent[nKey] = curr;
        enqueue(n[0], n[1]);
        
        const fScore = tentativeG + getManhattanDistance(n, end);
        pq.enqueue(n, fScore);
      }
    }
  }
  return null;
}`
  }
};
