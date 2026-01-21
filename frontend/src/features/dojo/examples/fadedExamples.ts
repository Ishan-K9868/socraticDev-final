// Faded Examples (Fill-in-the-blank) Hardcoded Examples
// Language-specific examples for each supported language

export interface FadedExample {
    title: string;
    description: string;
    fullCode: string;
    template: string;
    blanks: Array<{
        id: string;
        position: number;
        answer: string;
        hint: string;
        length: number;
    }>;
    language: string;
}

// ============================================================================
// PYTHON EXAMPLES
// ============================================================================
const pythonFaded: FadedExample[] = [
    {
        title: "Binary Search",
        description: "Complete the binary search implementation",
        fullCode: `def binary_search(arr, target):
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
        template: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left ___ right:
        mid = (left + right) ___ 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid ___ 1
        else:
            right = mid ___ 1
    return ___`,
        blanks: [
            { id: '1', position: 65, answer: '<=', hint: 'Comparison operator', length: 2 },
            { id: '2', position: 105, answer: '//', hint: 'Integer division', length: 2 },
            { id: '3', position: 199, answer: '+', hint: 'Move left right', length: 1 },
            { id: '4', position: 246, answer: '-', hint: 'Move right left', length: 1 },
            { id: '5', position: 266, answer: '-1', hint: 'Not found', length: 2 }
        ],
        language: 'python'
    },
    {
        title: "Factorial Function",
        description: "Complete the factorial implementation",
        fullCode: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
        template: `def factorial(n):
    if n ___ 1:
        return ___
    return n ___ factorial(n ___ 1)`,
        blanks: [
            { id: '1', position: 27, answer: '<=', hint: 'Base case condition', length: 2 },
            { id: '2', position: 49, answer: '1', hint: 'Base case value', length: 1 },
            { id: '3', position: 66, answer: '*', hint: 'Multiply', length: 1 },
            { id: '4', position: 82, answer: '-', hint: 'Decrement', length: 1 }
        ],
        language: 'python'
    },
    {
        title: "FizzBuzz",
        description: "Complete the FizzBuzz solution",
        fullCode: `def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    elif n % 3 == 0:
        return "Fizz"
    elif n % 5 == 0:
        return "Buzz"
    return str(n)`,
        template: `def fizzbuzz(n):
    if n % ___ == 0:
        return "FizzBuzz"
    elif n % ___ == 0:
        return "Fizz"
    elif n % ___ == 0:
        return "Buzz"
    return ___(n)`,
        blanks: [
            { id: '1', position: 30, answer: '15', hint: 'Both 3 and 5', length: 2 },
            { id: '2', position: 74, answer: '3', hint: 'Fizz divisor', length: 1 },
            { id: '3', position: 116, answer: '5', hint: 'Buzz divisor', length: 1 },
            { id: '4', position: 157, answer: 'str', hint: 'Convert to string', length: 3 }
        ],
        language: 'python'
    },
    {
        title: "List Comprehension",
        description: "Filter even numbers",
        fullCode: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [x for x in numbers if x % 2 == 0]`,
        template: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [___ for ___ in numbers if x ___ 2 == 0]`,
        blanks: [
            { id: '1', position: 51, answer: 'x', hint: 'Value to include', length: 1 },
            { id: '2', position: 58, answer: 'x', hint: 'Loop variable', length: 1 },
            { id: '3', position: 81, answer: '%', hint: 'Modulo operator', length: 1 }
        ],
        language: 'python'
    }
];

