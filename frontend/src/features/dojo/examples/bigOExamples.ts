// Big O Battle Hardcoded Examples
// 15 examples per language × 7 languages = 105 examples

export interface BigOExample {
    code: string;
    correctComplexity: string;
    options: string[];
    explanation: string;
    language: string;
}

// ============================================================================
// PYTHON EXAMPLES (15)
// ============================================================================
const pythonBigO: BigOExample[] = [
    {
        code: `def get_first(arr):
    return arr[0] if arr else None`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Accessing the first element of an array is constant time - it doesn\'t depend on array size.',
        language: 'python'
    },
    {
        code: `def find_element(arr, target):
    for item in arr:
        if item == target:
            return True
    return False`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Linear search checks each element once in the worst case, making it O(n).',
        language: 'python'
    },
    {
        code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Binary search halves the search space with each iteration, giving logarithmic complexity.',
        language: 'python'
    },
    {
        code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
        explanation: 'Two nested loops each iterating n times gives O(n × n) = O(n²).',
        language: 'python'
    },
    {
        code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`,
        correctComplexity: 'O(n log n)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        explanation: 'Merge sort divides the array log(n) times and merges n elements at each level.',
        language: 'python'
    },
    {
        code: `def sum_array(arr):
    total = 0
    for num in arr:
        total += num
    return total`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Single loop through all n elements = O(n).',
        language: 'python'
    },
    {
        code: `def is_even(n):
    return n % 2 == 0`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Modulo operation is constant time regardless of input size.',
        language: 'python'
    },
    {
        code: `def print_pairs(arr):
    for i in arr:
        for j in arr:
            print(i, j)`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'],
        explanation: 'Two nested loops over the same array: n × n = O(n²).',
        language: 'python'
    },
    {
        code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)`,
        correctComplexity: 'O(2^n)',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(2^n)'],
        explanation: 'Naive recursive Fibonacci creates a binary tree of calls, giving exponential complexity.',
        language: 'python'
    },
    {
        code: `def access_matrix(matrix, i, j):
    return matrix[i][j]`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(m×n)'],
        explanation: 'Accessing a specific index in a 2D array is constant time.',
        language: 'python'
    },
    {
        code: `def find_duplicates(arr):
    seen = set()
    duplicates = []
    for item in arr:
        if item in seen:
            duplicates.append(item)
        seen.add(item)
    return duplicates`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
        explanation: 'Single pass through array with O(1) set operations = O(n).',
        language: 'python'
    },
    {
        code: `def three_sum(arr):
    result = []
    for i in range(len(arr)):
        for j in range(i+1, len(arr)):
            for k in range(j+1, len(arr)):
                if arr[i] + arr[j] + arr[k] == 0:
                    result.append([arr[i], arr[j], arr[k]])
    return result`,
        correctComplexity: 'O(n³)',
        options: ['O(n)', 'O(n²)', 'O(n³)', 'O(2^n)'],
        explanation: 'Three nested loops, each up to n iterations = O(n³).',
        language: 'python'
    },
    {
        code: `def count_down(n):
    while n > 0:
        print(n)
        n = n // 2`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Dividing by 2 each iteration means log₂(n) iterations.',
        language: 'python'
    },
    {
        code: `def has_value(dictionary, value):
    return value in dictionary.values()`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Checking if value exists requires iterating through all values = O(n).',
        language: 'python'
    },
    {
        code: `def get_value(dictionary, key):
    return dictionary.get(key)`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Dictionary/hash table lookup by key is O(1) average case.',
        language: 'python'
    }
];

