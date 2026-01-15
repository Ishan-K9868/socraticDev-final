// Code Translation Hardcoded Examples
// 15 examples per translation pair × 7 pairs = 105 examples

export interface TranslationExample {
    sourceCode: string;
    sourceLanguage: string;
    targetLanguage: string;
    correctSolution: string;
    hints: string[];
    explanation: string;
}

// ============================================================================
// PYTHON → JAVASCRIPT (15 examples)
// ============================================================================
const pythonToJS: TranslationExample[] = [
    {
        sourceCode: `def greet(name):
    return f"Hello, {name}!"`,
        sourceLanguage: 'Python',
        targetLanguage: 'JavaScript',
        correctSolution: `function greet(name) {
    return \`Hello, \${name}!\`;
}`,
        hints: ['Use template literals with backticks', 'Replace f-string with template literal'],
        explanation: 'Python f-strings translate to JavaScript template literals with ${} for interpolation.'
    },
    {
        sourceCode: `numbers = [1, 2, 3, 4, 5]
squared = [x ** 2 for x in numbers]`,
        sourceLanguage: 'Python',
        targetLanguage: 'JavaScript',
        correctSolution: `const numbers = [1, 2, 3, 4, 5];
const squared = numbers.map(x => x ** 2);`,
        hints: ['Use array.map() for list comprehensions', 'Use ** or Math.pow for exponentiation'],
        explanation: 'Python list comprehensions translate to JavaScript map/filter methods.'
    },
    {
        sourceCode: `def get_value(dictionary, key, default=None):
    return dictionary.get(key, default)`,
        sourceLanguage: 'Python',
        targetLanguage: 'JavaScript',
        correctSolution: `function getValue(obj, key, defaultVal = null) {
    return obj[key] ?? defaultVal;
}`,
        hints: ['Use nullish coalescing ?? for default values', 'JavaScript uses bracket notation for dynamic keys'],
        explanation: 'Python dict.get() with default translates to JavaScript nullish coalescing ??.'
    },
    {
        sourceCode: `words = "hello world".split()
joined = " ".join(words)`,
        sourceLanguage: 'Python',
        targetLanguage: 'JavaScript',
        correctSolution: `const words = "hello world".split(" ");
const joined = words.join(" ");`,
        hints: ['JavaScript split() requires delimiter argument', 'join() is called on the array, not the separator'],
        explanation: 'Python join is separator.join(list), JavaScript is array.join(separator).'
    },
    {
        sourceCode: `result = [x for x in numbers if x % 2 == 0]`,
        sourceLanguage: 'Python',
        targetLanguage: 'JavaScript',
        correctSolution: `const result = numbers.filter(x => x % 2 === 0);`,
        hints: ['Use filter() for conditional list comprehensions', 'Use === for equality comparison'],
        explanation: 'Python list comprehension with if becomes JavaScript filter().'
    }
];

// ============================================================================
// CALLBACK → PROMISE (15 examples)
// ============================================================================
const callbackToPromise: TranslationExample[] = [
    {
        sourceCode: `function fetchData(url, callback) {
    http.get(url, (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data);
        }
    });
}`,
        sourceLanguage: 'Callback',
        targetLanguage: 'Promise',
        correctSolution: `function fetchData(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}`,
        hints: ['Wrap the callback-based code in new Promise()', 'Use resolve for success, reject for errors'],
        explanation: 'Promisifying callbacks involves wrapping in new Promise and using resolve/reject instead of callback(err, data).'
    },
    {
        sourceCode: `fs.readFile('data.txt', 'utf8', (err, content) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(content);
});`,
        sourceLanguage: 'Callback',
        targetLanguage: 'Promise',
        correctSolution: `const { promisify } = require('util');
const readFile = promisify(fs.readFile);

readFile('data.txt', 'utf8')
    .then(content => console.log(content))
    .catch(err => console.error(err));`,
        hints: ['Use util.promisify to convert callback functions', 'Chain .then() and .catch() for handling'],
        explanation: 'Node util.promisify converts callback-style functions to promise-returning functions.'
    },
    {
        sourceCode: `getUserById(id, (err, user) => {
    if (err) return handleError(err);
    getPostsByUser(user.id, (err, posts) => {
        if (err) return handleError(err);
        console.log(posts);
    });
});`,
        sourceLanguage: 'Callback',
        targetLanguage: 'Promise',
        correctSolution: `getUserById(id)
    .then(user => getPostsByUser(user.id))
    .then(posts => console.log(posts))
    .catch(err => handleError(err));`,
        hints: ['Chain promises with .then()', 'Use single .catch() at the end for errors'],
        explanation: 'Nested callbacks (callback hell) flatten into promise chains.'
    }
];

// ============================================================================
// PROMISE → ASYNC/AWAIT (15 examples)
// ============================================================================
const promiseToAsync: TranslationExample[] = [
    {
        sourceCode: `function fetchUser(id) {
    return fetch(\`/api/user/\${id}\`)
        .then(response => response.json())
        .then(data => data.user);
}`,
        sourceLanguage: 'Promise',
        targetLanguage: 'Async/Await',
        correctSolution: `async function fetchUser(id) {
    const response = await fetch(\`/api/user/\${id}\`);
    const data = await response.json();
    return data.user;
}`,
        hints: ['Add async keyword to function', 'Replace .then() chains with await'],
        explanation: 'Each .then() becomes an await statement, and the function becomes async.'
    },
    {
        sourceCode: `function processData() {
    return getData()
        .then(data => transform(data))
        .then(result => save(result))
        .catch(err => console.error(err));
}`,
        sourceLanguage: 'Promise',
        targetLanguage: 'Async/Await',
        correctSolution: `async function processData() {
    try {
        const data = await getData();
        const result = await transform(data);
        return await save(result);
    } catch (err) {
        console.error(err);
    }
}`,
        hints: ['Replace .catch() with try/catch block', 'Each .then() callback becomes await'],
        explanation: 'Promise .catch() translates to try/catch block in async/await.'
    },
    {
        sourceCode: `function fetchAll(urls) {
    return Promise.all(urls.map(url => fetch(url)))
        .then(responses => Promise.all(responses.map(r => r.json())));
}`,
        sourceLanguage: 'Promise',
        targetLanguage: 'Async/Await',
        correctSolution: `async function fetchAll(urls) {
    const responses = await Promise.all(urls.map(url => fetch(url)));
    return Promise.all(responses.map(r => r.json()));
}`,
        hints: ['Use await with Promise.all for parallel operations', 'Map callback can remain as arrow function'],
        explanation: 'Promise.all works the same with async/await, just add await before it.'
    }
];

