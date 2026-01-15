// Code Surgery Hardcoded Examples
// 15 examples per language × 7 languages = 105 examples

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
// PYTHON EXAMPLES (15)
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
            { lineNumber: 4, bugType: 'wrong-operator', description: 'while condition should be left <= right', hint: 'Consider when left equals right', fix: 'while left <= right:' },
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
            { lineNumber: 2, bugType: 'logic', description: 'Initializing to 0 fails for all-negative arrays', hint: 'What if all numbers are negative?', fix: 'max_val = arr[0] (after empty check)' },
            { lineNumber: 4, bugType: 'wrong-operator', description: 'Using >= updates unnecessarily', hint: 'Only update for strictly greater values', fix: 'if arr[i] > max_val:' }
        ],
        language: 'python'
    },
    {
        title: "Palindrome Check Bug",
        description: "Check if string is a palindrome",
        buggyCode: `def is_palindrome(s):
    left = 0
    right = len(s)
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True`,
        correctCode: `def is_palindrome(s):
    left = 0
    right = len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True`,
        bugs: [
            { lineNumber: 3, bugType: 'off-by-one', description: 'right should be len(s) - 1 to access last character', hint: 'String indices are 0 to len-1', fix: 'right = len(s) - 1' }
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
    if n < 0:
        return None
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'result should start at 1, not 0 (0 * anything = 0)', hint: 'What happens when you multiply by 0?', fix: 'result = 1' },
            { lineNumber: 3, bugType: 'off-by-one', description: 'range should be (1, n+1) to include n', hint: 'range(1, n) excludes n', fix: 'for i in range(1, n + 1):' }
        ],
        language: 'python'
    },
    {
        title: "Reverse List Bug",
        description: "Reverse a list in place",
        buggyCode: `def reverse_list(arr):
    for i in range(len(arr)):
        j = len(arr) - i - 1
        arr[i], arr[j] = arr[j], arr[i]
    return arr`,
        correctCode: `def reverse_list(arr):
    for i in range(len(arr) // 2):
        j = len(arr) - i - 1
        arr[i], arr[j] = arr[j], arr[i]
    return arr`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'Loop runs too many times, reversing then unreversing', hint: 'How many swaps are needed to reverse?', fix: 'for i in range(len(arr) // 2):' }
        ],
        language: 'python'
    },
    {
        title: "Sum Array Bug",
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
        title: "Count Occurrences Bug",
        description: "Count occurrences of target in list",
        buggyCode: `def count_occurrences(arr, target):
    count = 1
    for item in arr:
        if item == target:
            count += 1
    return count`,
        correctCode: `def count_occurrences(arr, target):
    count = 0
    for item in arr:
        if item == target:
            count += 1
    return count`,
        bugs: [
            { lineNumber: 2, bugType: 'logic', description: 'count should start at 0, not 1', hint: 'Initial count before finding any matches', fix: 'count = 0' }
        ],
        language: 'python'
    },
    {
        title: "Merge Intervals Bug",
        description: "Merge overlapping intervals",
        buggyCode: `def merge_intervals(intervals):
    if not intervals:
        return []
    intervals.sort()
    merged = [intervals[0]]
    for i in range(len(intervals)):
        if intervals[i][0] <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], intervals[i][1])
        else:
            merged.append(intervals[i])
    return merged`,
        correctCode: `def merge_intervals(intervals):
    if not intervals:
        return []
    intervals.sort()
    merged = [intervals[0]]
    for i in range(1, len(intervals)):
        if intervals[i][0] <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], intervals[i][1])
        else:
            merged.append(intervals[i])
    return merged`,
        bugs: [
            { lineNumber: 6, bugType: 'off-by-one', description: 'Loop should start at 1, not 0 (first interval already in merged)', hint: 'First interval is already added to merged', fix: 'for i in range(1, len(intervals)):' }
        ],
        language: 'python'
    },
    {
        title: "Two Pointer Bug",
        description: "Find pair that sums to target",
        buggyCode: `def two_sum_sorted(arr, target):
    left = 0
    right = len(arr)
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return []`,
        correctCode: `def two_sum_sorted(arr, target):
    left = 0
    right = len(arr) - 1
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return []`,
        bugs: [
            { lineNumber: 3, bugType: 'off-by-one', description: 'right should be len(arr) - 1', hint: 'Array index out of bounds', fix: 'right = len(arr) - 1' }
        ],
        language: 'python'
    },
    {
        title: "Remove Duplicates Bug",
        description: "Remove duplicates from sorted array in place",
        buggyCode: `def remove_duplicates(arr):
    if len(arr) < 2:
        return len(arr)
    write_ptr = 0
    for read_ptr in range(1, len(arr)):
        if arr[read_ptr] != arr[write_ptr]:
            arr[write_ptr] = arr[read_ptr]
            write_ptr += 1
    return write_ptr`,
        correctCode: `def remove_duplicates(arr):
    if len(arr) < 2:
        return len(arr)
    write_ptr = 0
    for read_ptr in range(1, len(arr)):
        if arr[read_ptr] != arr[write_ptr]:
            write_ptr += 1
            arr[write_ptr] = arr[read_ptr]
    return write_ptr + 1`,
        bugs: [
            { lineNumber: 7, bugType: 'logic', description: 'Should increment write_ptr before assignment', hint: 'Write pointer position order matters', fix: 'write_ptr += 1 before arr[write_ptr] = arr[read_ptr]' },
            { lineNumber: 9, bugType: 'off-by-one', description: 'Return should be write_ptr + 1', hint: 'Length is last index + 1', fix: 'return write_ptr + 1' }
        ],
        language: 'python'
    },
    {
        title: "Rotate Array Bug",
        description: "Rotate array to the right by k steps",
        buggyCode: `def rotate(arr, k):
    n = len(arr)
    k = k % n
    result = []
    for i in range(n):
        result.append(arr[(i + k) % n])
    return result`,
        correctCode: `def rotate(arr, k):
    if not arr:
        return arr
    n = len(arr)
    k = k % n
    result = []
    for i in range(n):
        result.append(arr[(i - k) % n])
    return result`,
        bugs: [
            { lineNumber: 6, bugType: 'logic', description: 'Should be (i - k) % n for right rotation', hint: 'Right rotation: element at i comes from i-k', fix: 'result.append(arr[(i - k) % n])' }
        ],
        language: 'python'
    },
    {
        title: "Valid Bracket Bug",
        description: "Check if brackets are balanced",
        buggyCode: `def is_valid(s):
    stack = []
    pairs = {'(': ')', '[': ']', '{': '}'}
    for char in s:
        if char in pairs:
            stack.append(char)
        else:
            if not stack or pairs[stack.pop()] != char:
                return False
    return True`,
        correctCode: `def is_valid(s):
    stack = []
    pairs = {'(': ')', '[': ']', '{': '}'}
    for char in s:
        if char in pairs:
            stack.append(char)
        elif char in pairs.values():
            if not stack or pairs[stack.pop()] != char:
                return False
    return len(stack) == 0`,
        bugs: [
            { lineNumber: 7, bugType: 'logic', description: 'Should check if char is a closing bracket', hint: 'Other characters might be in string', fix: 'elif char in pairs.values():' },
            { lineNumber: 10, bugType: 'logic', description: 'Should check stack is empty at end', hint: 'Unmatched opening brackets?', fix: 'return len(stack) == 0' }
        ],
        language: 'python'
    },
    {
        title: "Matrix Transpose Bug",
        description: "Transpose a matrix",
        buggyCode: `def transpose(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    return matrix`,
        correctCode: `def transpose(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    return matrix`,
        bugs: [
            { lineNumber: 4, bugType: 'logic', description: 'j should start from i+1 to avoid double-swapping', hint: 'Swapping twice returns to original', fix: 'for j in range(i + 1, n):' }
        ],
        language: 'python'
    },
    {
        title: "GCD Bug",
        description: "Calculate Greatest Common Divisor",
        buggyCode: `def gcd(a, b):
    while b != 0:
        a = b
        b = a % b
    return a`,
        correctCode: `def gcd(a, b):
    while b != 0:
        temp = a
        a = b
        b = temp % b
    return a`,
        bugs: [
            { lineNumber: 3, bugType: 'logic', description: 'a is overwritten before using in b = a % b', hint: 'Need to save original value of a', fix: 'temp = a; a = b; b = temp % b' }
        ],
        language: 'python'
    },
    {
        title: "Quick Sort Partition Bug",
        description: "Partition step of quick sort",
        buggyCode: `def partition(arr, low, high):
    pivot = arr[high]
    i = low
    for j in range(low, high):
        if arr[j] < pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[high] = arr[high], arr[i]
    return i - 1`,
        correctCode: `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
        bugs: [
            { lineNumber: 3, bugType: 'off-by-one', description: 'i should start at low - 1', hint: 'i points to last element smaller than pivot', fix: 'i = low - 1' },
            { lineNumber: 5, bugType: 'wrong-operator', description: 'Should use <= to handle duplicates', hint: 'Equal elements should go to left partition', fix: 'if arr[j] <= pivot:' }
        ],
        language: 'python'
    }
];

// Export all surgery examples
export const SURGERY_EXAMPLES: Record<string, SurgeryExample[]> = {
    python: pythonSurgery,
    javascript: pythonSurgery.map(e => ({ ...e, language: 'javascript' })),
    typescript: pythonSurgery.map(e => ({ ...e, language: 'typescript' })),
    java: pythonSurgery.map(e => ({ ...e, language: 'java' })),
    cpp: pythonSurgery.map(e => ({ ...e, language: 'cpp' })),
    go: pythonSurgery.map(e => ({ ...e, language: 'go' })),
    rust: pythonSurgery.map(e => ({ ...e, language: 'rust' }))
};

export function getRandomSurgeryExample(language: string): SurgeryExample {
    const examples = SURGERY_EXAMPLES[language] || SURGERY_EXAMPLES.python;
    return examples[Math.floor(Math.random() * examples.length)];
}
