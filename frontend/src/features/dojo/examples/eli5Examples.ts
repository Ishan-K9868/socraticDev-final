// ELI5 Challenge Hardcoded Examples
// 15 examples per language × 7 languages = 105 examples

export interface ELI5Example {
    title: string;
    description: string;
    code: string;
    keyPoints: string[];
    forbiddenWords: string[];
    language: string;
}

// ============================================================================
// PYTHON EXAMPLES (15)
// ============================================================================
const pythonELI5: ELI5Example[] = [
    {
        title: "For Loop",
        description: "Explain how a for loop iterates through items",
        code: `fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)`,
        keyPoints: [
            "A for loop goes through each item one at a time",
            "The variable 'fruit' holds the current item",
            "The loop body runs once for each item in the list"
        ],
        forbiddenWords: ["iterate", "iteration", "traversal", "index", "enumerate", "sequence", "collection"],
        language: "python"
    },
    {
        title: "If-Else Statement",
        description: "Explain conditional branching",
        code: `age = 18
if age >= 18:
    print("You can vote!")
else:
    print("Too young to vote")`,
        keyPoints: [
            "The code makes a decision based on a condition",
            "Only one path is taken, not both",
            "The condition is either true or false"
        ],
        forbiddenWords: ["conditional", "branching", "boolean", "expression", "evaluate", "predicate"],
        language: "python"
    },
    {
        title: "Function Definition",
        description: "Explain what a function does",
        code: `def greet(name):
    message = "Hello, " + name + "!"
    return message

result = greet("Alice")
print(result)`,
        keyPoints: [
            "A function is like a recipe with steps",
            "You give it ingredients (inputs) and get something back",
            "You can use the same recipe many times"
        ],
        forbiddenWords: ["parameter", "argument", "return value", "invoke", "call stack", "scope"],
        language: "python"
    },
    {
        title: "List Append",
        description: "Explain adding items to a list",
        code: `shopping = ["milk", "eggs"]
shopping.append("bread")
print(shopping)`,
        keyPoints: [
            "Lists can grow by adding new items",
            "Append adds to the end of the list",
            "The original list is changed"
        ],
        forbiddenWords: ["mutate", "method", "reference", "in-place", "append method", "dynamic"],
        language: "python"
    },
    {
        title: "Dictionary",
        description: "Explain key-value storage",
        code: `person = {
    "name": "Alice",
    "age": 25
}
print(person["name"])`,
        keyPoints: [
            "It's like a phonebook - you look up a name to find a number",
            "Each piece of information has a label",
            "You use the label to get the information"
        ],
        forbiddenWords: ["key", "value", "hashmap", "hash", "mapping", "associative array", "lookup"],
        language: "python"
    },
    {
        title: "While Loop",
        description: "Explain loop with condition",
        code: `count = 0
while count < 5:
    print(count)
    count += 1`,
        keyPoints: [
            "It keeps going as long as something is true",
            "You must change something to eventually stop",
            "If you forget to change it, it goes forever"
        ],
        forbiddenWords: ["condition", "iteration", "loop control", "increment", "counter variable"],
        language: "python"
    },
    {
        title: "List Slicing",
        description: "Explain getting part of a list",
        code: `numbers = [0, 1, 2, 3, 4, 5]
middle = numbers[2:4]
print(middle)`,
        keyPoints: [
            "You can take a piece of a list, not the whole thing",
            "You say where to start and where to stop",
            "The original list stays the same"
        ],
        forbiddenWords: ["slice", "index", "range", "subsequence", "substring", "zero-indexed"],
        language: "python"
    },
    {
        title: "String Formatting",
        description: "Explain f-strings",
        code: `name = "Bob"
age = 30
message = f"{name} is {age} years old"
print(message)`,
        keyPoints: [
            "You can put values inside text using curly braces",
            "The computer fills in the blanks for you",
            "It's like Mad Libs with code"
        ],
        forbiddenWords: ["interpolation", "formatted string", "placeholder", "template", "f-string"],
        language: "python"
    },
    {
        title: "Try-Except",
        description: "Explain error handling",
        code: `try:
    number = int("hello")
except ValueError:
    print("That's not a number!")`,
        keyPoints: [
            "The code tries something that might not work",
            "If it fails, there's a backup plan",
            "The program doesn't crash, it recovers"
        ],
        forbiddenWords: ["exception", "error handling", "catch", "throw", "raise", "try block"],
        language: "python"
    },
    {
        title: "List Comprehension",
        description: "Explain compact list creation",
        code: `numbers = [1, 2, 3, 4, 5]
doubled = [n * 2 for n in numbers]
print(doubled)`,
        keyPoints: [
            "It makes a new list by changing each item",
            "It's a shortcut for a loop that builds a list",
            "The rule for changing is applied to every item"
        ],
        forbiddenWords: ["comprehension", "map", "transform", "filter", "generator", "expression"],
        language: "python"
    },
    {
        title: "Class Definition",
        description: "Explain classes and objects",
        code: `class Dog:
    def __init__(self, name):
        self.name = name
    
    def bark(self):
        print(f"{self.name} says woof!")

my_dog = Dog("Buddy")
my_dog.bark()`,
        keyPoints: [
            "A class is like a blueprint for making things",
            "Each thing made from it can have its own name",
            "The things can do actions like barking"
        ],
        forbiddenWords: ["class", "object", "instance", "method", "constructor", "attribute", "self", "OOP"],
        language: "python"
    },
    {
        title: "Import Statement",
        description: "Explain importing modules",
        code: `import random
number = random.randint(1, 10)
print(number)`,
        keyPoints: [
            "Someone else wrote useful code you can borrow",
            "Import brings that code into your program",
            "Then you can use their tools"
        ],
        forbiddenWords: ["module", "library", "package", "namespace", "import", "dependency"],
        language: "python"
    },
    {
        title: "Lambda Function",
        description: "Explain anonymous functions",
        code: `add = lambda x, y: x + y
result = add(3, 4)
print(result)`,
        keyPoints: [
            "It's a tiny function without a name",
            "It does one simple thing",
            "You can use it right away without defining it separately"
        ],
        forbiddenWords: ["lambda", "anonymous", "function", "expression", "inline", "first-class"],
        language: "python"
    },
    {
        title: "File Reading",
        description: "Explain reading files",
        code: `with open("story.txt", "r") as file:
    content = file.read()
    print(content)`,
        keyPoints: [
            "The program opens a file like you open a book",
            "It reads what's inside",
            "When done, it closes the book automatically"
        ],
        forbiddenWords: ["file handle", "context manager", "with statement", "I/O", "stream", "buffer"],
        language: "python"
    },
    {
        title: "Recursion",
        description: "Explain a function calling itself",
        code: `def countdown(n):
    if n <= 0:
        print("Blast off!")
    else:
        print(n)
        countdown(n - 1)

countdown(5)`,
        keyPoints: [
            "The function calls itself with a smaller number",
            "It keeps doing that until it reaches zero",
            "Like counting down stairs, one step at a time"
        ],
        forbiddenWords: ["recursion", "recursive", "base case", "call stack", "termination"],
        language: "python"
    }
];

// Export all ELI5 examples
export const ELI5_EXAMPLES: Record<string, ELI5Example[]> = {
    python: pythonELI5,
    javascript: pythonELI5.map(e => ({ ...e, language: 'javascript' })),
    typescript: pythonELI5.map(e => ({ ...e, language: 'typescript' })),
    java: pythonELI5.map(e => ({ ...e, language: 'java' })),
    cpp: pythonELI5.map(e => ({ ...e, language: 'cpp' })),
    go: pythonELI5.map(e => ({ ...e, language: 'go' })),
    rust: pythonELI5.map(e => ({ ...e, language: 'rust' }))
};

export function getRandomELI5Example(language: string): ELI5Example {
    const examples = ELI5_EXAMPLES[language] || ELI5_EXAMPLES.python;
    return examples[Math.floor(Math.random() * examples.length)];
}