// ============================================================================
// JAVASCRIPT EXAMPLES
// ============================================================================
const javascriptFaded: FadedExample[] = [
    {
        title: "Binary Search",
        description: "Complete the binary search implementation",
        fullCode: `function binarySearch(arr, target) {
    let left = 0, right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        template: `function binarySearch(arr, target) {
    let left = 0, right = arr.___ - 1;
    while (left ___ right) {
        const mid = Math.___((___ + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return ___;
}`,
        blanks: [
            { id: '1', position: 52, answer: 'length', hint: 'Array size property', length: 6 },
            { id: '2', position: 77, answer: '<=', hint: 'Comparison operator', length: 2 },
            { id: '3', position: 106, answer: 'floor', hint: 'Round down function', length: 5 },
            { id: '4', position: 113, answer: 'left', hint: 'Left boundary', length: 4 },
            { id: '5', position: 250, answer: '-1', hint: 'Not found value', length: 2 }
        ],
        language: 'javascript'
    },
    {
        title: "Array Filter",
        description: "Filter even numbers",
        fullCode: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens = numbers.filter(n => n % 2 === 0);`,
        template: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens = numbers.___(n ___ n % 2 ___ 0);`,
        blanks: [
            { id: '1', position: 64, answer: 'filter', hint: 'Array method to filter', length: 6 },
            { id: '2', position: 73, answer: '=>', hint: 'Arrow function', length: 2 },
            { id: '3', position: 82, answer: '===', hint: 'Strict equality', length: 3 }
        ],
        language: 'javascript'
    },
    {
        title: "Async/Await Fetch",
        description: "Complete the async fetch",
        fullCode: `async function fetchData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}`,
        template: `___ function fetchData(url) {
    const response = ___ fetch(url);
    const data = ___ response.___();
    return data;
}`,
        blanks: [
            { id: '1', position: 0, answer: 'async', hint: 'Async keyword', length: 5 },
            { id: '2', position: 46, answer: 'await', hint: 'Wait for promise', length: 5 },
            { id: '3', position: 75, answer: 'await', hint: 'Wait for json', length: 5 },
            { id: '4', position: 91, answer: 'json', hint: 'Parse response', length: 4 }
        ],
        language: 'javascript'
    },
    {
        title: "Array Reduce",
        description: "Sum array with reduce",
        fullCode: `const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, n) => acc + n, 0);`,
        template: `const numbers = [1, 2, 3, 4, 5];
const sum = numbers.___((acc, n) ___ acc ___ n, ___);`,
        blanks: [
            { id: '1', position: 45, answer: 'reduce', hint: 'Reduce method', length: 6 },
            { id: '2', position: 60, answer: '=>', hint: 'Arrow function', length: 2 },
            { id: '3', position: 67, answer: '+', hint: 'Add values', length: 1 },
            { id: '4', position: 72, answer: '0', hint: 'Initial value', length: 1 }
        ],
        language: 'javascript'
    }
];

// ============================================================================
// JAVA EXAMPLES
// ============================================================================
const javaFaded: FadedExample[] = [
    {
        title: "Binary Search",
        description: "Complete the binary search implementation",
        fullCode: `public int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        template: `public int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.___ - 1;
    while (left ___ right) {
        int mid = left + (right - left) ___ 2;
        if (arr[mid] ___ target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return ___;
}`,
        blanks: [
            { id: '1', position: 60, answer: 'length', hint: 'Array size property', length: 6 },
            { id: '2', position: 85, answer: '<=', hint: 'Comparison operator', length: 2 },
            { id: '3', position: 125, answer: '/', hint: 'Integer division', length: 1 },
            { id: '4', position: 148, answer: '==', hint: 'Equality check', length: 2 },
            { id: '5', position: 258, answer: '-1', hint: 'Not found value', length: 2 }
        ],
        language: 'java'
    },
    {
        title: "For Each Loop",
        description: "Sum array elements",
        fullCode: `public int sumArray(int[] arr) {
    int sum = 0;
    for (int n : arr) {
        sum += n;
    }
    return sum;
}`,
        template: `public int sumArray(int[] arr) {
    int sum = ___;
    for (int n ___ arr) {
        sum ___ n;
    }
    return ___;
}`,
        blanks: [
            { id: '1', position: 42, answer: '0', hint: 'Initial sum', length: 1 },
            { id: '2', position: 60, answer: ':', hint: 'Enhanced for loop', length: 1 },
            { id: '3', position: 82, answer: '+=', hint: 'Add to sum', length: 2 },
            { id: '4', position: 105, answer: 'sum', hint: 'Return the result', length: 3 }
        ],
        language: 'java'
    },
    {
        title: "String Builder",
        description: "Reverse a string",
        fullCode: `public String reverse(String s) {
    StringBuilder sb = new StringBuilder(s);
    return sb.reverse().toString();
}`,
        template: `public String reverse(String s) {
    StringBuilder sb = ___ StringBuilder(s);
    return sb.___().___();
}`,
        blanks: [
            { id: '1', position: 50, answer: 'new', hint: 'Create instance', length: 3 },
            { id: '2', position: 82, answer: 'reverse', hint: 'Reverse method', length: 7 },
            { id: '3', position: 92, answer: 'toString', hint: 'Convert to string', length: 8 }
        ],
        language: 'java'
    },
    {
        title: "ArrayList Operations",
        description: "Add and remove from list",
        fullCode: `ArrayList<Integer> list = new ArrayList<>();
list.add(10);
list.add(20);
list.remove(0);`,
        template: `ArrayList<Integer> list = new ___<>();
list.___(10);
list.___(20);
list.___(0);`,
        blanks: [
            { id: '1', position: 35, answer: 'ArrayList', hint: 'Dynamic array class', length: 9 },
            { id: '2', position: 52, answer: 'add', hint: 'Add element', length: 3 },
            { id: '3', position: 66, answer: 'add', hint: 'Add element', length: 3 },
            { id: '4', position: 80, answer: 'remove', hint: 'Remove by index', length: 6 }
        ],
        language: 'java'
    }
];

