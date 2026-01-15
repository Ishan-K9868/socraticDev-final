// Mental Compiler Hardcoded Examples
// 15 examples per language × 7 languages = 105 examples

export interface MentalExample {
    title: string;
    description: string;
    code: string;
    expectedOutput: string;
    wrongOptions: string[];
    traceSteps: Array<{
        line: number;
        variables: Record<string, string>;
        explanation: string;
    }>;
    language: string;
}

// ============================================================================
// PYTHON EXAMPLES (15)
// ============================================================================
const pythonMental: MentalExample[] = [
    {
        title: "Counter Loop",
        description: "Trace through a simple counting loop",
        code: `x = 0
for i in range(3):
    x += i
print(x)`,
        expectedOutput: "3",
        wrongOptions: ["6", "0", "2"],
        traceSteps: [
            { line: 1, variables: { x: "0" }, explanation: "Initialize x to 0" },
            { line: 2, variables: { x: "0", i: "0" }, explanation: "First iteration, i=0" },
            { line: 3, variables: { x: "0" }, explanation: "x += 0, x stays 0" },
            { line: 2, variables: { x: "0", i: "1" }, explanation: "Second iteration, i=1" },
            { line: 3, variables: { x: "1" }, explanation: "x += 1, x becomes 1" },
            { line: 2, variables: { x: "1", i: "2" }, explanation: "Third iteration, i=2" },
            { line: 3, variables: { x: "3" }, explanation: "x += 2, x becomes 3" },
            { line: 4, variables: { x: "3" }, explanation: "Print 3" }
        ],
        language: "python"
    },
    {
        title: "String Multiplication",
        description: "Predict string repetition output",
        code: `s = "ab"
result = s * 3
print(result)`,
        expectedOutput: "ababab",
        wrongOptions: ["ab3", "ab ab ab", "abababab"],
        traceSteps: [
            { line: 1, variables: { s: '"ab"' }, explanation: "Initialize s to 'ab'" },
            { line: 2, variables: { s: '"ab"', result: '"ababab"' }, explanation: "Multiply string 3 times" },
            { line: 3, variables: { result: '"ababab"' }, explanation: "Print result" }
        ],
        language: "python"
    },
    {
        title: "List Slice",
        description: "Trace list slicing behavior",
        code: `arr = [1, 2, 3, 4, 5]
result = arr[1:4]
print(result)`,
        expectedOutput: "[2, 3, 4]",
        wrongOptions: ["[1, 2, 3, 4]", "[2, 3, 4, 5]", "[1, 2, 3]"],
        traceSteps: [
            { line: 1, variables: { arr: "[1, 2, 3, 4, 5]" }, explanation: "Create list" },
            { line: 2, variables: { result: "[2, 3, 4]" }, explanation: "Slice from index 1 to 3 (4 exclusive)" },
            { line: 3, variables: { result: "[2, 3, 4]" }, explanation: "Print sliced list" }
        ],
        language: "python"
    },
    {
        title: "Nested Condition",
        description: "Trace nested if-else logic",
        code: `x = 5
y = 10
if x > 3:
    if y > 15:
        print("A")
    else:
        print("B")
else:
    print("C")`,
        expectedOutput: "B",
        wrongOptions: ["A", "C", "None"],
        traceSteps: [
            { line: 1, variables: { x: "5" }, explanation: "x = 5" },
            { line: 2, variables: { x: "5", y: "10" }, explanation: "y = 10" },
            { line: 3, variables: { x: "5", y: "10" }, explanation: "5 > 3 is True, enter if" },
            { line: 4, variables: { x: "5", y: "10" }, explanation: "10 > 15 is False" },
            { line: 7, variables: {}, explanation: "Print 'B'" }
        ],
        language: "python"
    },
    {
        title: "While Loop Counter",
        description: "Count while loop iterations",
        code: `n = 10
count = 0
while n > 1:
    n = n // 2
    count += 1
print(count)`,
        expectedOutput: "3",
        wrongOptions: ["4", "10", "2"],
        traceSteps: [
            { line: 1, variables: { n: "10" }, explanation: "n = 10" },
            { line: 2, variables: { n: "10", count: "0" }, explanation: "count = 0" },
            { line: 3, variables: { n: "10" }, explanation: "10 > 1, enter loop" },
            { line: 4, variables: { n: "5" }, explanation: "n = 10 // 2 = 5" },
            { line: 5, variables: { count: "1" }, explanation: "count = 1" },
            { line: 3, variables: { n: "5" }, explanation: "5 > 1, continue" },
            { line: 4, variables: { n: "2" }, explanation: "n = 5 // 2 = 2" },
            { line: 5, variables: { count: "2" }, explanation: "count = 2" },
            { line: 3, variables: { n: "2" }, explanation: "2 > 1, continue" },
            { line: 4, variables: { n: "1" }, explanation: "n = 2 // 2 = 1" },
            { line: 5, variables: { count: "3" }, explanation: "count = 3" },
            { line: 3, variables: { n: "1" }, explanation: "1 > 1 is False, exit" },
            { line: 6, variables: { count: "3" }, explanation: "Print 3" }
        ],
        language: "python"
    },
    {
        title: "Dictionary Access",
        description: "Trace dictionary operations",
        code: `d = {"a": 1, "b": 2}
d["a"] += 5
print(d["a"])`,
        expectedOutput: "6",
        wrongOptions: ["1", "5", "7"],
        traceSteps: [
            { line: 1, variables: { d: '{"a": 1, "b": 2}' }, explanation: "Create dictionary" },
            { line: 2, variables: { d: '{"a": 6, "b": 2}' }, explanation: "d['a'] = 1 + 5 = 6" },
            { line: 3, variables: {}, explanation: "Print 6" }
        ],
        language: "python"
    },
    {
        title: "List Comprehension",
        description: "Evaluate list comprehension",
        code: `nums = [1, 2, 3, 4]
result = [x * 2 for x in nums if x % 2 == 0]
print(result)`,
        expectedOutput: "[4, 8]",
        wrongOptions: ["[2, 4, 6, 8]", "[2, 4]", "[1, 2, 3, 4]"],
        traceSteps: [
            { line: 1, variables: { nums: "[1, 2, 3, 4]" }, explanation: "Create list" },
            { line: 2, variables: { result: "[4, 8]" }, explanation: "Filter even (2, 4), double them" },
            { line: 3, variables: {}, explanation: "Print [4, 8]" }
        ],
        language: "python"
    },
    {
        title: "String Formatting",
        description: "Trace f-string output",
        code: `x = 5
y = 3
print(f"{x} + {y} = {x + y}")`,
        expectedOutput: "5 + 3 = 8",
        wrongOptions: ["x + y = x + y", "5 + 3 = 53", "{x} + {y} = {x + y}"],
        traceSteps: [
            { line: 1, variables: { x: "5" }, explanation: "x = 5" },
            { line: 2, variables: { y: "3" }, explanation: "y = 3" },
            { line: 3, variables: {}, explanation: "f-string evaluates expressions" }
        ],
        language: "python"
    },
    {
        title: "Boolean Logic",
        description: "Trace boolean operations",
        code: `a = True
b = False
result = a and not b or False
print(result)`,
        expectedOutput: "True",
        wrongOptions: ["False", "None", "1"],
        traceSteps: [
            { line: 1, variables: { a: "True" }, explanation: "a = True" },
            { line: 2, variables: { b: "False" }, explanation: "b = False" },
            { line: 3, variables: { result: "True" }, explanation: "True and True or False = True" },
            { line: 4, variables: {}, explanation: "Print True" }
        ],
        language: "python"
    },
    {
        title: "List Append vs Extend",
        description: "Understand append behavior",
        code: `arr = [1, 2]
arr.append([3, 4])
print(len(arr))`,
        expectedOutput: "3",
        wrongOptions: ["4", "2", "6"],
        traceSteps: [
            { line: 1, variables: { arr: "[1, 2]" }, explanation: "Create list with 2 elements" },
            { line: 2, variables: { arr: "[1, 2, [3, 4]]" }, explanation: "Append adds list as single element" },
            { line: 3, variables: {}, explanation: "Length is 3" }
        ],
        language: "python"
    },
    {
        title: "Modulo Operation",
        description: "Trace modulo with negative",
        code: `x = -7 % 3
print(x)`,
        expectedOutput: "2",
        wrongOptions: ["-1", "-7", "1"],
        traceSteps: [
            { line: 1, variables: { x: "2" }, explanation: "Python modulo: -7 = 3*(-3) + 2" },
            { line: 2, variables: {}, explanation: "Print 2 (Python floor division)" }
        ],
        language: "python"
    },
    {
        title: "Tuple Unpacking",
        description: "Trace multiple assignment",
        code: `a, b = 1, 2
a, b = b, a
print(a, b)`,
        expectedOutput: "2 1",
        wrongOptions: ["1 2", "2 2", "1 1"],
        traceSteps: [
            { line: 1, variables: { a: "1", b: "2" }, explanation: "a=1, b=2" },
            { line: 2, variables: { a: "2", b: "1" }, explanation: "Swap: a=2, b=1" },
            { line: 3, variables: {}, explanation: "Print '2 1'" }
        ],
        language: "python"
    },
    {
        title: "Range Step",
        description: "Understand range with step",
        code: `result = list(range(10, 0, -2))
print(result)`,
        expectedOutput: "[10, 8, 6, 4, 2]",
        wrongOptions: ["[10, 8, 6, 4, 2, 0]", "[0, 2, 4, 6, 8, 10]", "[10, 9, 8, 7, 6]"],
        traceSteps: [
            { line: 1, variables: { result: "[10, 8, 6, 4, 2]" }, explanation: "range(10, 0, -2) excludes 0" },
            { line: 2, variables: {}, explanation: "Print list" }
        ],
        language: "python"
    },
    {
        title: "String Join",
        description: "Trace join operation",
        code: `words = ["hello", "world"]
result = " ".join(words)
print(result)`,
        expectedOutput: "hello world",
        wrongOptions: ["helloworld", "['hello', 'world']", "hello, world"],
        traceSteps: [
            { line: 1, variables: { words: '["hello", "world"]' }, explanation: "Create list" },
            { line: 2, variables: { result: '"hello world"' }, explanation: "Join with space" },
            { line: 3, variables: {}, explanation: "Print joined string" }
        ],
        language: "python"
    },
    {
        title: "Enumerate Loop",
        description: "Trace enumerate behavior",
        code: `items = ["a", "b", "c"]
for i, v in enumerate(items, 1):
    if i == 2:
        print(v)`,
        expectedOutput: "b",
        wrongOptions: ["a", "c", "2"],
        traceSteps: [
            { line: 1, variables: { items: '["a", "b", "c"]' }, explanation: "Create list" },
            { line: 2, variables: { i: "1", v: '"a"' }, explanation: "First: i=1, v='a'" },
            { line: 3, variables: {}, explanation: "1 == 2 is False" },
            { line: 2, variables: { i: "2", v: '"b"' }, explanation: "Second: i=2, v='b'" },
            { line: 3, variables: {}, explanation: "2 == 2 is True" },
            { line: 4, variables: {}, explanation: "Print 'b'" }
        ],
        language: "python"
    }
];

