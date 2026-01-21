// Code Surgery Hardcoded Examples
// Language-specific examples for each supported language

export interface SurgeryExample {
    title: string;
    description: string;
    buggyCode: string;
    correctCode: string;
    bugs: Array<{
        lineNumber: number;
        bugType: 'logic' | 'off-by-one' | 'missing-check' | 'wrong-operator' | 'syntax';
        description: string;
        hint: string;
        fix: string;
    }>;
    language: string;
}

// ============================================================================
// PYTHON EXAMPLES
// ============================================================================
const pythonSurgery: SurgeryExample[] = [
    {
        title: "Binary Search Bug",
        description: "Find bugs in binary search implementation",
        buggyCode: `def binary_search(arr, target):
    left = 0
    right = len(arr)
    while left < right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid
        else:
            right = mid
    return -1`,
        correctCode: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
        bugs: [
            { lineNumber: 3, bugType: 'off-by-one', description: 'right should be len(arr) - 1', hint: 'Array indices are 0 to len-1', fix: 'right = len(arr) - 1' },
            { lineNumber: 9, bugType: 'logic', description: 'left = mid causes infinite loop', hint: 'Need to move past mid', fix: 'left = mid + 1' }
        ],
        language: 'python'
    },
    {
        title: "Find Maximum Bug",
        description: "Find the maximum value in a list",
        buggyCode: `def find_max(arr):
    max_val = 0
    for i in range(len(arr)):
        if arr[i] >= max_val:
            max_val = arr[i]
    return max_val`,
        correctCode: `def find_max(arr):
    if not arr:
        return None
    max_val = arr[0]
    for i in range(1, len(arr)):
        if arr[i] > max_val:
            max_val = arr[i]
    return max_val`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'Initializing to 0 fails for all-negative arrays', hint: 'What if all numbers are negative?', fix: 'max_val = arr[0]' }
        ],
        language: 'python'
    },
    {
        title: "Sum Nested Array",
        description: "Sum all elements in nested array",
        buggyCode: `def sum_nested(arr):
    total = 0
    for item in arr:
        if type(item) == list:
            total += sum_nested(item)
        total += item
    return total`,
        correctCode: `def sum_nested(arr):
    total = 0
    for item in arr:
        if isinstance(item, list):
            total += sum_nested(item)
        else:
            total += item
    return total`,
        bugs: [
            { lineNumber: 6, bugType: 'logic', description: 'Missing else: adds items twice when not a list', hint: 'Should only add item if not a list', fix: 'else: total += item' }
        ],
        language: 'python'
    },
    {
        title: "Factorial Bug",
        description: "Calculate factorial of n",
        buggyCode: `def factorial(n):
    result = 0
    for i in range(1, n):
        result *= i
    return result`,
        correctCode: `def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'result should start at 1, not 0', hint: 'What happens when you multiply by 0?', fix: 'result = 1' },
            { lineNumber: 3, bugType: 'off-by-one', description: 'range should include n', hint: 'range(1, n) excludes n', fix: 'range(1, n + 1)' }
        ],
        language: 'python'
    },
    {
        title: "Reverse String Bug",
        description: "Reverse a string",
        buggyCode: `def reverse_string(s):
    result = ""
    for i in range(len(s)):
        result = s[i] + result
    return s`,
        correctCode: `def reverse_string(s):
    result = ""
    for i in range(len(s)):
        result = s[i] + result
    return result`,
        bugs: [
            { lineNumber: 5, bugType: 'logic', description: 'Returns original string s instead of result', hint: 'Check what variable is returned', fix: 'return result' }
        ],
        language: 'python'
    }
];

// ============================================================================
// JAVASCRIPT EXAMPLES
// ============================================================================
const javascriptSurgery: SurgeryExample[] = [
    {
        title: "Binary Search Bug",
        description: "Find bugs in binary search implementation",
        buggyCode: `function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length;
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid;
        else right = mid;
    }
    return -1;
}`,
        correctCode: `function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        bugs: [
            { lineNumber: 3, bugType: 'off-by-one', description: 'right should be arr.length - 1', hint: 'Array indices are 0 to length-1', fix: 'right = arr.length - 1' },
            { lineNumber: 7, bugType: 'logic', description: 'left = mid causes infinite loop', hint: 'Need to move past mid', fix: 'left = mid + 1' }
        ],
        language: 'javascript'
    },
    {
        title: "Find Maximum Bug",
        description: "Find the maximum value in array",
        buggyCode: `function findMax(arr) {
    let max = 0;
    for (let i = 0; i <= arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}`,
        correctCode: `function findMax(arr) {
    if (arr.length === 0) return undefined;
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'Initializing to 0 fails for all-negative arrays', hint: 'What if all numbers are negative?', fix: 'max = arr[0]' },
            { lineNumber: 3, bugType: 'off-by-one', description: 'i <= arr.length causes array out of bounds', hint: 'Array indices go up to length - 1', fix: 'i < arr.length' }
        ],
        language: 'javascript'
    },
    {
        title: "Sum Nested Array",
        description: "Sum all elements in nested array",
        buggyCode: `function sumNested(arr) {
    let total = 0;
    for (const item of arr) {
        if (Array.isArray(item)) {
            total += sumNested(item);
        }
        total += item;
    }
    return total;
}`,
        correctCode: `function sumNested(arr) {
    let total = 0;
    for (const item of arr) {
        if (Array.isArray(item)) {
            total += sumNested(item);
        } else {
            total += item;
        }
    }
    return total;
}`,
        bugs: [
            { lineNumber: 7, bugType: 'logic', description: 'Missing else: adds items twice when not array', hint: 'Should only add if not array', fix: 'else { total += item; }' }
        ],
        language: 'javascript'
    },
    {
        title: "Factorial Bug",
        description: "Calculate factorial of n",
        buggyCode: `function factorial(n) {
    let result = 0;
    for (let i = 1; i < n; i++) {
        result *= i;
    }
    return result;
}`,
        correctCode: `function factorial(n) {
    let result = 1;
    for (let i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'result should start at 1, not 0', hint: '0 * anything = 0', fix: 'result = 1' },
            { lineNumber: 3, bugType: 'off-by-one', description: 'Loop should include n', hint: 'i < n excludes n', fix: 'i <= n' }
        ],
        language: 'javascript'
    },
    {
        title: "Async Fetch Bug",
        description: "Fetch data with proper error handling",
        buggyCode: `async function fetchData(url) {
    const response = fetch(url);
    if (response.ok) {
        return response.json();
    }
    throw new Error('Failed');
}`,
        correctCode: `async function fetchData(url) {
    const response = await fetch(url);
    if (response.ok) {
        return await response.json();
    }
    throw new Error('Failed');
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'Missing await for fetch promise', hint: 'fetch returns a Promise', fix: 'await fetch(url)' },
            { lineNumber: 4, bugType: 'logic', description: 'Missing await for json() promise', hint: '.json() also returns a Promise', fix: 'await response.json()' }
        ],
        language: 'javascript'
    }
];

// ============================================================================
// JAVA EXAMPLES
// ============================================================================
const javaSurgery: SurgeryExample[] = [
    {
        title: "Binary Search Bug",
        description: "Find bugs in binary search implementation",
        buggyCode: `public int binarySearch(int[] arr, int target) {
    int left = 0;
    int right = arr.length;
    while (left < right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid;
        else right = mid;
    }
    return -1;
}`,
        correctCode: `public int binarySearch(int[] arr, int target) {
    int left = 0;
    int right = arr.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        bugs: [
            { lineNumber: 3, bugType: 'off-by-one', description: 'right should be arr.length - 1', hint: 'Array indices are 0 to length-1', fix: 'right = arr.length - 1' },
            { lineNumber: 5, bugType: 'logic', description: 'Integer overflow possible with (left + right)', hint: 'What if left + right overflows?', fix: 'left + (right - left) / 2' }
        ],
        language: 'java'
    },
    {
        title: "Find Maximum Bug",
        description: "Find the maximum value in array",
        buggyCode: `public int findMax(int[] arr) {
    int max = 0;
    for (int i = 0; i <= arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}`,
        correctCode: `public int findMax(int[] arr) {
    if (arr.length == 0) throw new IllegalArgumentException();
    int max = arr[0];
    for (int i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'Initializing to 0 fails for negative arrays', hint: 'What if all numbers are negative?', fix: 'max = arr[0]' },
            { lineNumber: 3, bugType: 'off-by-one', description: 'i <= arr.length causes ArrayIndexOutOfBoundsException', hint: 'Array indices go up to length - 1', fix: 'i < arr.length' }
        ],
        language: 'java'
    },
    {
        title: "String Equals Bug",
        description: "Compare two strings correctly",
        buggyCode: `public boolean areEqual(String a, String b) {
    if (a == b) {
        return true;
    }
    return false;
}`,
        correctCode: `public boolean areEqual(String a, String b) {
    if (a == null || b == null) {
        return a == b;
    }
    return a.equals(b);
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: '== compares references, not content', hint: 'In Java, == checks if same object', fix: 'a.equals(b)' }
        ],
        language: 'java'
    },
    {
        title: "ArrayList Remove Bug",
        description: "Remove elements while iterating",
        buggyCode: `public void removeEvens(ArrayList<Integer> list) {
    for (int i = 0; i < list.size(); i++) {
        if (list.get(i) % 2 == 0) {
            list.remove(i);
        }
    }
}`,
        correctCode: `public void removeEvens(ArrayList<Integer> list) {
    for (int i = list.size() - 1; i >= 0; i--) {
        if (list.get(i) % 2 == 0) {
            list.remove(i);
        }
    }
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'Forward iteration skips elements after remove', hint: 'List shrinks when you remove', fix: 'Iterate backwards' }
        ],
        language: 'java'
    },
    {
        title: "Factorial Integer Overflow",
        description: "Calculate factorial safely",
        buggyCode: `public int factorial(int n) {
    int result = 0;
    for (int i = 1; i < n; i++) {
        result *= i;
    }
    return result;
}`,
        correctCode: `public long factorial(int n) {
    long result = 1;
    for (int i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'result should start at 1, not 0', hint: '0 * anything = 0', fix: 'result = 1' },
            { lineNumber: 3, bugType: 'off-by-one', description: 'Loop should include n', hint: 'i < n excludes n', fix: 'i <= n' }
        ],
        language: 'java'
    }
];

