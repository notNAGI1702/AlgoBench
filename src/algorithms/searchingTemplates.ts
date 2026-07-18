export interface SearchAlgorithmConfig {
  id: string;
  name: string;
  description: string;
  codeTemplate: string;
}

export const SEARCHING_ALGORITHMS: Record<string, SearchAlgorithmConfig> = {
  linear: {
    id: 'linear',
    name: 'Linear Search',
    description: 'Sequentially checks each element of the list until a match is found or the whole list has been searched. $O(N)$ complexity.',
    codeTemplate: `function search(arr, helpers) {
  const { compareWithTarget } = helpers;
  const n = arr.length;
  
  for (let i = 0; i < n; i++) {
    // compareWithTarget(i) compares value at index i with the target value
    // Returns 0 if equal, <0 if arr[i] < target, >0 if arr[i] > target
    if (compareWithTarget(i) === 0) {
      return i; // Returns the index of the found item
    }
  }
  return -1; // Target not found
}`
  },
  binary: {
    id: 'binary',
    name: 'Binary Search',
    description: 'Finds the position of a target value within a sorted array by repeatedly dividing the search interval in half. $O(\\log N)$ complexity.',
    codeTemplate: `function search(arr, helpers) {
  const { compareWithTarget, select } = helpers;
  let low = 0;
  let high = arr.length - 1;
  
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    
    // select(mid) highlights the mid index visually
    select(mid);
    
    const cmp = compareWithTarget(mid);
    if (cmp === 0) {
      return mid; // Found it!
    } else if (cmp < 0) {
      low = mid + 1; // Target is in the right half
    } else {
      high = mid - 1; // Target is in the left half
    }
  }
  return -1; // Target not found
}`
  }
};
