import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { SUPPORTED_VISUALIZER_LANGUAGES } from './types';

interface CodeInputPanelProps {
    code: string;
    language: string;
    onCodeChange: (code: string) => void;
    onLanguageChange: (lang: string) => void;
    onAnalyze: () => void;
    isAnalyzing: boolean;
}

// Sample code snippets for each language
const SAMPLE_CODE: Record<string, string> = {
    python: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Main execution
result = factorial(5)
fib_result = fibonacci(6)
print(f"Factorial: {result}, Fibonacci: {fib_result}")`,

    javascript: `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}

function printArray(arr) {
    console.log(arr.join(', '));
}

const numbers = [64, 34, 25, 12, 22, 11, 90];
const sorted = bubbleSort([...numbers]);
printArray(sorted);`,

    typescript: `interface TreeNode {
    value: number;
    left?: TreeNode;
    right?: TreeNode;
}

function insertNode(root: TreeNode | undefined, value: number): TreeNode {
    if (!root) {
        return { value };
    }
    if (value < root.value) {
        root.left = insertNode(root.left, value);
    } else {
        root.right = insertNode(root.right, value);
    }
    return root;
}

function inorderTraversal(node: TreeNode | undefined): number[] {
    if (!node) return [];
    return [...inorderTraversal(node.left), node.value, ...inorderTraversal(node.right)];
}

let tree: TreeNode = { value: 50 };
[30, 70, 20, 40, 60, 80].forEach(v => tree = insertNode(tree, v));
console.log(inorderTraversal(tree));`,

    java: `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid;
            }
            if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return -1;
    }
    
    public static void main(String[] args) {
        int[] arr = {2, 3, 4, 10, 40};
        int result = search(arr, 10);
        System.out.println("Found at index: " + result);
    }
}`,

    cpp: `#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    vector<int> arr = {10, 7, 8, 9, 1, 5};
    quickSort(arr, 0, arr.size() - 1);
    for (int x : arr) cout << x << " ";
    return 0;
}`
};

function CodeInputPanel({
    code,
    language,
    onCodeChange,
    onLanguageChange,
    onAnalyze,
    isAnalyzing
}: CodeInputPanelProps) {
    const [, setShowSamples] = useState(false);

    const loadSampleCode = () => {
        const sample = SAMPLE_CODE[language] || SAMPLE_CODE.python;
        onCodeChange(sample);
        setShowSamples(false);
    };

    const getMonacoLanguage = (lang: string) => {
        const map: Record<string, string> = {
            python: 'python',
            javascript: 'javascript',
            typescript: 'typescript',
            java: 'java',
            cpp: 'cpp'
        };
        return map[lang] || 'plaintext';
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[color:var(--color-border)]">
                <div className="flex items-center gap-4">
                    <h3 className="font-semibold">Code Input</h3>

                    {/* Language Selector */}
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        {SUPPORTED_VISUALIZER_LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.id}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadSampleCode}
                        className="px-3 py-1.5 text-sm text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] transition-colors"
                    >
                        Load Sample
                    </button>

                    <button
                        onClick={onAnalyze}
                        disabled={isAnalyzing || !code.trim()}
                        className={`
                            px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all
                            ${isAnalyzing || !code.trim()
                                ? 'bg-primary-500/50 cursor-not-allowed'
                                : 'bg-primary-500 hover:bg-primary-600 text-white'
                            }
                        `}
                    >
                        {isAnalyzing ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                Visualize
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    language={getMonacoLanguage(language)}
                    value={code}
                    onChange={(value) => onCodeChange(value || '')}
                    theme="vs-dark"
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                        wordWrap: 'on'
                    }}
                />
            </div>
        </div>
    );
}

export default CodeInputPanel;