// ============================================================================
// TYPESCRIPT EXAMPLES
// ============================================================================
const typescriptFaded: FadedExample[] = [
    {
        title: "Generic Function",
        description: "Complete the generic identity function",
        fullCode: `function identity<T>(arg: T): T {
    return arg;
}
const result = identity<string>("hello");`,
        template: `function identity___(___ arg: ___): ___ {
    return arg;
}
const result = identity<___>("hello");`,
        blanks: [
            { id: '1', position: 17, answer: '<T>', hint: 'Generic type parameter', length: 3 },
            { id: '2', position: 21, answer: 'T', hint: 'Argument type', length: 1 },
            { id: '3', position: 28, answer: 'T', hint: 'Argument type', length: 1 },
            { id: '4', position: 31, answer: 'T', hint: 'Return type', length: 1 },
            { id: '5', position: 80, answer: 'string', hint: 'Type argument', length: 6 }
        ],
        language: 'typescript'
    },
    {
        title: "Interface Definition",
        description: "Complete the interface",
        fullCode: `interface User {
    name: string;
    age: number;
    email?: string;
}`,
        template: `___ User {
    name: ___;
    age: ___;
    email___ string;
}`,
        blanks: [
            { id: '1', position: 0, answer: 'interface', hint: 'Type definition keyword', length: 9 },
            { id: '2', position: 25, answer: 'string', hint: 'Text type', length: 6 },
            { id: '3', position: 42, answer: 'number', hint: 'Numeric type', length: 6 },
            { id: '4', position: 58, answer: '?:', hint: 'Optional property', length: 2 }
        ],
        language: 'typescript'
    },
    {
        title: "Type Guard",
        description: "Complete the type guard",
        fullCode: `function isString(value: unknown): value is string {
    return typeof value === "string";
}`,
        template: `function isString(value: ___): value ___ string {
    return ___ value ___ "string";
}`,
        blanks: [
            { id: '1', position: 33, answer: 'unknown', hint: 'Unknown type', length: 7 },
            { id: '2', position: 48, answer: 'is', hint: 'Type predicate', length: 2 },
            { id: '3', position: 68, answer: 'typeof', hint: 'Type operator', length: 6 },
            { id: '4', position: 81, answer: '===', hint: 'Strict equality', length: 3 }
        ],
        language: 'typescript'
    },
    {
        title: "Async Function",
        description: "Complete the async function",
        fullCode: `async function fetchUser(id: number): Promise<User> {
    const response = await fetch(\`/api/users/\${id}\`);
    return await response.json();
}`,
        template: `___ function fetchUser(id: number): ___<User> {
    const response = ___ fetch(\`/api/users/\${id}\`);
    return ___ response.json();
}`,
        blanks: [
            { id: '1', position: 0, answer: 'async', hint: 'Async keyword', length: 5 },
            { id: '2', position: 44, answer: 'Promise', hint: 'Promise return type', length: 7 },
            { id: '3', position: 76, answer: 'await', hint: 'Wait for promise', length: 5 },
            { id: '4', position: 114, answer: 'await', hint: 'Wait for json', length: 5 }
        ],
        language: 'typescript'
    }
];

