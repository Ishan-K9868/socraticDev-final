// TDD Challenge Hardcoded Examples
// 15 Python examples with test cases

export interface TDDExample {
    title: string;
    description: string;
    functionSignature: string;
    language: string;
    testCases: Array<{
        id: string;
        description: string;
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }>;
    solution: string;
}

// ============================================================================
// PYTHON TDD EXAMPLES (15)
// ============================================================================
export const TDD_EXAMPLES: TDDExample[] = [
    {
        title: "Two Sum",
        description: "Given an array of integers and a target, return indices of two numbers that add up to the target.",
        functionSignature: "def two_sum(nums: list[int], target: int) -> list[int]:",
        language: "python",
        testCases: [
            { id: "1", description: "Basic case", input: "two_sum([2, 7, 11, 15], 9)", expectedOutput: "[0, 1]", isHidden: false },
            { id: "2", description: "Numbers in middle", input: "two_sum([3, 2, 4], 6)", expectedOutput: "[1, 2]", isHidden: false },
            { id: "3", description: "Same number twice", input: "two_sum([3, 3], 6)", expectedOutput: "[0, 1]", isHidden: true },
            { id: "4", description: "Negative numbers", input: "two_sum([-1, -2, -3, -4, -5], -8)", expectedOutput: "[2, 4]", isHidden: true },
            { id: "5", description: "Large array", input: "two_sum([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 19)", expectedOutput: "[8, 9]", isHidden: true }
        ],
        solution: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
    },
    {
        title: "Palindrome Check",
        description: "Check if a string is a palindrome, considering only alphanumeric characters.",
        functionSignature: "def is_palindrome(s: str) -> bool:",
        language: "python",
        testCases: [
            { id: "1", description: "Simple palindrome", input: 'is_palindrome("racecar")', expectedOutput: "True", isHidden: false },
            { id: "2", description: "With spaces/punctuation", input: 'is_palindrome("A man, a plan, a canal: Panama")', expectedOutput: "True", isHidden: false },
            { id: "3", description: "Not a palindrome", input: 'is_palindrome("hello")', expectedOutput: "False", isHidden: true },
            { id: "4", description: "Single character", input: 'is_palindrome("a")', expectedOutput: "True", isHidden: true },
            { id: "5", description: "Empty string", input: 'is_palindrome("")', expectedOutput: "True", isHidden: true }
        ],
        solution: `def is_palindrome(s: str) -> bool:
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]`
    },
    {
        title: "FizzBuzz",
        description: "Return 'Fizz' for multiples of 3, 'Buzz' for 5, 'FizzBuzz' for both, else the number.",
        functionSignature: "def fizzbuzz(n: int) -> str:",
        language: "python",
        testCases: [
            { id: "1", description: "Multiple of 3", input: "fizzbuzz(9)", expectedOutput: '"Fizz"', isHidden: false },
            { id: "2", description: "Multiple of 5", input: "fizzbuzz(10)", expectedOutput: '"Buzz"', isHidden: false },
            { id: "3", description: "Multiple of 15", input: "fizzbuzz(15)", expectedOutput: '"FizzBuzz"', isHidden: true },
            { id: "4", description: "Regular number", input: "fizzbuzz(7)", expectedOutput: '"7"', isHidden: true },
            { id: "5", description: "One", input: "fizzbuzz(1)", expectedOutput: '"1"', isHidden: true }
        ],
        solution: `def fizzbuzz(n: int) -> str:
    if n % 15 == 0:
        return "FizzBuzz"
    elif n % 3 == 0:
        return "Fizz"
    elif n % 5 == 0:
        return "Buzz"
    return str(n)`
    },
    {
        title: "Reverse Words",
        description: "Reverse the order of words in a string.",
        functionSignature: "def reverse_words(s: str) -> str:",
        language: "python",
        testCases: [
            { id: "1", description: "Basic case", input: 'reverse_words("hello world")', expectedOutput: '"world hello"', isHidden: false },
            { id: "2", description: "Extra spaces", input: 'reverse_words("  the sky is blue  ")', expectedOutput: '"blue is sky the"', isHidden: false },
            { id: "3", description: "Single word", input: 'reverse_words("hello")', expectedOutput: '"hello"', isHidden: true },
            { id: "4", description: "Multiple spaces", input: 'reverse_words("a   b   c")', expectedOutput: '"c b a"', isHidden: true },
            { id: "5", description: "Empty input", input: 'reverse_words("")', expectedOutput: '""', isHidden: true }
        ],
        solution: `def reverse_words(s: str) -> str:
    words = s.split()
    return ' '.join(reversed(words))`
    },
    {
        title: "Valid Parentheses",
        description: "Check if a string of brackets is balanced.",
        functionSignature: "def is_valid(s: str) -> bool:",
        language: "python",
        testCases: [
            { id: "1", description: "Balanced simple", input: 'is_valid("()")', expectedOutput: "True", isHidden: false },
            { id: "2", description: "Multiple types", input: 'is_valid("()[]{}")', expectedOutput: "True", isHidden: false },
            { id: "3", description: "Nested", input: 'is_valid("{[()]}")', expectedOutput: "True", isHidden: true },
            { id: "4", description: "Unbalanced", input: 'is_valid("(]")', expectedOutput: "False", isHidden: true },
            { id: "5", description: "Extra opening", input: 'is_valid("(((")', expectedOutput: "False", isHidden: true }
        ],
        solution: `def is_valid(s: str) -> bool:
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for char in s:
        if char in '([{':
            stack.append(char)
        elif char in ')]}':
            if not stack or stack.pop() != pairs[char]:
                return False
    return len(stack) == 0`
    },
    {
        title: "Merge Intervals",
        description: "Merge overlapping intervals.",
        functionSignature: "def merge(intervals: list[list[int]]) -> list[list[int]]:",
        language: "python",
        testCases: [
            { id: "1", description: "Overlapping", input: "merge([[1,3],[2,6],[8,10],[15,18]])", expectedOutput: "[[1,6],[8,10],[15,18]]", isHidden: false },
            { id: "2", description: "All overlap", input: "merge([[1,4],[4,5]])", expectedOutput: "[[1,5]]", isHidden: false },
            { id: "3", description: "No overlap", input: "merge([[1,2],[3,4],[5,6]])", expectedOutput: "[[1,2],[3,4],[5,6]]", isHidden: true },
            { id: "4", description: "Single interval", input: "merge([[1,4]])", expectedOutput: "[[1,4]]", isHidden: true },
            { id: "5", description: "Nested intervals", input: "merge([[1,10],[2,3],[4,5]])", expectedOutput: "[[1,10]]", isHidden: true }
        ],
        solution: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    if not intervals:
        return []
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    for interval in intervals[1:]:
        if interval[0] <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], interval[1])
        else:
            merged.append(interval)
    return merged`
    },
    {
        title: "Maximum Subarray",
        description: "Find the contiguous subarray with the largest sum.",
        functionSignature: "def max_subarray(nums: list[int]) -> int:",
        language: "python",
        testCases: [
            { id: "1", description: "Mixed values", input: "max_subarray([-2,1,-3,4,-1,2,1,-5,4])", expectedOutput: "6", isHidden: false },
            { id: "2", description: "All positive", input: "max_subarray([1,2,3,4])", expectedOutput: "10", isHidden: false },
            { id: "3", description: "All negative", input: "max_subarray([-1,-2,-3])", expectedOutput: "-1", isHidden: true },
            { id: "4", description: "Single element", input: "max_subarray([5])", expectedOutput: "5", isHidden: true },
            { id: "5", description: "Two elements", input: "max_subarray([-2,1])", expectedOutput: "1", isHidden: true }
        ],
        solution: `def max_subarray(nums: list[int]) -> int:
    max_sum = current_sum = nums[0]
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
    return max_sum`
    },
    {
        title: "Binary Search",
        description: "Find target index in sorted array, return -1 if not found.",
        functionSignature: "def binary_search(nums: list[int], target: int) -> int:",
        language: "python",
        testCases: [
            { id: "1", description: "Target exists", input: "binary_search([1,2,3,4,5], 3)", expectedOutput: "2", isHidden: false },
            { id: "2", description: "First element", input: "binary_search([1,2,3,4,5], 1)", expectedOutput: "0", isHidden: false },
            { id: "3", description: "Last element", input: "binary_search([1,2,3,4,5], 5)", expectedOutput: "4", isHidden: true },
            { id: "4", description: "Not found", input: "binary_search([1,2,3,4,5], 6)", expectedOutput: "-1", isHidden: true },
            { id: "5", description: "Empty array", input: "binary_search([], 1)", expectedOutput: "-1", isHidden: true }
        ],
        solution: `def binary_search(nums: list[int], target: int) -> int:
    left, right = 0, len(nums) - 1
    while left <= right:
        mid = (left + right) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`
    },
    {
        title: "Factorial",
        description: "Calculate n factorial.",
        functionSignature: "def factorial(n: int) -> int:",
        language: "python",
        testCases: [
            { id: "1", description: "Basic case", input: "factorial(5)", expectedOutput: "120", isHidden: false },
            { id: "2", description: "Zero factorial", input: "factorial(0)", expectedOutput: "1", isHidden: false },
            { id: "3", description: "One factorial", input: "factorial(1)", expectedOutput: "1", isHidden: true },
            { id: "4", description: "Large number", input: "factorial(10)", expectedOutput: "3628800", isHidden: true },
            { id: "5", description: "Three", input: "factorial(3)", expectedOutput: "6", isHidden: true }
        ],
        solution: `def factorial(n: int) -> int:
    if n <= 1:
        return 1
    return n * factorial(n - 1)`
    },
    {
        title: "Remove Duplicates",
        description: "Remove duplicates from sorted array in place, return new length.",
        functionSignature: "def remove_duplicates(nums: list[int]) -> int:",
        language: "python",
        testCases: [
            { id: "1", description: "Basic case", input: "remove_duplicates([1,1,2])", expectedOutput: "2", isHidden: false },
            { id: "2", description: "Multiple duplicates", input: "remove_duplicates([0,0,1,1,1,2,2,3,3,4])", expectedOutput: "5", isHidden: false },
            { id: "3", description: "No duplicates", input: "remove_duplicates([1,2,3])", expectedOutput: "3", isHidden: true },
            { id: "4", description: "All same", input: "remove_duplicates([1,1,1,1])", expectedOutput: "1", isHidden: true },
            { id: "5", description: "Empty", input: "remove_duplicates([])", expectedOutput: "0", isHidden: true }
        ],
        solution: `def remove_duplicates(nums: list[int]) -> int:
    if not nums:
        return 0
    write_ptr = 0
    for read_ptr in range(1, len(nums)):
        if nums[read_ptr] != nums[write_ptr]:
            write_ptr += 1
            nums[write_ptr] = nums[read_ptr]
    return write_ptr + 1`
    },
    {
        title: "Count Vowels",
        description: "Count the number of vowels in a string.",
        functionSignature: "def count_vowels(s: str) -> int:",
        language: "python",
        testCases: [
            { id: "1", description: "Mixed case", input: 'count_vowels("Hello World")', expectedOutput: "3", isHidden: false },
            { id: "2", description: "Only vowels", input: 'count_vowels("aeiou")', expectedOutput: "5", isHidden: false },
            { id: "3", description: "No vowels", input: 'count_vowels("rhythm")', expectedOutput: "0", isHidden: true },
            { id: "4", description: "Upper case", input: 'count_vowels("AEIOU")', expectedOutput: "5", isHidden: true },
            { id: "5", description: "Empty", input: 'count_vowels("")', expectedOutput: "0", isHidden: true }
        ],
        solution: `def count_vowels(s: str) -> int:
    vowels = 'aeiouAEIOU'
    return sum(1 for char in s if char in vowels)`
    },
    {
        title: "Sum of Digits",
        description: "Return the sum of all digits in a number.",
        functionSignature: "def sum_of_digits(n: int) -> int:",
        language: "python",
        testCases: [
            { id: "1", description: "Basic case", input: "sum_of_digits(123)", expectedOutput: "6", isHidden: false },
            { id: "2", description: "Large number", input: "sum_of_digits(9999)", expectedOutput: "36", isHidden: false },
            { id: "3", description: "Single digit", input: "sum_of_digits(5)", expectedOutput: "5", isHidden: true },
            { id: "4", description: "Zero", input: "sum_of_digits(0)", expectedOutput: "0", isHidden: true },
            { id: "5", description: "Negative", input: "sum_of_digits(-123)", expectedOutput: "6", isHidden: true }
        ],
        solution: `def sum_of_digits(n: int) -> int:
    n = abs(n)
    total = 0
    while n > 0:
        total += n % 10
        n //= 10
    return total`
    },
    {
        title: "Is Prime",
        description: "Check if a number is prime.",
        functionSignature: "def is_prime(n: int) -> bool:",
        language: "python",
        testCases: [
            { id: "1", description: "Prime number", input: "is_prime(7)", expectedOutput: "True", isHidden: false },
            { id: "2", description: "Not prime", input: "is_prime(4)", expectedOutput: "False", isHidden: false },
            { id: "3", description: "Two", input: "is_prime(2)", expectedOutput: "True", isHidden: true },
            { id: "4", description: "One", input: "is_prime(1)", expectedOutput: "False", isHidden: true },
            { id: "5", description: "Large prime", input: "is_prime(97)", expectedOutput: "True", isHidden: true }
        ],
        solution: `def is_prime(n: int) -> bool:
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True`
    },
    {
        title: "Longest Common Prefix",
        description: "Find the longest common prefix among strings.",
        functionSignature: "def longest_prefix(strs: list[str]) -> str:",
        language: "python",
        testCases: [
            { id: "1", description: "Common prefix", input: 'longest_prefix(["flower","flow","flight"])', expectedOutput: '"fl"', isHidden: false },
            { id: "2", description: "No common prefix", input: 'longest_prefix(["dog","racecar","car"])', expectedOutput: '""', isHidden: false },
            { id: "3", description: "All same", input: 'longest_prefix(["a","a","a"])', expectedOutput: '"a"', isHidden: true },
            { id: "4", description: "Single string", input: 'longest_prefix(["hello"])', expectedOutput: '"hello"', isHidden: true },
            { id: "5", description: "Empty list", input: 'longest_prefix([])', expectedOutput: '""', isHidden: true }
        ],
        solution: `def longest_prefix(strs: list[str]) -> str:
    if not strs:
        return ""
    prefix = strs[0]
    for s in strs[1:]:
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix`
    },
    {
        title: "Rotate Array",
        description: "Rotate array to the right by k steps.",
        functionSignature: "def rotate(nums: list[int], k: int) -> list[int]:",
        language: "python",
        testCases: [
            { id: "1", description: "Basic rotation", input: "rotate([1,2,3,4,5], 2)", expectedOutput: "[4,5,1,2,3]", isHidden: false },
            { id: "2", description: "Full rotation", input: "rotate([1,2,3], 3)", expectedOutput: "[1,2,3]", isHidden: false },
            { id: "3", description: "k > length", input: "rotate([1,2], 3)", expectedOutput: "[2,1]", isHidden: true },
            { id: "4", description: "Single element", input: "rotate([1], 5)", expectedOutput: "[1]", isHidden: true },
            { id: "5", description: "No rotation", input: "rotate([1,2,3], 0)", expectedOutput: "[1,2,3]", isHidden: true }
        ],
        solution: `def rotate(nums: list[int], k: int) -> list[int]:
    if not nums:
        return nums
    k = k % len(nums)
    return nums[-k:] + nums[:-k]`
    }
];

export function getRandomTDDExample(): TDDExample {
    return TDD_EXAMPLES[Math.floor(Math.random() * TDD_EXAMPLES.length)];
}