// ============================================================================
// TYPESCRIPT EXAMPLES
// ============================================================================
const typescriptSurgery: SurgeryExample[] = [
    {
        title: "Binary Search Bug",
        description: "Find bugs in binary search implementation",
        buggyCode: `function binarySearch(arr: number[], target: number): number {
    let left = 0;
    let right = arr.length;
    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid;
        else right = mid;
    }
    return -1;
}`,
        correctCode: `function binarySearch(arr: number[], target: number): number {
    let left = 0;
    let right = arr.length - 1;
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        bugs: [
            { lineNumber: 3, bugType: 'off-by-one', description: 'right should be arr.length - 1', hint: 'Array indices are 0 to length-1', fix: 'right = arr.length - 1' },
            { lineNumber: 7, bugType: 'logic', description: 'left = mid causes infinite loop', hint: 'Need to move past mid', fix: 'left = mid + 1' }
        ],
        language: 'typescript'
    },
    {
        title: "Type Guard Bug",
        description: "Proper type narrowing",
        buggyCode: `interface User { name: string; age: number; }
interface Admin { name: string; role: string; }

function greet(person: User | Admin): string {
    if (person.role) {
        return \`Admin \${person.name}\`;
    }
    return \`User \${person.name}\`;
}`,
        correctCode: `interface User { name: string; age: number; }
interface Admin { name: string; role: string; }

function greet(person: User | Admin): string {
    if ('role' in person) {
        return \`Admin \${person.name}\`;
    }
    return \`User \${person.name}\`;
}`,
        bugs: [
            { lineNumber: 5, bugType: 'logic', description: 'Accessing role without type guard causes error', hint: 'Use "in" operator for type narrowing', fix: "'role' in person" }
        ],
        language: 'typescript'
    },
    {
        title: "Optional Chaining Bug",
        description: "Handle nested optional properties",
        buggyCode: `interface Config {
    settings?: { theme?: string };
}

function getTheme(config: Config): string {
    return config.settings.theme || 'dark';
}`,
        correctCode: `interface Config {
    settings?: { theme?: string };
}

function getTheme(config: Config): string {
    return config.settings?.theme ?? 'dark';
}`,
        bugs: [
            { lineNumber: 6, bugType: 'missing-check', description: 'settings may be undefined, will crash', hint: 'Use optional chaining ?.', fix: 'config.settings?.theme' }
        ],
        language: 'typescript'
    },
    {
        title: "Generic Function Bug",
        description: "Proper generic constraint",
        buggyCode: `function getFirst<T>(arr: T[]): T {
    return arr[0];
}

const result = getFirst([]);`,
        correctCode: `function getFirst<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    return arr[0];
}

const result = getFirst([]);`,
        bugs: [
            { lineNumber: 1, bugType: 'missing-check', description: 'Return type should handle empty array', hint: 'What if array is empty?', fix: 'T | undefined' }
        ],
        language: 'typescript'
    },
    {
        title: "Async/Await Type Bug",
        description: "Handle async function return types",
        buggyCode: `async function fetchUser(id: number) {
    const response = fetch(\`/api/users/\${id}\`);
    const data = response.json();
    return data;
}`,
        correctCode: `async function fetchUser(id: number): Promise<User> {
    const response = await fetch(\`/api/users/\${id}\`);
    const data = await response.json();
    return data;
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'Missing await for fetch promise', hint: 'fetch returns a Promise', fix: 'await fetch(...)' },
            { lineNumber: 3, bugType: 'logic', description: 'Missing await for json() promise', hint: '.json() returns a Promise', fix: 'await response.json()' }
        ],
        language: 'typescript'
    }
];

// ============================================================================
// C++ EXAMPLES
// ============================================================================
const cppSurgery: SurgeryExample[] = [
    {
        title: "Binary Search Bug",
        description: "Find bugs in binary search implementation",
        buggyCode: `int binarySearch(vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size();
    while (left < right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid;
        else right = mid;
    }
    return -1;
}`,
        correctCode: `int binarySearch(vector<int>& arr, int target) {
    int left = 0;
    int right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
        bugs: [
            { lineNumber: 3, bugType: 'off-by-one', description: 'right should be arr.size() - 1', hint: 'Vector indices are 0 to size-1', fix: 'right = arr.size() - 1' },
            { lineNumber: 7, bugType: 'logic', description: 'left = mid causes infinite loop', hint: 'Need to move past mid', fix: 'left = mid + 1' }
        ],
        language: 'cpp'
    },
    {
        title: "Memory Leak Bug",
        description: "Prevent memory leaks with new/delete",
        buggyCode: `void processData() {
    int* arr = new int[100];
    if (someCondition()) {
        return;
    }
    delete[] arr;
}`,
        correctCode: `void processData() {
    unique_ptr<int[]> arr = make_unique<int[]>(100);
    if (someCondition()) {
        return;
    }
    // Automatically deleted
}`,
        bugs: [
            { lineNumber: 4, bugType: 'logic', description: 'Early return causes memory leak', hint: 'delete[] never called on early return', fix: 'Use smart pointer' }
        ],
        language: 'cpp'
    },
    {
        title: "Iterator Invalidation",
        description: "Safe iteration while modifying",
        buggyCode: `void removeEvens(vector<int>& v) {
    for (auto it = v.begin(); it != v.end(); ++it) {
        if (*it % 2 == 0) {
            v.erase(it);
        }
    }
}`,
        correctCode: `void removeEvens(vector<int>& v) {
    for (auto it = v.begin(); it != v.end(); ) {
        if (*it % 2 == 0) {
            it = v.erase(it);
        } else {
            ++it;
        }
    }
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: '++it after erase() uses invalid iterator', hint: 'erase() invalidates iterator', fix: 'it = v.erase(it)' }
        ],
        language: 'cpp'
    },
    {
        title: "Find Maximum Bug",
        description: "Find the maximum value in array",
        buggyCode: `int findMax(const vector<int>& arr) {
    int maxVal = 0;
    for (size_t i = 0; i < arr.size(); i++) {
        if (arr[i] >= maxVal) {
            maxVal = arr[i];
        }
    }
    return maxVal;
}`,
        correctCode: `int findMax(const vector<int>& arr) {
    if (arr.empty()) throw runtime_error("Empty array");
    int maxVal = arr[0];
    for (size_t i = 1; i < arr.size(); i++) {
        if (arr[i] > maxVal) {
            maxVal = arr[i];
        }
    }
    return maxVal;
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'Initializing to 0 fails for all-negative arrays', hint: 'What if all numbers are negative?', fix: 'maxVal = arr[0] after empty check' }
        ],
        language: 'cpp'
    },
    {
        title: "String Comparison Bug",
        description: "Correct C-string comparison",
        buggyCode: `bool areEqual(const char* a, const char* b) {
    if (a == b) {
        return true;
    }
    return false;
}`,
        correctCode: `bool areEqual(const char* a, const char* b) {
    if (a == nullptr || b == nullptr) {
        return a == b;
    }
    return strcmp(a, b) == 0;
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: '== compares pointers, not string content', hint: 'Use strcmp for C-strings', fix: 'strcmp(a, b) == 0' }
        ],
        language: 'cpp'
    }
];

// ============================================================================
// GO EXAMPLES
// ============================================================================
const goSurgery: SurgeryExample[] = [
    {
        title: "Slice Append Bug",
        description: "Understanding slice behavior",
        buggyCode: `func appendToSlice(s []int, val int) {
    s = append(s, val)
}

func main() {
    nums := []int{1, 2, 3}
    appendToSlice(nums, 4)
    fmt.Println(nums)
}`,
        correctCode: `func appendToSlice(s []int, val int) []int {
    return append(s, val)
}

func main() {
    nums := []int{1, 2, 3}
    nums = appendToSlice(nums, 4)
    fmt.Println(nums)
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'Slice header is passed by value', hint: 'append creates new backing array', fix: 'Return the new slice' }
        ],
        language: 'go'
    },
    {
        title: "Range Loop Variable Bug",
        description: "Common goroutine closure bug",
        buggyCode: `func startWorkers(ids []int) {
    for _, id := range ids {
        go func() {
            fmt.Println(id)
        }()
    }
}`,
        correctCode: `func startWorkers(ids []int) {
    for _, id := range ids {
        go func(id int) {
            fmt.Println(id)
        }(id)
    }
}`,
        bugs: [
            { lineNumber: 3, bugType: 'logic', description: 'Closure captures loop variable by reference', hint: 'All goroutines see same id', fix: 'Pass id as function argument' }
        ],
        language: 'go'
    },
    {
        title: "Error Handling Bug",
        description: "Proper error checking",
        buggyCode: `func readFile(path string) string {
    data, _ := ioutil.ReadFile(path)
    return string(data)
}`,
        correctCode: `func readFile(path string) (string, error) {
    data, err := ioutil.ReadFile(path)
    if err != nil {
        return "", err
    }
    return string(data), nil
}`,
        bugs: [
            { lineNumber: 2, bugType: 'missing-check', description: 'Error is ignored with blank identifier', hint: 'Always check errors in Go', fix: 'Handle the error' }
        ],
        language: 'go'
    },
    {
        title: "Nil Map Bug",
        description: "Map initialization before use",
        buggyCode: `func countWords(words []string) map[string]int {
    var counts map[string]int
    for _, word := range words {
        counts[word]++
    }
    return counts
}`,
        correctCode: `func countWords(words []string) map[string]int {
    counts := make(map[string]int)
    for _, word := range words {
        counts[word]++
    }
    return counts
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'nil map causes panic on write', hint: 'Need to initialize map', fix: 'make(map[string]int)' }
        ],
        language: 'go'
    },
    {
        title: "Defer Order Bug",
        description: "Understanding defer execution order",
        buggyCode: `func writeFile(path string, data []byte) error {
    f, err := os.Create(path)
    if err != nil {
        return err
    }
    f.Write(data)
    defer f.Close()
    return nil
}`,
        correctCode: `func writeFile(path string, data []byte) error {
    f, err := os.Create(path)
    if err != nil {
        return err
    }
    defer f.Close()
    _, err = f.Write(data)
    return err
}`,
        bugs: [
            { lineNumber: 7, bugType: 'logic', description: 'defer after Write means panic wont close file', hint: 'Place defer right after successful open', fix: 'Move defer before Write' }
        ],
        language: 'go'
    }
];

// ============================================================================
// RUST EXAMPLES
// ============================================================================
const rustSurgery: SurgeryExample[] = [
    {
        title: "Ownership Bug",
        description: "Understanding ownership and borrowing",
        buggyCode: `fn process(s: String) {
    println!("{}", s);
}

fn main() {
    let text = String::from("hello");
    process(text);
    println!("{}", text);
}`,
        correctCode: `fn process(s: &String) {
    println!("{}", s);
}

fn main() {
    let text = String::from("hello");
    process(&text);
    println!("{}", text);
}`,
        bugs: [
            { lineNumber: 1, bugType: 'logic', description: 'Takes ownership, text is moved', hint: 'Use a reference to borrow instead', fix: 'fn process(s: &String)' }
        ],
        language: 'rust'
    },
    {
        title: "Mutable Borrow Bug",
        description: "Multiple mutable references",
        buggyCode: `fn main() {
    let mut s = String::from("hello");
    let r1 = &mut s;
    let r2 = &mut s;
    println!("{} {}", r1, r2);
}`,
        correctCode: `fn main() {
    let mut s = String::from("hello");
    {
        let r1 = &mut s;
        println!("{}", r1);
    }
    let r2 = &mut s;
    println!("{}", r2);
}`,
        bugs: [
            { lineNumber: 4, bugType: 'logic', description: 'Cannot have two mutable references', hint: 'Only one mutable borrow at a time', fix: 'Use separate scopes' }
        ],
        language: 'rust'
    },
    {
        title: "Option Unwrap Bug",
        description: "Safe Option handling",
        buggyCode: `fn find_user(id: u32) -> Option<String> {
    if id == 1 {
        Some(String::from("Alice"))
    } else {
        None
    }
}

fn main() {
    let name = find_user(2).unwrap();
    println!("{}", name);
}`,
        correctCode: `fn find_user(id: u32) -> Option<String> {
    if id == 1 {
        Some(String::from("Alice"))
    } else {
        None
    }
}

fn main() {
    match find_user(2) {
        Some(name) => println!("{}", name),
        None => println!("User not found"),
    }
}`,
        bugs: [
            { lineNumber: 10, bugType: 'logic', description: 'unwrap() on None causes panic', hint: 'Use match or unwrap_or', fix: 'Use match expression' }
        ],
        language: 'rust'
    },
    {
        title: "Result Error Handling",
        description: "Proper Result handling",
        buggyCode: `use std::fs::File;

fn read_config() -> String {
    let file = File::open("config.txt").unwrap();
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();
    contents
}`,
        correctCode: `use std::fs::File;
use std::io::Read;

fn read_config() -> Result<String, std::io::Error> {
    let mut file = File::open("config.txt")?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}`,
        bugs: [
            { lineNumber: 4, bugType: 'logic', description: 'unwrap() panics on error', hint: 'Use ? operator for error propagation', fix: 'Use ? and return Result' }
        ],
        language: 'rust'
    },
    {
        title: "Vector Index Bug",
        description: "Safe vector access",
        buggyCode: `fn get_element(v: &Vec<i32>, index: usize) -> i32 {
    v[index]
}

fn main() {
    let nums = vec![1, 2, 3];
    let val = get_element(&nums, 10);
    println!("{}", val);
}`,
        correctCode: `fn get_element(v: &Vec<i32>, index: usize) -> Option<i32> {
    v.get(index).copied()
}

fn main() {
    let nums = vec![1, 2, 3];
    match get_element(&nums, 10) {
        Some(val) => println!("{}", val),
        None => println!("Index out of bounds"),
    }
}`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'Direct index access panics on out of bounds', hint: 'Use .get() for safe access', fix: 'v.get(index)' }
        ],
        language: 'rust'
    }
];

// Export all surgery examples
export const SURGERY_EXAMPLES: Record<string, SurgeryExample[]> = {
    python: pythonSurgery,
    javascript: javascriptSurgery,
    typescript: typescriptSurgery,
    java: javaSurgery,
    cpp: cppSurgery,
    go: goSurgery,
    rust: rustSurgery
};

export function getRandomSurgeryExample(language: string): SurgeryExample {
    const examples = SURGERY_EXAMPLES[language] || SURGERY_EXAMPLES.python;
    return examples[Math.floor(Math.random() * examples.length)];
}