// ============================================================================
// C++ EXAMPLES
// ============================================================================
const cppFaded: FadedExample[] = [
    {
        title: "Vector Operations",
        description: "Complete vector operations",
        fullCode: `vector<int> nums = {1, 2, 3, 4, 5};
nums.push_back(6);
int size = nums.size();
int first = nums[0];`,
        template: `vector<___> nums = {1, 2, 3, 4, 5};
nums.___back(6);
int size = nums.___();
int first = nums[___];`,
        blanks: [
            { id: '1', position: 7, answer: 'int', hint: 'Integer type', length: 3 },
            { id: '2', position: 38, answer: 'push_', hint: 'Add to end', length: 5 },
            { id: '3', position: 57, answer: 'size', hint: 'Get size', length: 4 },
            { id: '4', position: 80, answer: '0', hint: 'First index', length: 1 }
        ],
        language: 'cpp'
    },
    {
        title: "For Loop",
        description: "Complete the range-based for loop",
        fullCode: `vector<int> nums = {1, 2, 3, 4, 5};
int sum = 0;
for (int n : nums) {
    sum += n;
}`,
        template: `vector<int> nums = {1, 2, 3, 4, 5};
int sum = ___;
for (___ n ___ nums) {
    sum ___ n;
}`,
        blanks: [
            { id: '1', position: 48, answer: '0', hint: 'Initial value', length: 1 },
            { id: '2', position: 58, answer: 'int', hint: 'Element type', length: 3 },
            { id: '3', position: 64, answer: ':', hint: 'Range-based for', length: 1 },
            { id: '4', position: 82, answer: '+=', hint: 'Add to sum', length: 2 }
        ],
        language: 'cpp'
    }
];

// ============================================================================
// GO EXAMPLES
// ============================================================================
const goFaded: FadedExample[] = [
    {
        title: "Slice Operations",
        description: "Complete slice operations",
        fullCode: `nums := []int{1, 2, 3, 4, 5}
nums = append(nums, 6)
length := len(nums)`,
        template: `nums ___ []int{1, 2, 3, 4, 5}
nums = ___(nums, 6)
length := ___(nums)`,
        blanks: [
            { id: '1', position: 5, answer: ':=', hint: 'Short declaration', length: 2 },
            { id: '2', position: 38, answer: 'append', hint: 'Add to slice', length: 6 },
            { id: '3', position: 62, answer: 'len', hint: 'Get length', length: 3 }
        ],
        language: 'go'
    },
    {
        title: "Error Handling",
        description: "Complete error handling",
        fullCode: `data, err := ioutil.ReadFile("file.txt")
if err != nil {
    return err
}`,
        template: `data, ___ := ioutil.ReadFile("file.txt")
if err ___ nil {
    ___ err
}`,
        blanks: [
            { id: '1', position: 6, answer: 'err', hint: 'Error variable', length: 3 },
            { id: '2', position: 52, answer: '!=', hint: 'Not equal check', length: 2 },
            { id: '3', position: 68, answer: 'return', hint: 'Return error', length: 6 }
        ],
        language: 'go'
    }
];

// ============================================================================
// RUST EXAMPLES
// ============================================================================
const rustFaded: FadedExample[] = [
    {
        title: "Vector Operations",
        description: "Complete vector operations",
        fullCode: `let mut nums: Vec<i32> = vec![1, 2, 3, 4, 5];
nums.push(6);
let len = nums.len();`,
        template: `let ___ nums: Vec<___> = vec![1, 2, 3, 4, 5];
nums.___(6);
let len = nums.___();`,
        blanks: [
            { id: '1', position: 4, answer: 'mut', hint: 'Mutable keyword', length: 3 },
            { id: '2', position: 18, answer: 'i32', hint: '32-bit integer', length: 3 },
            { id: '3', position: 52, answer: 'push', hint: 'Add to vector', length: 4 },
            { id: '4', position: 73, answer: 'len', hint: 'Get length', length: 3 }
        ],
        language: 'rust'
    },
    {
        title: "Option Handling",
        description: "Complete Option handling",
        fullCode: `let maybe: Option<i32> = Some(42);
let value = maybe.unwrap_or(0);`,
        template: `let maybe: ___<i32> = ___(42);
let value = maybe.___or(0);`,
        blanks: [
            { id: '1', position: 11, answer: 'Option', hint: 'Optional type', length: 6 },
            { id: '2', position: 24, answer: 'Some', hint: 'Has value', length: 4 },
            { id: '3', position: 53, answer: 'unwrap_', hint: 'Unwrap with default', length: 7 }
        ],
        language: 'rust'
    }
];

// Export all faded examples
export const FADED_EXAMPLES: Record<string, FadedExample[]> = {
    python: pythonFaded,
    javascript: javascriptFaded,
    typescript: typescriptFaded,
    java: javaFaded,
    cpp: cppFaded,
    go: goFaded,
    rust: rustFaded
};

export function getRandomFadedExample(language: string): FadedExample {
    const examples = FADED_EXAMPLES[language] || FADED_EXAMPLES.python;
    return examples[Math.floor(Math.random() * examples.length)];
}