// ============================================================================
// JAVASCRIPT EXAMPLES (15)
// ============================================================================
const javascriptMental: MentalExample[] = [
    {
        title: "Var Hoisting",
        description: "Understand var hoisting",
        code: `console.log(x);
var x = 5;`,
        expectedOutput: "undefined",
        wrongOptions: ["5", "ReferenceError", "null"],
        traceSteps: [
            { line: 1, variables: { x: "undefined" }, explanation: "var x is hoisted but not initialized" },
            { line: 2, variables: { x: "5" }, explanation: "x assigned 5 (after console.log)" }
        ],
        language: "javascript"
    },
    {
        title: "Closure Counter",
        description: "Trace closure behavior",
        code: `function counter() {
    let count = 0;
    return () => ++count;
}
const inc = counter();
console.log(inc(), inc());`,
        expectedOutput: "1 2",
        wrongOptions: ["0 1", "1 1", "2 2"],
        traceSteps: [
            { line: 1, variables: {}, explanation: "Define counter function" },
            { line: 5, variables: { count: "0" }, explanation: "Create closure with count=0" },
            { line: 6, variables: { count: "2" }, explanation: "Two calls: 1, then 2" }
        ],
        language: "javascript"
    },
    {
        title: "Array Spread",
        description: "Trace spread operator",
        code: `const a = [1, 2];
const b = [...a, 3, ...a];
console.log(b.length);`,
        expectedOutput: "5",
        wrongOptions: ["3", "4", "6"],
        traceSteps: [
            { line: 1, variables: { a: "[1, 2]" }, explanation: "Create array a" },
            { line: 2, variables: { b: "[1, 2, 3, 1, 2]" }, explanation: "Spread a twice with 3" },
            { line: 3, variables: {}, explanation: "Length is 5" }
        ],
        language: "javascript"
    },
    {
        title: "Type Coercion",
        description: "Understand type coercion",
        code: `console.log("5" + 3);
console.log("5" - 3);`,
        expectedOutput: "53\\n2",
        wrongOptions: ["8\\n2", "53\\n53", "8\\n8"],
        traceSteps: [
            { line: 1, variables: {}, explanation: "'5' + 3 = '53' (string concat)" },
            { line: 2, variables: {}, explanation: "'5' - 3 = 2 (numeric subtraction)" }
        ],
        language: "javascript"
    },
    {
        title: "Object Destructuring",
        description: "Trace destructuring with default",
        code: `const obj = { a: 1 };
const { a, b = 5 } = obj;
console.log(a + b);`,
        expectedOutput: "6",
        wrongOptions: ["1", "5", "undefined"],
        traceSteps: [
            { line: 1, variables: { obj: "{ a: 1 }" }, explanation: "Create object" },
            { line: 2, variables: { a: "1", b: "5" }, explanation: "a=1, b defaults to 5" },
            { line: 3, variables: {}, explanation: "1 + 5 = 6" }
        ],
        language: "javascript"
    },
    {
        title: "Truthy/Falsy",
        description: "Trace truthy evaluation",
        code: `const arr = [];
if (arr) {
    console.log("A");
} else {
    console.log("B");
}`,
        expectedOutput: "A",
        wrongOptions: ["B", "undefined", "[]"],
        traceSteps: [
            { line: 1, variables: { arr: "[]" }, explanation: "Empty array" },
            { line: 2, variables: {}, explanation: "Arrays are truthy (even empty)" },
            { line: 3, variables: {}, explanation: "Print 'A'" }
        ],
        language: "javascript"
    },
    {
        title: "Map Function",
        description: "Trace map with index",
        code: `const arr = [10, 20, 30];
const result = arr.map((x, i) => x + i);
console.log(result);`,
        expectedOutput: "[10, 21, 32]",
        wrongOptions: ["[10, 20, 30]", "[11, 22, 33]", "[0, 1, 2]"],
        traceSteps: [
            { line: 1, variables: { arr: "[10, 20, 30]" }, explanation: "Create array" },
            { line: 2, variables: { result: "[10, 21, 32]" }, explanation: "10+0, 20+1, 30+2" },
            { line: 3, variables: {}, explanation: "Print result" }
        ],
        language: "javascript"
    },
    {
        title: "Filter and Length",
        description: "Trace filter operation",
        code: `const nums = [1, 2, 3, 4, 5, 6];
const even = nums.filter(n => n % 2 === 0);
console.log(even.length);`,
        expectedOutput: "3",
        wrongOptions: ["6", "2", "4"],
        traceSteps: [
            { line: 1, variables: { nums: "[1,2,3,4,5,6]" }, explanation: "Create array" },
            { line: 2, variables: { even: "[2, 4, 6]" }, explanation: "Filter even numbers" },
            { line: 3, variables: {}, explanation: "3 even numbers" }
        ],
        language: "javascript"
    },
    {
        title: "Template Literal",
        description: "Evaluate template expression",
        code: `const a = 2, b = 3;
console.log(\`\${a} * \${b} = \${a * b}\`);`,
        expectedOutput: "2 * 3 = 6",
        wrongOptions: ["${a} * ${b} = ${a * b}", "2 * 3 = 23", "a * b = a * b"],
        traceSteps: [
            { line: 1, variables: { a: "2", b: "3" }, explanation: "a=2, b=3" },
            { line: 2, variables: {}, explanation: "Template evaluates expressions" }
        ],
        language: "javascript"
    },
    {
        title: "Array Reduce",
        description: "Trace reduce accumulator",
        code: `const arr = [1, 2, 3, 4];
const sum = arr.reduce((acc, n) => acc + n, 10);
console.log(sum);`,
        expectedOutput: "20",
        wrongOptions: ["10", "14", "24"],
        traceSteps: [
            { line: 1, variables: { arr: "[1,2,3,4]" }, explanation: "Create array" },
            { line: 2, variables: { sum: "20" }, explanation: "10+1+2+3+4=20" },
            { line: 3, variables: {}, explanation: "Print 20" }
        ],
        language: "javascript"
    },
    {
        title: "Nullish Coalescing",
        description: "Understand ?? operator",
        code: `const a = 0;
const b = null;
console.log(a ?? 5, b ?? 5);`,
        expectedOutput: "0 5",
        wrongOptions: ["5 5", "0 null", "5 null"],
        traceSteps: [
            { line: 1, variables: { a: "0" }, explanation: "a = 0" },
            { line: 2, variables: { b: "null" }, explanation: "b = null" },
            { line: 3, variables: {}, explanation: "?? only checks null/undefined" }
        ],
        language: "javascript"
    },
    {
        title: "Object Shorthand",
        description: "Trace object creation",
        code: `const x = 1, y = 2;
const obj = { x, y, sum: x + y };
console.log(obj.sum);`,
        expectedOutput: "3",
        wrongOptions: ["x + y", "undefined", "12"],
        traceSteps: [
            { line: 1, variables: { x: "1", y: "2" }, explanation: "x=1, y=2" },
            { line: 2, variables: { obj: "{ x: 1, y: 2, sum: 3 }" }, explanation: "Create object" },
            { line: 3, variables: {}, explanation: "Print 3" }
        ],
        language: "javascript"
    },
    {
        title: "Array Find",
        description: "Trace find behavior",
        code: `const arr = [5, 12, 8, 130, 44];
const found = arr.find(x => x > 10);
console.log(found);`,
        expectedOutput: "12",
        wrongOptions: ["130", "[12, 130, 44]", "5"],
        traceSteps: [
            { line: 1, variables: { arr: "[5,12,8,130,44]" }, explanation: "Create array" },
            { line: 2, variables: { found: "12" }, explanation: "First element > 10" },
            { line: 3, variables: {}, explanation: "Print 12" }
        ],
        language: "javascript"
    },
    {
        title: "String Methods",
        description: "Chain string methods",
        code: `const str = "  Hello World  ";
const result = str.trim().toLowerCase().split(" ").length;
console.log(result);`,
        expectedOutput: "2",
        wrongOptions: ["3", "1", "14"],
        traceSteps: [
            { line: 1, variables: { str: '"  Hello World  "' }, explanation: "String with spaces" },
            { line: 2, variables: { result: "2" }, explanation: "trim→'Hello World', lower→'hello world', split→['hello','world']" },
            { line: 3, variables: {}, explanation: "Print 2" }
        ],
        language: "javascript"
    },
    {
        title: "Array Every",
        description: "Trace every method",
        code: `const arr = [2, 4, 6, 8];
const allEven = arr.every(n => n % 2 === 0);
console.log(allEven);`,
        expectedOutput: "true",
        wrongOptions: ["false", "[2,4,6,8]", "4"],
        traceSteps: [
            { line: 1, variables: { arr: "[2,4,6,8]" }, explanation: "All even numbers" },
            { line: 2, variables: { allEven: "true" }, explanation: "All pass the test" },
            { line: 3, variables: {}, explanation: "Print true" }
        ],
        language: "javascript"
    }
];