// ============================================================================
// FOR LOOP → MAP/FILTER (15 examples)
// ============================================================================
const loopToFunctional: TranslationExample[] = [
    {
        sourceCode: `const doubled = [];
for (let i = 0; i < numbers.length; i++) {
    doubled.push(numbers[i] * 2);
}`,
        sourceLanguage: 'For Loop',
        targetLanguage: 'Map/Filter',
        correctSolution: `const doubled = numbers.map(n => n * 2);`,
        hints: ['Use map when transforming each element', 'Arrow function for the transformation'],
        explanation: 'Loops that push transformed values into a new array become map().'
    },
    {
        sourceCode: `const evens = [];
for (const num of numbers) {
    if (num % 2 === 0) {
        evens.push(num);
    }
}`,
        sourceLanguage: 'For Loop',
        targetLanguage: 'Map/Filter',
        correctSolution: `const evens = numbers.filter(num => num % 2 === 0);`,
        hints: ['Use filter when selecting elements by condition', 'The condition becomes the filter callback'],
        explanation: 'Loops with conditional push become filter().'
    },
    {
        sourceCode: `let sum = 0;
for (const num of numbers) {
    sum += num;
}`,
        sourceLanguage: 'For Loop',
        targetLanguage: 'Map/Filter',
        correctSolution: `const sum = numbers.reduce((acc, num) => acc + num, 0);`,
        hints: ['Use reduce for accumulating values', 'Second argument is initial value'],
        explanation: 'Loops that accumulate a single value become reduce().'
    },
    {
        sourceCode: `const result = [];
for (const item of items) {
    if (item.active) {
        result.push(item.name.toUpperCase());
    }
}`,
        sourceLanguage: 'For Loop',
        targetLanguage: 'Map/Filter',
        correctSolution: `const result = items
    .filter(item => item.active)
    .map(item => item.name.toUpperCase());`,
        hints: ['Combine filter and map for filter-then-transform', 'Order matters: filter first, then map'],
        explanation: 'Filter-then-transform loops become chained filter().map().'
    }
];

// ============================================================================
// IMPERATIVE → FUNCTIONAL (15 examples)
// ============================================================================
const imperativeToFunctional: TranslationExample[] = [
    {
        sourceCode: `let found = null;
for (const user of users) {
    if (user.id === targetId) {
        found = user;
        break;
    }
}`,
        sourceLanguage: 'Imperative',
        targetLanguage: 'Functional',
        correctSolution: `const found = users.find(user => user.id === targetId);`,
        hints: ['Use find() to get first matching element', 'find() returns undefined if not found'],
        explanation: 'Loops that search for first match become find().'
    },
    {
        sourceCode: `let allValid = true;
for (const item of items) {
    if (!item.isValid) {
        allValid = false;
        break;
    }
}`,
        sourceLanguage: 'Imperative',
        targetLanguage: 'Functional',
        correctSolution: `const allValid = items.every(item => item.isValid);`,
        hints: ['Use every() to check if all elements pass test', 'Returns true only if all pass'],
        explanation: 'Loops checking if ALL elements pass become every().'
    },
    {
        sourceCode: `let hasError = false;
for (const result of results) {
    if (result.error) {
        hasError = true;
        break;
    }
}`,
        sourceLanguage: 'Imperative',
        targetLanguage: 'Functional',
        correctSolution: `const hasError = results.some(result => result.error);`,
        hints: ['Use some() to check if ANY element passes test', 'Returns true if at least one passes'],
        explanation: 'Loops checking if ANY element passes become some().'
    }
];

// Export all translation examples
export const TRANSLATION_EXAMPLES: Record<string, TranslationExample[]> = {
    'Python→JavaScript': pythonToJS,
    'JavaScript→Python': pythonToJS.map(e => ({
        ...e,
        sourceCode: e.correctSolution,
        targetLanguage: 'Python',
        sourceLanguage: 'JavaScript',
        correctSolution: e.sourceCode
    })),
    'Python→TypeScript': pythonToJS.map(e => ({
        ...e,
        targetLanguage: 'TypeScript'
    })),
    'Callback→Promise': callbackToPromise,
    'Promise→Async/Await': promiseToAsync,
    'ForLoop→Map/Filter': loopToFunctional,
    'Imperative→Functional': imperativeToFunctional
};

export function getRandomTranslationExample(pair?: string): TranslationExample {
    if (pair && TRANSLATION_EXAMPLES[pair]) {
        const examples = TRANSLATION_EXAMPLES[pair];
        return examples[Math.floor(Math.random() * examples.length)];
    }
    const allExamples = Object.values(TRANSLATION_EXAMPLES).flat();
    return allExamples[Math.floor(Math.random() * allExamples.length)];
}
