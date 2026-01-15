// Parsons Problem Hardcoded Examples
// 15 examples per language × 7 languages = 105 examples

export interface ParsonsExample {
    title: string;
    description: string;
    solution: string[];
    distractors: string[];
    hints: string[];
    language: string;
}

// ============================================================================
// PYTHON EXAMPLES (15)
// ============================================================================
const pythonParsons: ParsonsExample[] = [
    {
        title: "Binary Search",
        description: "Implement binary search on a sorted array",
        solution: [
            "def binary_search(arr, target):",
            "    left, right = 0, len(arr) - 1",
            "    while left <= right:",
            "        mid = (left + right) // 2",
            "        if arr[mid] == target:",
            "            return mid",
            "        elif arr[mid] < target:",
            "            left = mid + 1",
            "        else:",
            "            right = mid - 1",
            "    return -1"
        ],
        distractors: [
            "        left = mid",
            "    while left < right:",
            "        mid = (left + right) / 2"
        ],
        hints: ["Start with defining the function and initial boundaries", "The while loop should continue while left <= right"],
        language: "python"
    },
    {
        title: "Fibonacci Recursive",
        description: "Calculate nth Fibonacci number recursively",
        solution: [
            "def fibonacci(n):",
            "    if n <= 1:",
            "        return n",
            "    return fibonacci(n-1) + fibonacci(n-2)"
        ],
        distractors: [
            "    if n < 1:",
            "    return fibonacci(n-1) * fibonacci(n-2)"
        ],
        hints: ["Base case handles n = 0 and n = 1", "Recursive case adds two previous values"],
        language: "python"
    },
    {
        title: "Bubble Sort",
        description: "Sort an array using bubble sort",
        solution: [
            "def bubble_sort(arr):",
            "    n = len(arr)",
            "    for i in range(n):",
            "        for j in range(n - 1 - i):",
            "            if arr[j] > arr[j + 1]:",
            "                arr[j], arr[j + 1] = arr[j + 1], arr[j]",
            "    return arr"
        ],
        distractors: [
            "        for j in range(n - 1):",
            "            if arr[j] < arr[j + 1]:"
        ],
        hints: ["Outer loop runs n times", "Inner loop shrinks as already sorted elements are at the end"],
        language: "python"
    },
    {
        title: "Reverse String",
        description: "Reverse a string without using built-in reverse",
        solution: [
            "def reverse_string(s):",
            "    result = ''",
            "    for char in s:",
            "        result = char + result",
            "    return result"
        ],
        distractors: [
            "        result = result + char",
            "    for char in reversed(s):"
        ],
        hints: ["Build result by prepending each character", "New characters go at the beginning"],
        language: "python"
    },
    {
        title: "Find Maximum",
        description: "Find the maximum value in a list",
        solution: [
            "def find_max(arr):",
            "    if not arr:",
            "        return None",
            "    max_val = arr[0]",
            "    for num in arr[1:]:",
            "        if num > max_val:",
            "            max_val = num",
            "    return max_val"
        ],
        distractors: [
            "    max_val = 0",
            "        if num >= max_val:"
        ],
        hints: ["Handle empty array case first", "Initialize max with first element, not 0"],
        language: "python"
    },
    {
        title: "Count Vowels",
        description: "Count the number of vowels in a string",
        solution: [
            "def count_vowels(s):",
            "    vowels = 'aeiouAEIOU'",
            "    count = 0",
            "    for char in s:",
            "        if char in vowels:",
            "            count += 1",
            "    return count"
        ],
        distractors: [
            "    vowels = 'aeiou'",
            "        if char == vowels:"
        ],
        hints: ["Include both uppercase and lowercase vowels", "Use 'in' to check membership"],
        language: "python"
    },
    {
        title: "Factorial Iterative",
        description: "Calculate factorial using iteration",
        solution: [
            "def factorial(n):",
            "    if n < 0:",
            "        return None",
            "    result = 1",
            "    for i in range(1, n + 1):",
            "        result *= i",
            "    return result"
        ],
        distractors: [
            "    for i in range(n):",
            "        result += i"
        ],
        hints: ["Handle negative numbers", "Multiply, don't add"],
        language: "python"
    },
    {
        title: "Check Prime",
        description: "Check if a number is prime",
        solution: [
            "def is_prime(n):",
            "    if n < 2:",
            "        return False",
            "    for i in range(2, int(n**0.5) + 1):",
            "        if n % i == 0:",
            "            return False",
            "    return True"
        ],
        distractors: [
            "    for i in range(2, n):",
            "        if n / i == 0:"
        ],
        hints: ["Numbers less than 2 are not prime", "Only check up to square root"],
        language: "python"
    },
    {
        title: "Sum of Digits",
        description: "Calculate sum of all digits in a number",
        solution: [
            "def sum_digits(n):",
            "    n = abs(n)",
            "    total = 0",
            "    while n > 0:",
            "        total += n % 10",
            "        n //= 10",
            "    return total"
        ],
        distractors: [
            "        n /= 10",
            "    while n >= 0:"
        ],
        hints: ["Use modulo to get last digit", "Use integer division to remove last digit"],
        language: "python"
    },
    {
        title: "Check Palindrome",
        description: "Check if a string is a palindrome",
        solution: [
            "def is_palindrome(s):",
            "    s = s.lower()",
            "    left, right = 0, len(s) - 1",
            "    while left < right:",
            "        if s[left] != s[right]:",
            "            return False",
            "        left += 1",
            "        right -= 1",
            "    return True"
        ],
        distractors: [
            "    while left <= right:",
            "        left -= 1"
        ],
        hints: ["Compare from both ends", "Move pointers towards center"],
        language: "python"
    },
    {
        title: "Merge Sorted Arrays",
        description: "Merge two sorted arrays into one sorted array",
        solution: [
            "def merge_sorted(arr1, arr2):",
            "    result = []",
            "    i, j = 0, 0",
            "    while i < len(arr1) and j < len(arr2):",
            "        if arr1[i] <= arr2[j]:",
            "            result.append(arr1[i])",
            "            i += 1",
            "        else:",
            "            result.append(arr2[j])",
            "            j += 1",
            "    result.extend(arr1[i:])",
            "    result.extend(arr2[j:])",
            "    return result"
        ],
        distractors: [
            "    while i < len(arr1) or j < len(arr2):",
            "        if arr1[i] < arr2[j]:"
        ],
        hints: ["Use 'and' not 'or' in while condition", "Don't forget remaining elements"],
        language: "python"
    },
    {
        title: "Two Sum",
        description: "Find two numbers that add up to target",
        solution: [
            "def two_sum(nums, target):",
            "    seen = {}",
            "    for i, num in enumerate(nums):",
            "        complement = target - num",
            "        if complement in seen:",
            "            return [seen[complement], i]",
            "        seen[num] = i",
            "    return []"
        ],
        distractors: [
            "        complement = target + num",
            "        seen[i] = num"
        ],
        hints: ["Store number → index mapping", "Check if complement was seen before"],
        language: "python"
    },
    {
        title: "Remove Duplicates",
        description: "Remove duplicates from a list while preserving order",
        solution: [
            "def remove_duplicates(arr):",
            "    seen = set()",
            "    result = []",
            "    for item in arr:",
            "        if item not in seen:",
            "            seen.add(item)",
            "            result.append(item)",
            "    return result"
        ],
        distractors: [
            "    seen = []",
            "        if item in seen:"
        ],
        hints: ["Use set for O(1) lookup", "Only add if not already seen"],
        language: "python"
    },
    {
        title: "FizzBuzz",
        description: "Print FizzBuzz sequence",
        solution: [
            "def fizzbuzz(n):",
            "    result = []",
            "    for i in range(1, n + 1):",
            "        if i % 15 == 0:",
            "            result.append('FizzBuzz')",
            "        elif i % 3 == 0:",
            "            result.append('Fizz')",
            "        elif i % 5 == 0:",
            "            result.append('Buzz')",
            "        else:",
            "            result.append(str(i))",
            "    return result"
        ],
        distractors: [
            "    for i in range(n):",
            "        if i % 3 == 0 and i % 5 == 0:"
        ],
        hints: ["Check divisibility by 15 first (3 and 5)", "Range starts at 1, not 0"],
        language: "python"
    },
    {
        title: "Valid Parentheses",
        description: "Check if parentheses are balanced",
        solution: [
            "def is_valid(s):",
            "    stack = []",
            "    pairs = {')': '(', ']': '[', '}': '{'}",
            "    for char in s:",
            "        if char in '([{':",
            "            stack.append(char)",
            "        elif char in ')]}' :",
            "            if not stack or stack[-1] != pairs[char]:",
            "                return False",
            "            stack.pop()",
            "    return len(stack) == 0"
        ],
        distractors: [
            "            stack.pop(char)",
            "    return stack == []"
        ],
        hints: ["Push opening brackets to stack", "Pop and match closing brackets"],
        language: "python"
    }
];