// Export for now - more languages to come
export const MENTAL_EXAMPLES: Record<string, MentalExample[]> = {
    python: pythonMental,
    javascript: javascriptMental,
    typescript: [
        {
            title: "Type Narrowing",
            description: "Trace type guard behavior",
            code: `function process(x: string | number) {
    if (typeof x === "string") {
        return x.length;
    }
    return x * 2;
}
console.log(process("hello"));`,
            expectedOutput: "5",
            wrongOptions: ["hello", "10", "hellohello"],
            traceSteps: [
                { line: 1, variables: { x: '"hello"' }, explanation: "x is 'hello'" },
                { line: 2, variables: {}, explanation: "typeof 'hello' === 'string' is true" },
                { line: 3, variables: {}, explanation: "Return 'hello'.length = 5" }
            ],
            language: "typescript"
        },
        {
            title: "Optional Chaining",
            description: "Trace ?. operator",
            code: `const obj = { a: { b: 5 } };
const result = obj?.a?.b ?? 0;
console.log(result);`,
            expectedOutput: "5",
            wrongOptions: ["0", "undefined", "null"],
            traceSteps: [
                { line: 1, variables: { obj: "{ a: { b: 5 } }" }, explanation: "Nested object" },
                { line: 2, variables: { result: "5" }, explanation: "a.b exists, returns 5" },
                { line: 3, variables: {}, explanation: "Print 5" }
            ],
            language: "typescript"
        }
    ],
    java: [
        {
            title: "String Comparison",
            description: "Trace == vs equals",
            code: `String a = new String("hello");
String b = new String("hello");
System.out.println(a == b);
System.out.println(a.equals(b));`,
            expectedOutput: "false\\ntrue",
            wrongOptions: ["true\\ntrue", "true\\nfalse", "false\\nfalse"],
            traceSteps: [
                { line: 1, variables: { a: '"hello"' }, explanation: "New String object" },
                { line: 2, variables: { b: '"hello"' }, explanation: "Different object" },
                { line: 3, variables: {}, explanation: "== compares references: false" },
                { line: 4, variables: {}, explanation: "equals compares content: true" }
            ],
            language: "java"
        },
        {
            title: "Array Length",
            description: "Trace enhanced for loop",
            code: `int[] arr = {1, 2, 3, 4, 5};
int sum = 0;
for (int n : arr) {
    sum += n;
}
System.out.println(sum);`,
            expectedOutput: "15",
            wrongOptions: ["5", "10", "12345"],
            traceSteps: [
                { line: 1, variables: { arr: "[1,2,3,4,5]" }, explanation: "Create array" },
                { line: 2, variables: { sum: "0" }, explanation: "Initialize sum" },
                { line: 3, variables: {}, explanation: "Loop through array" },
                { line: 6, variables: { sum: "15" }, explanation: "1+2+3+4+5=15" }
            ],
            language: "java"
        }
    ],
    cpp: [
        {
            title: "Vector Size",
            description: "Trace push_back",
            code: `vector<int> v = {1, 2};
v.push_back(3);
v.push_back(4);
cout << v.size();`,
            expectedOutput: "4",
            wrongOptions: ["2", "3", "10"],
            traceSteps: [
                { line: 1, variables: { v: "[1, 2]" }, explanation: "Initialize with 2 elements" },
                { line: 2, variables: { v: "[1, 2, 3]" }, explanation: "Add 3" },
                { line: 3, variables: { v: "[1, 2, 3, 4]" }, explanation: "Add 4" },
                { line: 4, variables: {}, explanation: "Size is 4" }
            ],
            language: "cpp"
        },
        {
            title: "Reference Parameter",
            description: "Trace pass by reference",
            code: `void increment(int& x) {
    x++;
}
int main() {
    int n = 5;
    increment(n);
    cout << n;
}`,
            expectedOutput: "6",
            wrongOptions: ["5", "7", "undefined"],
            traceSteps: [
                { line: 5, variables: { n: "5" }, explanation: "n = 5" },
                { line: 6, variables: { n: "6" }, explanation: "Reference modified" },
                { line: 7, variables: {}, explanation: "Print 6" }
            ],
            language: "cpp"
        }
    ],
    go: [
        {
            title: "Slice Append",
            description: "Trace slice behavior",
            code: `s := []int{1, 2}
s = append(s, 3, 4, 5)
fmt.Println(len(s))`,
            expectedOutput: "5",
            wrongOptions: ["2", "3", "7"],
            traceSteps: [
                { line: 1, variables: { s: "[1, 2]" }, explanation: "Initial slice" },
                { line: 2, variables: { s: "[1, 2, 3, 4, 5]" }, explanation: "Append 3 elements" },
                { line: 3, variables: {}, explanation: "Length is 5" }
            ],
            language: "go"
        },
        {
            title: "Map Access",
            description: "Trace map comma-ok idiom",
            code: `m := map[string]int{"a": 1}
val, ok := m["b"]
fmt.Println(val, ok)`,
            expectedOutput: "0 false",
            wrongOptions: ["nil false", "1 true", "panic"],
            traceSteps: [
                { line: 1, variables: { m: '{"a": 1}' }, explanation: "Create map" },
                { line: 2, variables: { val: "0", ok: "false" }, explanation: "Key not found, zero value" },
                { line: 3, variables: {}, explanation: "Print '0 false'" }
            ],
            language: "go"
        }
    ],
    rust: [
        {
            title: "Option Unwrap",
            description: "Trace Option handling",
            code: `fn main() {
    let x: Option<i32> = Some(5);
    let y = x.unwrap_or(10);
    println!("{}", y);
}`,
            expectedOutput: "5",
            wrongOptions: ["10", "None", "panic"],
            traceSteps: [
                { line: 2, variables: { x: "Some(5)" }, explanation: "x has value 5" },
                { line: 3, variables: { y: "5" }, explanation: "Unwrap returns 5" },
                { line: 4, variables: {}, explanation: "Print 5" }
            ],
            language: "rust"
        },
        {
            title: "Vector Iteration",
            description: "Trace iter().sum()",
            code: `fn main() {
    let v = vec![1, 2, 3, 4];
    let sum: i32 = v.iter().sum();
    println!("{}", sum);
}`,
            expectedOutput: "10",
            wrongOptions: ["4", "[1,2,3,4]", "24"],
            traceSteps: [
                { line: 2, variables: { v: "[1, 2, 3, 4]" }, explanation: "Create vector" },
                { line: 3, variables: { sum: "10" }, explanation: "1+2+3+4=10" },
                { line: 4, variables: {}, explanation: "Print 10" }
            ],
            language: "rust"
        }
    ]
};

export function getRandomMentalExample(language: string): MentalExample {
    const examples = MENTAL_EXAMPLES[language] || MENTAL_EXAMPLES.python;
    if (examples.length === 0) return MENTAL_EXAMPLES.python[0];
    return examples[Math.floor(Math.random() * examples.length)];
}