// ============================================================================
// JAVASCRIPT EXAMPLES (15)
// ============================================================================
const javascriptBigO: BigOExample[] = [
    {
        code: `function getFirst(arr) {
    return arr[0];
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Array index access is constant time.',
        language: 'javascript'
    },
    {
        code: `function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) return i;
    }
    return -1;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Iterating through up to n elements = O(n).',
        language: 'javascript'
    },
    {
        code: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Halving search space each time = O(log n).',
        language: 'javascript'
    },
    {
        code: `function hasDuplicate(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j]) return true;
        }
    }
    return false;
}`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'],
        explanation: 'Nested loops comparing all pairs = O(n²).',
        language: 'javascript'
    },
    {
        code: `function reverseArray(arr) {
    const result = [];
    for (let i = arr.length - 1; i >= 0; i--) {
        result.push(arr[i]);
    }
    return result;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Single pass through the array = O(n).',
        language: 'javascript'
    },
    {
        code: `function getMax(arr) {
    return Math.max(...arr);
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Math.max with spread operator checks all n elements.',
        language: 'javascript'
    },
    {
        code: `function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'n recursive calls = O(n).',
        language: 'javascript'
    },
    {
        code: `function powerSet(arr) {
    const result = [[]];
    for (const item of arr) {
        const newSubsets = result.map(subset => [...subset, item]);
        result.push(...newSubsets);
    }
    return result;
}`,
        correctComplexity: 'O(2^n)',
        options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(2^n)'],
        explanation: 'Generating all subsets of a set = 2^n subsets.',
        language: 'javascript'
    },
    {
        code: `function quickSort(arr) {
    if (arr.length <= 1) return arr;
    const pivot = arr[0];
    const left = arr.slice(1).filter(x => x < pivot);
    const right = arr.slice(1).filter(x => x >= pivot);
    return [...quickSort(left), pivot, ...quickSort(right)];
}`,
        correctComplexity: 'O(n log n)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        explanation: 'Average case quicksort is O(n log n).',
        language: 'javascript'
    },
    {
        code: `function mapDouble(arr) {
    return arr.map(x => x * 2);
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Map iterates through all n elements once.',
        language: 'javascript'
    },
    {
        code: `function objectLookup(obj, key) {
    return obj[key];
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Object property access is O(1) on average.',
        language: 'javascript'
    },
    {
        code: `function flattenDeep(arr) {
    return arr.flat(Infinity);
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
        explanation: 'Flattening visits each element once = O(n) where n is total elements.',
        language: 'javascript'
    },
    {
        code: `function intersection(arr1, arr2) {
    const set1 = new Set(arr1);
    return arr2.filter(x => set1.has(x));
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
        explanation: 'O(n) to build set + O(m) to filter = O(n + m) ≈ O(n).',
        language: 'javascript'
    },
    {
        code: `function selectionSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
}`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
        explanation: 'Nested loops scanning and swapping = O(n²).',
        language: 'javascript'
    },
    {
        code: `function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
    }
    return true;
}`,
        correctComplexity: 'O(√n)',
        options: ['O(1)', 'O(log n)', 'O(√n)', 'O(n)'],
        explanation: 'Loop runs up to √n iterations.',
        language: 'javascript'
    }
];

// ============================================================================
// TYPESCRIPT EXAMPLES (15)
// ============================================================================
const typescriptBigO: BigOExample[] = [
    {
        code: `function getLength<T>(arr: T[]): number {
    return arr.length;
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Array length is stored as a property, accessed in O(1).',
        language: 'typescript'
    },
    {
        code: `function findIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
    for (let i = 0; i < arr.length; i++) {
        if (predicate(arr[i])) return i;
    }
    return -1;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Worst case iterates through all n elements.',
        language: 'typescript'
    },
    {
        code: `function binarySearchGeneric<T>(arr: T[], target: T, compare: (a: T, b: T) => number): number {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const cmp = compare(arr[mid], target);
        if (cmp === 0) return mid;
        if (cmp < 0) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Binary search halves the space each iteration.',
        language: 'typescript'
    },
    {
        code: `function cartesianProduct<T, U>(arr1: T[], arr2: U[]): [T, U][] {
    const result: [T, U][] = [];
    for (const a of arr1) {
        for (const b of arr2) {
            result.push([a, b]);
        }
    }
    return result;
}`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
        explanation: 'Nested loops over two arrays of size n = O(n × n).',
        language: 'typescript'
    },
    {
        code: `function unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
        explanation: 'Set creation is O(n), spreading is O(n) = O(n).',
        language: 'typescript'
    },
    {
        code: `function groupBy<T, K extends string | number>(arr: T[], keyFn: (item: T) => K): Record<K, T[]> {
    const result = {} as Record<K, T[]>;
    for (const item of arr) {
        const key = keyFn(item);
        if (!result[key]) result[key] = [];
        result[key].push(item);
    }
    return result;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
        explanation: 'Single pass through array with O(1) object operations.',
        language: 'typescript'
    },
    {
        code: `function mergeArrays<T>(arr1: T[], arr2: T[]): T[] {
    return [...arr1, ...arr2];
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Spreading both arrays = O(n + m) ≈ O(n).',
        language: 'typescript'
    },
    {
        code: `function heapSort<T>(arr: T[]): T[] {
    // Heapsort implementation
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
    return arr;
}`,
        correctComplexity: 'O(n log n)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        explanation: 'Heapsort always runs in O(n log n).',
        language: 'typescript'
    },
    {
        code: `function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n/k)', 'O(n²)'],
        explanation: 'Each element is visited once when slicing.',
        language: 'typescript'
    },
    {
        code: `function permutations<T>(arr: T[]): T[][] {
    if (arr.length <= 1) return [arr];
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i++) {
        const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
        for (const perm of permutations(rest)) {
            result.push([arr[i], ...perm]);
        }
    }
    return result;
}`,
        correctComplexity: 'O(n!)',
        options: ['O(n)', 'O(n²)', 'O(2^n)', 'O(n!)'],
        explanation: 'Generating all permutations = n! permutations.',
        language: 'typescript'
    },
    {
        code: `function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
        explanation: 'Serializing and parsing visits each element once.',
        language: 'typescript'
    },
    {
        code: `function zip<T, U>(arr1: T[], arr2: U[]): [T, U][] {
    const length = Math.min(arr1.length, arr2.length);
    const result: [T, U][] = [];
    for (let i = 0; i < length; i++) {
        result.push([arr1[i], arr2[i]]);
    }
    return result;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
        explanation: 'Single loop through min(n, m) elements.',
        language: 'typescript'
    },
    {
        code: `function memoize<T extends (...args: any[]) => any>(fn: T): T {
    const cache = new Map<string, ReturnType<T>>();
    return ((...args: Parameters<T>) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key)!;
        const result = fn(...args);
        cache.set(key, result);
        return result;
    }) as T;
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'With memoization, repeated calls are O(1) cache lookups.',
        language: 'typescript'
    },
    {
        code: `function countOccurrences<T>(arr: T[]): Map<T, number> {
    const counts = new Map<T, number>();
    for (const item of arr) {
        counts.set(item, (counts.get(item) || 0) + 1);
    }
    return counts;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
        explanation: 'Single pass with O(1) Map operations.',
        language: 'typescript'
    },
    {
        code: `function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? \`\${prefix}.\${key}\` : key;
        if (typeof value === 'object' && value !== null) {
            Object.assign(result, flattenObject(value, newKey));
        } else {
            result[newKey] = value;
        }
    }
    return result;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(log n)'],
        explanation: 'Visits each key-value pair once in total.',
        language: 'typescript'
    }
];

// ============================================================================
// JAVA EXAMPLES (15)
// ============================================================================
const javaBigO: BigOExample[] = [
    {
        code: `public int getFirst(int[] arr) {
    return arr[0];
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Array index access is constant time.',
        language: 'java'
    },
    {
        code: `public int linearSearch(int[] arr, int target) {
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Worst case checks all n elements.',
        language: 'java'
    },
    {
        code: `public int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Search space halves each iteration.',
        language: 'java'
    },
    {
        code: `public void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
        explanation: 'Two nested loops = O(n²).',
        language: 'java'
    },
    {
        code: `public int sumArray(int[] arr) {
    int sum = 0;
    for (int num : arr) {
        sum += num;
    }
    return sum;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Single loop through n elements.',
        language: 'java'
    },
    {
        code: `public boolean containsKey(HashMap<String, Integer> map, String key) {
    return map.containsKey(key);
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'HashMap lookup is O(1) average case.',
        language: 'java'
    },
    {
        code: `public void printMatrix(int[][] matrix) {
    for (int i = 0; i < matrix.length; i++) {
        for (int j = 0; j < matrix[i].length; j++) {
            System.out.print(matrix[i][j] + " ");
        }
        System.out.println();
    }
}`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
        explanation: 'For n×n matrix, prints n² elements.',
        language: 'java'
    },
    {
        code: `public int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
        correctComplexity: 'O(2^n)',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(2^n)'],
        explanation: 'Naive recursion creates exponential calls.',
        language: 'java'
    },
    {
        code: `public List<Integer> removeDuplicates(List<Integer> list) {
    return new ArrayList<>(new HashSet<>(list));
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
        explanation: 'HashSet creation is O(n).',
        language: 'java'
    },
    {
        code: `public void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        explanation: 'Worst case: inner loop runs n times for each outer iteration.',
        language: 'java'
    },
    {
        code: `public int countDigits(int n) {
    int count = 0;
    while (n != 0) {
        count++;
        n /= 10;
    }
    return count;
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Number of digits = log₁₀(n).',
        language: 'java'
    },
    {
        code: `public boolean isPalindrome(String s) {
    int left = 0, right = s.length() - 1;
    while (left < right) {
        if (s.charAt(left) != s.charAt(right)) return false;
        left++;
        right--;
    }
    return true;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Checks up to n/2 characters = O(n).',
        language: 'java'
    },
    {
        code: `public void mergeSort(int[] arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}`,
        correctComplexity: 'O(n log n)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        explanation: 'log n levels of recursion, n work per level.',
        language: 'java'
    },
    {
        code: `public int power(int base, int exp) {
    if (exp == 0) return 1;
    if (exp % 2 == 0) {
        int half = power(base, exp / 2);
        return half * half;
    }
    return base * power(base, exp - 1);
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Exponentiation by squaring = O(log n).',
        language: 'java'
    },
    {
        code: `public String reverseString(String s) {
    return new StringBuilder(s).reverse().toString();
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'StringBuilder reverse iterates through n characters.',
        language: 'java'
    }
];

// ============================================================================
// C++ EXAMPLES (15)
// ============================================================================
const cppBigO: BigOExample[] = [
    {
        code: `int getFirst(vector<int>& arr) {
    return arr[0];
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Vector index access is constant time.',
        language: 'cpp'
    },
    {
        code: `int linearSearch(vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Iterates through up to n elements.',
        language: 'cpp'
    },
    {
        code: `int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Halves search space each iteration.',
        language: 'cpp'
    },
    {
        code: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
        explanation: 'Two nested loops = O(n²).',
        language: 'cpp'
    },
    {
        code: `int sumVector(vector<int>& arr) {
    return accumulate(arr.begin(), arr.end(), 0);
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'accumulate iterates through all n elements.',
        language: 'cpp'
    },
    {
        code: `bool findInMap(unordered_map<string, int>& m, string key) {
    return m.find(key) != m.end();
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'unordered_map lookup is O(1) average.',
        language: 'cpp'
    },
    {
        code: `bool findInOrderedMap(map<string, int>& m, string key) {
    return m.find(key) != m.end();
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'std::map uses red-black tree, lookup is O(log n).',
        language: 'cpp'
    },
    {
        code: `void printAllPairs(vector<int>& arr) {
    for (int i : arr) {
        for (int j : arr) {
            cout << i << ", " << j << endl;
        }
    }
}`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'],
        explanation: 'Nested loops over same array = O(n²).',
        language: 'cpp'
    },
    {
        code: `int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
        correctComplexity: 'O(2^n)',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(2^n)'],
        explanation: 'Naive recursion creates exponential calls.',
        language: 'cpp'
    },
    {
        code: `vector<int> removeDuplicates(vector<int>& arr) {
    unordered_set<int> seen(arr.begin(), arr.end());
    return vector<int>(seen.begin(), seen.end());
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
        explanation: 'Set construction is O(n).',
        language: 'cpp'
    },
    {
        code: `void sortVector(vector<int>& arr) {
    sort(arr.begin(), arr.end());
}`,
        correctComplexity: 'O(n log n)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        explanation: 'std::sort is introsort, guaranteed O(n log n).',
        language: 'cpp'
    },
    {
        code: `int countBits(int n) {
    int count = 0;
    while (n) {
        count += n & 1;
        n >>= 1;
    }
    return count;
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Iterates through log₂(n) bits.',
        language: 'cpp'
    },
    {
        code: `string reverseString(string s) {
    reverse(s.begin(), s.end());
    return s;
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'std::reverse touches each character once.',
        language: 'cpp'
    },
    {
        code: `void heapify(vector<int>& arr, int n, int i) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);
    }
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Heapify traverses the height of the tree = O(log n).',
        language: 'cpp'
    },
    {
        code: `bool isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Bitwise operation is constant time.',
        language: 'cpp'
    }
];

// ============================================================================
// GO EXAMPLES (15)
// ============================================================================
const goBigO: BigOExample[] = [
    {
        code: `func getFirst(arr []int) int {
    return arr[0]
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Slice index access is constant time.',
        language: 'go'
    },
    {
        code: `func linearSearch(arr []int, target int) int {
    for i, v := range arr {
        if v == target {
            return i
        }
    }
    return -1
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Iterates through up to n elements.',
        language: 'go'
    },
    {
        code: `func binarySearch(arr []int, target int) int {
    left, right := 0, len(arr)-1
    for left <= right {
        mid := left + (right-left)/2
        if arr[mid] == target {
            return mid
        } else if arr[mid] < target {
            left = mid + 1
        } else {
            right = mid - 1
        }
    }
    return -1
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Halves search space each iteration.',
        language: 'go'
    },
    {
        code: `func bubbleSort(arr []int) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
            }
        }
    }
}`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
        explanation: 'Two nested loops = O(n²).',
        language: 'go'
    },
    {
        code: `func sum(arr []int) int {
    total := 0
    for _, v := range arr {
        total += v
    }
    return total
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Single loop through all elements.',
        language: 'go'
    },
    {
        code: `func mapLookup(m map[string]int, key string) (int, bool) {
    val, ok := m[key]
    return val, ok
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Go map lookup is O(1) average.',
        language: 'go'
    },
    {
        code: `func printPairs(arr []int) {
    for _, a := range arr {
        for _, b := range arr {
            fmt.Println(a, b)
        }
    }
}`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'],
        explanation: 'Nested loops = O(n²).',
        language: 'go'
    },
    {
        code: `func fibonacci(n int) int {
    if n <= 1 {
        return n
    }
    return fibonacci(n-1) + fibonacci(n-2)
}`,
        correctComplexity: 'O(2^n)',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(2^n)'],
        explanation: 'Naive recursion = exponential.',
        language: 'go'
    },
    {
        code: `func unique(arr []int) []int {
    seen := make(map[int]bool)
    result := []int{}
    for _, v := range arr {
        if !seen[v] {
            seen[v] = true
            result = append(result, v)
        }
    }
    return result
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
        explanation: 'Single pass with O(1) map operations.',
        language: 'go'
    },
    {
        code: `func sortSlice(arr []int) {
    sort.Ints(arr)
}`,
        correctComplexity: 'O(n log n)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        explanation: 'Go sort uses pattern-defeating quicksort, O(n log n).',
        language: 'go'
    },
    {
        code: `func reverseString(s string) string {
    runes := []rune(s)
    for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
        runes[i], runes[j] = runes[j], runes[i]
    }
    return string(runes)
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Swaps n/2 pairs = O(n).',
        language: 'go'
    },
    {
        code: `func countOnes(n int) int {
    count := 0
    for n > 0 {
        count += n & 1
        n >>= 1
    }
    return count
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Iterates through log₂(n) bits.',
        language: 'go'
    },
    {
        code: `func appendSlice(slice []int, elements ...int) []int {
    return append(slice, elements...)
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Append may copy all elements if capacity exceeded.',
        language: 'go'
    },
    {
        code: `func contains(slice []int, target int) bool {
    for _, v := range slice {
        if v == target {
            return true
        }
    }
    return false
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Linear search through slice.',
        language: 'go'
    },
    {
        code: `func factorial(n int) int {
    if n <= 1 {
        return 1
    }
    return n * factorial(n-1)
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(2^n)'],
        explanation: 'n recursive calls = O(n).',
        language: 'go'
    }
];

// ============================================================================
// RUST EXAMPLES (15)
// ============================================================================
const rustBigO: BigOExample[] = [
    {
        code: `fn get_first(arr: &[i32]) -> Option<&i32> {
    arr.first()
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Getting first element is constant time.',
        language: 'rust'
    },
    {
        code: `fn linear_search(arr: &[i32], target: i32) -> Option<usize> {
    for (i, &item) in arr.iter().enumerate() {
        if item == target {
            return Some(i);
        }
    }
    None
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Iterates through up to n elements.',
        language: 'rust'
    },
    {
        code: `fn binary_search(arr: &[i32], target: i32) -> Option<usize> {
    let mut left = 0;
    let mut right = arr.len();
    while left < right {
        let mid = left + (right - left) / 2;
        match arr[mid].cmp(&target) {
            std::cmp::Ordering::Equal => return Some(mid),
            std::cmp::Ordering::Less => left = mid + 1,
            std::cmp::Ordering::Greater => right = mid,
        }
    }
    None
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Halves search space each iteration.',
        language: 'rust'
    },
    {
        code: `fn bubble_sort(arr: &mut [i32]) {
    let n = arr.len();
    for i in 0..n {
        for j in 0..n - i - 1 {
            if arr[j] > arr[j + 1] {
                arr.swap(j, j + 1);
            }
        }
    }
}`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(n³)'],
        explanation: 'Two nested loops = O(n²).',
        language: 'rust'
    },
    {
        code: `fn sum(arr: &[i32]) -> i32 {
    arr.iter().sum()
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Iterator sum visits all n elements.',
        language: 'rust'
    },
    {
        code: `fn hashmap_lookup(map: &HashMap<String, i32>, key: &str) -> Option<&i32> {
    map.get(key)
}`,
        correctComplexity: 'O(1)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'HashMap lookup is O(1) average.',
        language: 'rust'
    },
    {
        code: `fn print_pairs(arr: &[i32]) {
    for a in arr {
        for b in arr {
            println!("{}, {}", a, b);
        }
    }
}`,
        correctComplexity: 'O(n²)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'],
        explanation: 'Nested loops = O(n²).',
        language: 'rust'
    },
    {
        code: `fn fibonacci(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }
    fibonacci(n - 1) + fibonacci(n - 2)
}`,
        correctComplexity: 'O(2^n)',
        options: ['O(n)', 'O(n²)', 'O(log n)', 'O(2^n)'],
        explanation: 'Naive recursion = exponential.',
        language: 'rust'
    },
    {
        code: `fn unique(arr: &[i32]) -> Vec<i32> {
    let set: HashSet<_> = arr.iter().copied().collect();
    set.into_iter().collect()
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(n²)', 'O(n log n)'],
        explanation: 'HashSet construction is O(n).',
        language: 'rust'
    },
    {
        code: `fn sort_vec(arr: &mut [i32]) {
    arr.sort();
}`,
        correctComplexity: 'O(n log n)',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        explanation: 'Rust sort is O(n log n).',
        language: 'rust'
    },
    {
        code: `fn reverse_string(s: &str) -> String {
    s.chars().rev().collect()
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Reversing n characters = O(n).',
        language: 'rust'
    },
    {
        code: `fn count_ones(mut n: u32) -> u32 {
    let mut count = 0;
    while n > 0 {
        count += n & 1;
        n >>= 1;
    }
    count
}`,
        correctComplexity: 'O(log n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Iterates through log₂(n) bits.',
        language: 'rust'
    },
    {
        code: `fn map_double(arr: &[i32]) -> Vec<i32> {
    arr.iter().map(|x| x * 2).collect()
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Map applies function to each of n elements.',
        language: 'rust'
    },
    {
        code: `fn contains(arr: &[i32], target: i32) -> bool {
    arr.contains(&target)
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        explanation: 'Linear search through slice.',
        language: 'rust'
    },
    {
        code: `fn factorial(n: u64) -> u64 {
    (1..=n).product()
}`,
        correctComplexity: 'O(n)',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(2^n)'],
        explanation: 'Iterating from 1 to n = O(n).',
        language: 'rust'
    }
];

// ============================================================================
// EXPORT ALL
// ============================================================================
export const BIGO_EXAMPLES: Record<string, BigOExample[]> = {
    python: pythonBigO,
    javascript: javascriptBigO,
    typescript: typescriptBigO,
    java: javaBigO,
    cpp: cppBigO,
    go: goBigO,
    rust: rustBigO
};

// Get random BigO example for a language
export function getRandomBigOExample(language: string): BigOExample {
    const examples = BIGO_EXAMPLES[language] || BIGO_EXAMPLES.python;
    return examples[Math.floor(Math.random() * examples.length)];
}
