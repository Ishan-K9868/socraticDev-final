import type { ReviewFile } from './codeReviewTypes';

// ─── 3 Sample Files for AI Code Review Simulation ──────────────────────────

export const REVIEW_FILES: ReviewFile[] = [
    {
        id: 'python-sort',
        name: 'sort_utils.py',
        language: 'python',
        description: 'A Python utility module with sorting helpers and data processing functions.',
        accentColor: '#3B82F6',
        qualityScore: 6.4,
        code: `import json
import os

def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

def load_data(filepath):
    f = open(filepath, 'r')
    data = json.load(f)
    return data

def process_records(records):
    result = []
    for i in range(len(records)):
        record = records[i]
        if record['status'] == 'active':
            record['score'] = record['points'] / record['total'] * 100
            result.append(record)
    return result

def save_output(data, path):
    with open(path, 'w') as f:
        f.write(str(data))`,
        comments: [
            { id: 'c1', line: 4, severity: 'warning', title: 'Inefficient Algorithm', message: 'bubble_sort is O(n²). Consider using Python\'s built-in sorted() which uses Timsort — O(n log n) average case.' },
            { id: 'c2', line: 13, severity: 'error', title: 'Resource Leak', message: 'File handle is never closed. Use a context manager: `with open(filepath) as f:` to ensure proper cleanup.' },
            { id: 'c3', line: 19, severity: 'suggestion', title: 'Non-Pythonic Loop', message: 'Use `for record in records:` instead of `for i in range(len(records))`. More readable and idiomatic.' },
            { id: 'c4', line: 22, severity: 'warning', title: 'Potential ZeroDivisionError', message: '`record[\'total\']` could be 0, causing a ZeroDivisionError. Add a guard: `if record[\'total\'] > 0`.' },
            { id: 'c5', line: 27, severity: 'info', title: 'Use json.dump()', message: '`str(data)` won\'t produce valid JSON. Use `json.dump(data, f)` for proper serialization.' },
        ],
    },
    {
        id: 'js-api',
        name: 'userController.js',
        language: 'javascript',
        description: 'A Node.js Express controller handling user authentication and profile endpoints.',
        accentColor: '#F59E0B',
        qualityScore: 5.8,
        code: `const express = require('express');
const db = require('../db');

async function login(req, res) {
  const { email, password } = req.body;
  const user = await db.query(
    "SELECT * FROM users WHERE email = '" + email + "'"
  );
  if (user && user.password === password) {
    const token = Math.random().toString(36);
    res.json({ token, user });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}

async function getProfile(req, res) {
  try {
    const user = await db.findById(req.params.id);
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Server error' });
  }
}

async function updateProfile(req, res) {
  const updates = req.body;
  await db.update('users', req.params.id, updates);
  res.json({ success: true });
}

module.exports = { login, getProfile, updateProfile };`,
        comments: [
            { id: 'c1', line: 7, severity: 'error', title: 'SQL Injection Vulnerability', message: 'String concatenation in SQL query allows injection attacks. Use parameterized queries: `db.query("SELECT * FROM users WHERE email = $1", [email])`.' },
            { id: 'c2', line: 9, severity: 'error', title: 'Plaintext Password Comparison', message: 'Comparing passwords in plaintext is a critical security flaw. Hash passwords with bcrypt and use `bcrypt.compare()`.' },
            { id: 'c3', line: 10, severity: 'error', title: 'Insecure Token Generation', message: '`Math.random()` is not cryptographically secure. Use `crypto.randomBytes(32).toString(\'hex\')` for auth tokens.' },
            { id: 'c4', line: 11, severity: 'warning', title: 'Sensitive Data Exposure', message: 'The entire user object (including password hash) is returned in the response. Filter sensitive fields before sending.' },
            { id: 'c5', line: 22, severity: 'warning', title: 'Insufficient Error Logging', message: '`console.log(err)` loses stack traces in production. Use a structured logger like Winston or Pino.' },
            { id: 'c6', line: 30, severity: 'warning', title: 'No Input Validation', message: 'Request body is passed directly to `db.update()` without validation. An attacker could modify any field, including roles.' },
        ],
    },
    {
        id: 'react-component',
        name: 'Dashboard.tsx',
        language: 'typescript',
        description: 'A React dashboard component with data fetching, state management, and chart rendering.',
        accentColor: '#8B5CF6',
        qualityScore: 7.1,
        code: `import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <button onClick={handleRefresh}>Refresh</button>
      <div>
        {data.metrics.map((m, i) => (
          <div key={i} style={{ margin: 10 }}>
            <span>{m.label}: {m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;`,
        comments: [
            { id: 'c1', line: 7, severity: 'warning', title: 'Missing Cleanup', message: 'The useEffect has no cleanup. If the component unmounts during fetch, it will try to update unmounted state. Use an AbortController.' },
            { id: 'c2', line: 8, severity: 'info', title: 'No Error Handling', message: 'The fetch call has no `.catch()` handler. Network errors will silently fail. Add error state and boundary.' },
            { id: 'c3', line: 16, severity: 'suggestion', title: 'Duplicate Fetch Logic', message: 'The fetch logic in `handleRefresh` duplicates the useEffect. Extract into a reusable `fetchData` function or use a custom hook.' },
            { id: 'c4', line: 25, severity: 'info', title: 'Plain Loading State', message: 'A raw `<div>Loading...</div>` is poor UX. Use a skeleton loader or spinner component for smoother perceived performance.' },
            { id: 'c5', line: 33, severity: 'warning', title: 'Index as Key', message: 'Using array index as key (`key={i}`) can cause rendering bugs if items reorder. Use a stable unique identifier like `m.id`.' },
        ],
    },
];