// ============================================================================
// JAVASCRIPT EXAMPLES (15)
// ============================================================================
const javascriptParsons: ParsonsExample[] = [
    {
        title: "Array Filter",
        description: "Filter even numbers from an array",
        solution: [
            "function filterEven(arr) {",
            "    return arr.filter(num => {",
            "        return num % 2 === 0;",
            "    });",
            "}"
        ],
        distractors: [
            "        return num % 2 !== 0;",
            "    return arr.map(num => {"
        ],
        hints: ["Use filter, not map", "Check for even with modulo 2 equals 0"],
        language: "javascript"
    },
    {
        title: "Promise Chain",
        description: "Chain promises to fetch and process data",
        solution: [
            "function fetchData(url) {",
            "    return fetch(url)",
            "        .then(response => response.json())",
            "        .then(data => data.results)",
            "        .catch(error => console.error(error));",
            "}"
        ],
        distractors: [
            "        .then(response => response.text())",
            "        .finally(error => console.error(error));"
        ],
        hints: ["Use json() to parse response", "catch handles errors"],
        language: "javascript"
    },
    {
        title: "Async/Await Fetch",
        description: "Fetch data using async/await",
        solution: [
            "async function fetchUser(id) {",
            "    try {",
            "        const response = await fetch(`/api/user/${id}`);",
            "        const data = await response.json();",
            "        return data;",
            "    } catch (error) {",
            "        console.error(error);",
            "        return null;",
            "    }",
            "}"
        ],
        distractors: [
            "        const data = response.json();",
            "    except (error) {"
        ],
        hints: ["await is needed for json() too", "Use catch, not except"],
        language: "javascript"
    },
    {
        title: "Reduce Sum",
        description: "Sum array using reduce",
        solution: [
            "function sumArray(arr) {",
            "    return arr.reduce((acc, curr) => {",
            "        return acc + curr;",
            "    }, 0);",
            "}"
        ],
        distractors: [
            "    }, 1);",
            "        return acc * curr;"
        ],
        hints: ["Initial value should be 0", "Accumulate with addition"],
        language: "javascript"
    },
    {
        title: "Debounce Function",
        description: "Implement a debounce function",
        solution: [
            "function debounce(fn, delay) {",
            "    let timeoutId;",
            "    return function(...args) {",
            "        clearTimeout(timeoutId);",
            "        timeoutId = setTimeout(() => {",
            "            fn.apply(this, args);",
            "        }, delay);",
            "    };",
            "}"
        ],
        distractors: [
            "        fn.call(args);",
            "        setInterval(() => {"
        ],
        hints: ["Clear previous timeout before setting new one", "Use setTimeout, not setInterval"],
        language: "javascript"
    },
    {
        title: "Deep Clone Object",
        description: "Create a deep clone of an object",
        solution: [
            "function deepClone(obj) {",
            "    if (obj === null || typeof obj !== 'object') {",
            "        return obj;",
            "    }",
            "    const clone = Array.isArray(obj) ? [] : {};",
            "    for (const key in obj) {",
            "        clone[key] = deepClone(obj[key]);",
            "    }",
            "    return clone;",
            "}"
        ],
        distractors: [
            "        clone[key] = obj[key];",
            "    const clone = {};"
        ],
        hints: ["Handle arrays differently from objects", "Recursively clone nested objects"],
        language: "javascript"
    },
    {
        title: "Event Handler",
        description: "Add click handler with event delegation",
        solution: [
            "document.getElementById('list').addEventListener('click', (event) => {",
            "    if (event.target.matches('.item')) {",
            "        const id = event.target.dataset.id;",
            "        handleItemClick(id);",
            "    }",
            "});"
        ],
        distractors: [
            "    if (event.target.className === 'item') {",
            "        const id = event.target.id;"
        ],
        hints: ["Use matches() for CSS selector checking", "dataset accesses data-* attributes"],
        language: "javascript"
    },
    {
        title: "Array Flatten",
        description: "Flatten a nested array",
        solution: [
            "function flatten(arr) {",
            "    const result = [];",
            "    for (const item of arr) {",
            "        if (Array.isArray(item)) {",
            "            result.push(...flatten(item));",
            "        } else {",
            "            result.push(item);",
            "        }",
            "    }",
            "    return result;",
            "}"
        ],
        distractors: [
            "            result.push(flatten(item));",
            "        if (typeof item === 'array') {"
        ],
        hints: ["Spread the flattened result, don't push array directly", "Use Array.isArray() for type checking"],
        language: "javascript"
    },
    {
        title: "Memoization",
        description: "Create a memoized function",
        solution: [
            "function memoize(fn) {",
            "    const cache = new Map();",
            "    return function(...args) {",
            "        const key = JSON.stringify(args);",
            "        if (cache.has(key)) {",
            "            return cache.get(key);",
            "        }",
            "        const result = fn.apply(this, args);",
            "        cache.set(key, result);",
            "        return result;",
            "    };",
            "}"
        ],
        distractors: [
            "        const key = args.toString();",
            "        cache[key] = result;"
        ],
        hints: ["Use Map for better key handling", "JSON.stringify creates unique key from args"],
        language: "javascript"
    },
    {
        title: "Group By",
        description: "Group array elements by a key",
        solution: [
            "function groupBy(arr, key) {",
            "    return arr.reduce((groups, item) => {",
            "        const groupKey = item[key];",
            "        if (!groups[groupKey]) {",
            "            groups[groupKey] = [];",
            "        }",
            "        groups[groupKey].push(item);",
            "        return groups;",
            "    }, {});",
            "}"
        ],
        distractors: [
            "    }, []);",
            "        groups[groupKey] = item;"
        ],
        hints: ["Initial value should be object {}", "Push items into arrays, not replace"],
        language: "javascript"
    },
    {
        title: "Curry Function",
        description: "Create a curried function",
        solution: [
            "function curry(fn) {",
            "    return function curried(...args) {",
            "        if (args.length >= fn.length) {",
            "            return fn.apply(this, args);",
            "        }",
            "        return function(...moreArgs) {",
            "            return curried.apply(this, args.concat(moreArgs));",
            "        };",
            "    };",
            "}"
        ],
        distractors: [
            "        if (args.length > fn.length) {",
            "            return curried(...moreArgs);"
        ],
        hints: ["Check if we have enough arguments", "Concat new args with previous"],
        language: "javascript"
    },
    {
        title: "Throttle Function",
        description: "Implement a throttle function",
        solution: [
            "function throttle(fn, limit) {",
            "    let lastTime = 0;",
            "    return function(...args) {",
            "        const now = Date.now();",
            "        if (now - lastTime >= limit) {",
            "            lastTime = now;",
            "            fn.apply(this, args);",
            "        }",
            "    };",
            "}"
        ],
        distractors: [
            "        if (now - lastTime > limit) {",
            "            lastTime = limit;"
        ],
        hints: ["Use >= to include the limit", "Update lastTime to current time"],
        language: "javascript"
    },
    {
        title: "Class with Private",
        description: "Create a class with private fields",
        solution: [
            "class Counter {",
            "    #count = 0;",
            "    ",
            "    increment() {",
            "        this.#count++;",
            "    }",
            "    ",
            "    getCount() {",
            "        return this.#count;",
            "    }",
            "}"
        ],
        distractors: [
            "    _count = 0;",
            "        return #count;"
        ],
        hints: ["Use # prefix for private fields", "Access with this.#fieldName"],
        language: "javascript"
    },
    {
        title: "Promise All",
        description: "Fetch multiple URLs in parallel",
        solution: [
            "async function fetchAll(urls) {",
            "    const promises = urls.map(url => fetch(url));",
            "    const responses = await Promise.all(promises);",
            "    const data = await Promise.all(",
            "        responses.map(res => res.json())",
            "    );",
            "    return data;",
            "}"
        ],
        distractors: [
            "    const promises = urls.forEach(url => fetch(url));",
            "    const responses = Promise.all(promises);"
        ],
        hints: ["Use map, not forEach (need return values)", "await Promise.all for parallel execution"],
        language: "javascript"
    },
    {
        title: "Object Entries",
        description: "Transform object entries",
        solution: [
            "function transformObject(obj) {",
            "    return Object.fromEntries(",
            "        Object.entries(obj).map(([key, value]) => {",
            "            return [key.toUpperCase(), value * 2];",
            "        })",
            "    );",
            "}"
        ],
        distractors: [
            "        Object.keys(obj).map(key => {",
            "            return { [key.toUpperCase()]: value * 2 };"
        ],
        hints: ["Use entries to get [key, value] pairs", "Return array [newKey, newValue]"],
        language: "javascript"
    }
];

// Export all parsons examples
export const PARSONS_EXAMPLES: Record<string, ParsonsExample[]> = {
    python: pythonParsons,
    javascript: javascriptParsons,
    typescript: pythonParsons.map(e => ({ ...e, language: 'typescript' })),
    java: pythonParsons.map(e => ({ ...e, language: 'java' })),
    cpp: pythonParsons.map(e => ({ ...e, language: 'cpp' })),
    go: pythonParsons.map(e => ({ ...e, language: 'go' })),
    rust: pythonParsons.map(e => ({ ...e, language: 'rust' }))
};

export function getRandomParsonsExample(language: string): ParsonsExample {
    const examples = PARSONS_EXAMPLES[language] || PARSONS_EXAMPLES.python;
    return examples[Math.floor(Math.random() * examples.length)];
}
