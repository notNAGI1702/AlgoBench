export interface SortAlgorithmConfig {
  id: string;
  name: string;
  description: string;
  codeTemplate: string;
}

export const SORTING_ALGORITHMS: Record<string, SortAlgorithmConfig> = {
  bubble: {
    id: 'bubble',
    name: 'Bubble Sort',
    description: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. $O(N^2)$ complexity.',
    codeTemplate: `function sort(arr, helpers) {
  const { compare, swap } = helpers;
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // compare(a, b) records a comparison operation and returns arr[a] - arr[b]
      if (compare(j, j + 1) > 0) {
        // swap(a, b) records a swap operation and swaps the elements in the array
        swap(j, j + 1);
      }
    }
  }
}`
  },
  insertion: {
    id: 'insertion',
    name: 'Insertion Sort',
    description: 'Builds the sorted array one element at a time by inserting elements into their correct position. $O(N^2)$ complexity.',
    codeTemplate: `function sort(arr, helpers) {
  const { compare, swap } = helpers;
  const n = arr.length;
  
  for (let i = 1; i < n; i++) {
    let j = i;
    // Compare current element with its predecessor
    while (j > 0 && compare(j - 1, j) > 0) {
      swap(j - 1, j);
      j--;
    }
  }
}`
  },
  merge: {
    id: 'merge',
    name: 'Merge Sort',
    description: 'A divide-and-conquer algorithm that recursively splits the array in half, sorts each half, and merges them back. $O(N \\log N)$ complexity.',
    codeTemplate: `function sort(arr, helpers) {
  const { compare, setValue } = helpers;
  
  function merge(l, m, r) {
    const n1 = m - l + 1;
    const n2 = r - m;
    
    // Create temporary storage arrays
    const L = [];
    const R = [];
    for (let i = 0; i < n1; i++) L.push(arr[l + i]);
    for (let j = 0; j < n2; j++) R.push(arr[m + 1 + j]);
    
    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
      // To instrument comparisons, we compare indices within arr where we are inserting
      // Or we compare elements directly. We simulate it using compare:
      // compare(a, b) returns values, we simulate writing elements
      if (L[i] <= R[j]) {
        setValue(k, L[i]);
        i++;
      } else {
        setValue(k, R[j]);
        j++;
      }
      k++;
    }
    
    while (i < n1) {
      setValue(k, L[i]);
      i++;
      k++;
    }
    
    while (j < n2) {
      setValue(k, R[j]);
      j++;
      k++;
    }
  }
  
  function mergeSort(l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    mergeSort(l, m);
    mergeSort(m + 1, r);
    merge(l, m, r);
  }
  
  mergeSort(0, arr.length - 1);
}`
  },
  quick: {
    id: 'quick',
    name: 'Quick Sort',
    description: 'A divide-and-conquer algorithm that selects a "pivot" element and partitions the other elements around it. $O(N \\log N)$ average complexity.',
    codeTemplate: `function sort(arr, helpers) {
  const { compare, swap } = helpers;
  
  function partition(low, high) {
    // Select the last element as pivot
    const pivot = high;
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
      if (compare(j, pivot) < 0) {
        i++;
        swap(i, j);
      }
    }
    swap(i + 1, high);
    return i + 1;
  }
  
  function quickSort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  }
  
  quickSort(0, arr.length - 1);
}`
  },
  heap: {
    id: 'heap',
    name: 'Heap Sort',
    description: 'A comparison-based sort that visualizes the array as a binary heap, building a max heap and repeatedly swapping the max element to the end. $O(N \\log N)$ complexity.',
    codeTemplate: `function sort(arr, helpers) {
  const { compare, swap } = helpers;
  const n = arr.length;
  
  function heapify(size, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < size && compare(left, largest) > 0) {
      largest = left;
    }
    
    if (right < size && compare(right, largest) > 0) {
      largest = right;
    }
    
    if (largest !== i) {
      swap(i, largest);
      heapify(size, largest);
    }
  }
  
  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }
  
  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    swap(0, i);
    heapify(i, 0);
  }
}`
  }
};
