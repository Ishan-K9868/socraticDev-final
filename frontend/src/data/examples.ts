// Example code samples for demonstration
export const EXAMPLE_PROJECTS = [
    {
        id: 'binary-search',
        name: 'Binary Search',
        language: 'python',
        filename: 'binary_search.py',
        description: 'Classic divide-and-conquer search algorithm',
        code: `def binary_search(arr: list, target: int) -> int:
    """
    Search for target in sorted array.
    Returns index if found, -1 otherwise.
    Time: O(log n), Space: O(1)
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = left + (right - left) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1


# Example usage
if __name__ == "__main__":
    numbers = [1, 3, 5, 7, 9, 11, 13, 15, 17]
    result = binary_search(numbers, 7)
    print(f"Found at index: {result}")  # Output: 3
`,
    },
    {
        id: 'react-hook',
        name: 'Custom React Hook',
        language: 'typescript',
        filename: 'useLocalStorage.ts',
        description: 'Persist state to localStorage with TypeScript',
        code: `import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to persist state in localStorage
 * @param key - Storage key
 * @param initialValue - Default value if no stored value exists
 */
function useLocalStorage<T>(key: string, initialValue: T) {
  // Get stored value or use initial
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(\`Error reading localStorage key "\${key}":\`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Update localStorage when value changes
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(\`Error setting localStorage key "\${key}":\`, error);
    }
  }, [key, storedValue]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue] as const;
}

export default useLocalStorage;

// Usage example:
// const [name, setName] = useLocalStorage('user-name', 'Guest');
`,
    },
    {
        id: 'api-client',
        name: 'API Client',
        language: 'typescript',
        filename: 'apiClient.ts',
        description: 'Type-safe API client with error handling',
        code: `/**
 * Type-safe API client with automatic error handling
 */

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = new URL(\`\${this.baseUrl}\${endpoint}\`);
    
    // Add query params
    if (config?.params) {
      Object.entries(config.params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: { ...this.defaultHeaders, ...config?.headers },
        body: data ? JSON.stringify(data) : undefined,
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: json.message || 'Request failed',
          status: response.status,
        };
      }

      return { data: json, error: null, status: response.status };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  post<T>(endpoint: string, data: unknown, config?: RequestConfig) {
    return this.request<T>('POST', endpoint, data, config);
  }

  put<T>(endpoint: string, data: unknown, config?: RequestConfig) {
    return this.request<T>('PUT', endpoint, data, config);
  }

  delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }
}

// Usage:
const api = new ApiClient('https://api.example.com');

// const { data, error } = await api.get<User[]>('/users');
// const { data } = await api.post<User>('/users', { name: 'John' });
`,
    },
    {
        id: 'tree-traversal',
        name: 'Binary Tree Traversal',
        language: 'python',
        filename: 'tree_traversal.py',
        description: 'Inorder, preorder, and postorder traversal',
        code: `from typing import Optional, List
from collections import deque

class TreeNode:
    def __init__(self, val: int = 0, left: 'TreeNode' = None, right: 'TreeNode' = None):
        self.val = val
        self.left = left
        self.right = right


def inorder_traversal(root: Optional[TreeNode]) -> List[int]:
    """Left -> Root -> Right"""
    result = []
    
    def traverse(node: Optional[TreeNode]):
        if not node:
            return
        traverse(node.left)
        result.append(node.val)
        traverse(node.right)
    
    traverse(root)
    return result


def preorder_traversal(root: Optional[TreeNode]) -> List[int]:
    """Root -> Left -> Right"""
    result = []
    
    def traverse(node: Optional[TreeNode]):
        if not node:
            return
        result.append(node.val)
        traverse(node.left)
        traverse(node.right)
    
    traverse(root)
    return result


def postorder_traversal(root: Optional[TreeNode]) -> List[int]:
    """Left -> Right -> Root"""
    result = []
    
    def traverse(node: Optional[TreeNode]):
        if not node:
            return
        traverse(node.left)
        traverse(node.right)
        result.append(node.val)
    
    traverse(root)
    return result


def level_order_traversal(root: Optional[TreeNode]) -> List[List[int]]:
    """BFS - Level by level"""
    if not root:
        return []
    
    result = []
    queue = deque([root])
    
    while queue:
        level = []
        for _ in range(len(queue)):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    
    return result


# Example: Create tree and test
#       1
#      / \\
#     2   3
#    / \\
#   4   5

root = TreeNode(1)
root.left = TreeNode(2, TreeNode(4), TreeNode(5))
root.right = TreeNode(3)

print(f"Inorder:   {inorder_traversal(root)}")   # [4, 2, 5, 1, 3]
print(f"Preorder:  {preorder_traversal(root)}")  # [1, 2, 4, 5, 3]
print(f"Postorder: {postorder_traversal(root)}") # [4, 5, 2, 3, 1]
print(f"Level:     {level_order_traversal(root)}") # [[1], [2, 3], [4, 5]]
`,
    },
];

// Quick prompts for different scenarios
export const QUICK_PROMPTS = {
    learning: [
        'How does a hash table work under the hood?',
        'Explain the difference between BFS and DFS',
        'What makes async/await better than callbacks?',
        'Why is immutability important in React?',
        'How do I optimize this algorithm?',
    ],
    building: [
        'Generate a REST API endpoint in Express',
        'Create a React form with validation',
        'Write unit tests for this function',
        'Implement a debounce function',
        'Add error handling to this code',
    ],
};
