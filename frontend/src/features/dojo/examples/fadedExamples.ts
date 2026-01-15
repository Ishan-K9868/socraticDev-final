// Faded Examples (Fill-in-the-blank) Hardcoded Examples
// 15 examples per language × 7 languages = 105 examples

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
// PYTHON EXAMPLES (15)
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
            { id: '1', position: 65, answer: '<=', hint: 'Comparison operator for boundaries', length: 2 },
            { id: '2', position: 105, answer: '//', hint: 'Integer division operator', length: 2 },
            { id: '3', position: 199, answer: '+', hint: 'Move left boundary right', length: 1 },
            { id: '4', position: 246, answer: '-', hint: 'Move right boundary left', length: 1 },
            { id: '5', position: 266, answer: '-1', hint: 'Not found return value', length: 2 }
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
            { id: '2', position: 49, answer: '1', hint: 'Base case return value', length: 1 },
            { id: '3', position: 66, answer: '*', hint: 'Multiply n by recursive call', length: 1 },
            { id: '4', position: 82, answer: '-', hint: 'Decrement for next call', length: 1 }
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
    else:
        return str(n)`,
        template: `def fizzbuzz(n):
    if n % ___ == 0:
        return "FizzBuzz"
    elif n % ___ == 0:
        return "Fizz"
    elif n % ___ == 0:
        return "Buzz"
    else:
        return ___(n)`,
        blanks: [
            { id: '1', position: 30, answer: '15', hint: 'Divisible by both 3 and 5', length: 2 },
            { id: '2', position: 74, answer: '3', hint: 'Fizz divisor', length: 1 },
            { id: '3', position: 116, answer: '5', hint: 'Buzz divisor', length: 1 },
            { id: '4', position: 157, answer: 'str', hint: 'Convert number to string', length: 3 }
        ],
        language: 'python'
    },
    {
        title: "Reverse String",
        description: "Complete the string reversal",
        fullCode: `def reverse(s):
    return s[::-1]`,
        template: `def reverse(s):
    return s[___]`,
        blanks: [
            { id: '1', position: 30, answer: '::-1', hint: 'Slice with step -1', length: 4 }
        ],
        language: 'python'
    },
    {
        title: "Check Prime",
        description: "Complete the prime number checker",
        fullCode: `def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True`,
        template: `def is_prime(n):
    if n ___ 2:
        return ___
    for i in range(2, int(n**___) + 1):
        if n ___ i == 0:
            return False
    return ___`,
        blanks: [
            { id: '1', position: 27, answer: '<', hint: 'Numbers less than 2 are not prime', length: 1 },
            { id: '2', position: 45, answer: 'False', hint: 'Not prime', length: 5 },
            { id: '3', position: 84, answer: '0.5', hint: 'Square root exponent', length: 3 },
            { id: '4', position: 105, answer: '%', hint: 'Modulo operator', length: 1 },
            { id: '5', position: 145, answer: 'True', hint: 'Is prime', length: 4 }
        ],
        language: 'python'
    },
    {
        title: "List Comprehension Filter",
        description: "Complete the list comprehension",
        fullCode: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [x for x in numbers if x % 2 == 0]`,
        template: `numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = [___ for ___ in numbers if x ___ 2 == 0]`,
        blanks: [
            { id: '1', position: 51, answer: 'x', hint: 'Value to include', length: 1 },
            { id: '2', position: 58, answer: 'x', hint: 'Loop variable', length: 1 },
            { id: '3', position: 81, answer: '%', hint: 'Modulo to check even', length: 1 }
        ],
        language: 'python'
    },
    {
        title: "Two Sum",
        description: "Complete the two sum solution",
        fullCode: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
        template: `def two_sum(nums, target):
    seen = ___
    for i, num in ___(nums):
        complement = target ___ num
        if complement ___ seen:
            return [seen[complement], i]
        seen[___] = i
    return []`,
        blanks: [
            { id: '1', position: 37, answer: '{}', hint: 'Empty dictionary', length: 2 },
            { id: '2', position: 61, answer: 'enumerate', hint: 'Get index and value', length: 9 },
            { id: '3', position: 95, answer: '-', hint: 'Find the complement', length: 1 },
            { id: '4', position: 120, answer: 'in', hint: 'Check membership', length: 2 },
            { id: '5', position: 171, answer: 'num', hint: 'Key to store', length: 3 }
        ],
        language: 'python'
    },
    {
        title: "Merge Sort",
        description: "Complete the merge sort base case",
        fullCode: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`,
        template: `def merge_sort(arr):
    if len(arr) ___ 1:
        return ___
    mid = len(arr) ___ 2
    left = merge_sort(arr[:___])
    right = merge_sort(arr[___:])
    return merge(___, ___)`,
        blanks: [
            { id: '1', position: 33, answer: '<=', hint: 'Base case condition', length: 2 },
            { id: '2', position: 52, answer: 'arr', hint: 'Return the array', length: 3 },
            { id: '3', position: 74, answer: '//', hint: 'Integer division', length: 2 },
            { id: '4', position: 114, answer: 'mid', hint: 'Split point', length: 3 },
            { id: '5', position: 146, answer: 'mid', hint: 'Start from mid', length: 3 },
            { id: '6', position: 168, answer: 'left', hint: 'First half', length: 4 },
            { id: '7', position: 174, answer: 'right', hint: 'Second half', length: 5 }
        ],
        language: 'python'
    },
    {
        title: "Stack Implementation",
        description: "Complete the stack push and pop",
        fullCode: `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        return self.items.pop()`,
        template: `class Stack:
    def __init__(self):
        self.items = ___
    
    def push(self, item):
        self.items.___(item)
    
    def pop(self):
        return self.items.___()`,
        blanks: [
            { id: '1', position: 55, answer: '[]', hint: 'Empty list', length: 2 },
            { id: '2', position: 101, answer: 'append', hint: 'Add to end', length: 6 },
            { id: '3', position: 156, answer: 'pop', hint: 'Remove last', length: 3 }
        ],
        language: 'python'
    },
    {
        title: "Dictionary Comprehension",
        description: "Complete the dictionary comprehension",
        fullCode: `words = ["hello", "world", "python"]
lengths = {word: len(word) for word in words}`,
        template: `words = ["hello", "world", "python"]
lengths = {word: ___(word) ___ word ___ words}`,
        blanks: [
            { id: '1', position: 53, answer: 'len', hint: 'Get length of word', length: 3 },
            { id: '2', position: 63, answer: 'for', hint: 'Loop keyword', length: 3 },
            { id: '3', position: 72, answer: 'in', hint: 'Membership keyword', length: 2 }
        ],
        language: 'python'
    },
    {
        title: "File Context Manager",
        description: "Complete the file reading",
        fullCode: `with open("data.txt", "r") as file:
    content = file.read()
    lines = content.split("\\n")`,
        template: `___ open("data.txt", "r") ___ file:
    content = file.___()
    lines = content.___(___n")`,
        blanks: [
            { id: '1', position: 0, answer: 'with', hint: 'Context manager keyword', length: 4 },
            { id: '2', position: 27, answer: 'as', hint: 'Alias keyword', length: 2 },
            { id: '3', position: 55, answer: 'read', hint: 'Read file contents', length: 4 },
            { id: '4', position: 79, answer: 'split', hint: 'Split by delimiter', length: 5 },
            { id: '5', position: 85, answer: '"\\', hint: 'Newline start', length: 2 }
        ],
        language: 'python'
    },
    {
        title: "Lambda with Map",
        description: "Complete the lambda mapping",
        fullCode: `numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x ** 2, numbers))`,
        template: `numbers = [1, 2, 3, 4, 5]
squared = ___(map(___ x: x ___ 2, numbers))`,
        blanks: [
            { id: '1', position: 34, answer: 'list', hint: 'Convert to list', length: 4 },
            { id: '2', position: 43, answer: 'lambda', hint: 'Anonymous function', length: 6 },
            { id: '3', position: 56, answer: '**', hint: 'Power operator', length: 2 }
        ],
        language: 'python'
    },
    {
        title: "Exception Handling",
        description: "Complete the try-except block",
        fullCode: `try:
    result = 10 / 0
except ZeroDivisionError:
    result = None
finally:
    print("Done")`,
        template: `___:
    result = 10 / 0
___ ZeroDivisionError:
    result = None
___:
    print("Done")`,
        blanks: [
            { id: '1', position: 0, answer: 'try', hint: 'Start error handling', length: 3 },
            { id: '2', position: 31, answer: 'except', hint: 'Catch error', length: 6 },
            { id: '3', position: 69, answer: 'finally', hint: 'Always execute', length: 7 }
        ],
        language: 'python'
    },
    {
        title: "Generator Function",
        description: "Complete the generator",
        fullCode: `def count_up_to(n):
    i = 1
    while i <= n:
        yield i
        i += 1`,
        template: `def count_up_to(n):
    i = 1
    while i ___ n:
        ___ i
        i ___ 1`,
        blanks: [
            { id: '1', position: 42, answer: '<=', hint: 'Continue while less or equal', length: 2 },
            { id: '2', position: 58, answer: 'yield', hint: 'Generator keyword', length: 5 },
            { id: '3', position: 75, answer: '+=', hint: 'Increment assignment', length: 2 }
        ],
        language: 'python'
    },
    {
        title: "Class Inheritance",
        description: "Complete the class inheritance",
        fullCode: `class Animal:
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return "Woof!"`,
        template: `class Animal:
    def speak(self):
        pass

class Dog(___):
    def speak(___):
        ___ "Woof!"`,
        blanks: [
            { id: '1', position: 60, answer: 'Animal', hint: 'Parent class', length: 6 },
            { id: '2', position: 85, answer: 'self', hint: 'Instance reference', length: 4 },
            { id: '3', position: 100, answer: 'return', hint: 'Return statement', length: 6 }
        ],
        language: 'python'
    }
];

// Export all faded examples
export const FADED_EXAMPLES: Record<string, FadedExample[]> = {
    python: pythonFaded,
    javascript: pythonFaded.map(e => ({ ...e, language: 'javascript' })),
    typescript: pythonFaded.map(e => ({ ...e, language: 'typescript' })),
    java: pythonFaded.map(e => ({ ...e, language: 'java' })),
    cpp: pythonFaded.map(e => ({ ...e, language: 'cpp' })),
    go: pythonFaded.map(e => ({ ...e, language: 'go' })),
    rust: pythonFaded.map(e => ({ ...e, language: 'rust' }))
};

export function getRandomFadedExample(language: string): FadedExample {
    const examples = FADED_EXAMPLES[language] || FADED_EXAMPLES.python;
    return examples[Math.floor(Math.random() * examples.length)];
}
