# SocraticDev - Complete Design Document

## 1. Overview

### 1.1 System Purpose

SocraticDev is an AI-powered code learning platform that combines the Socratic teaching method with advanced code intelligence (GraphRAG) to create a comprehensive learning environment. The system provides interactive learning tools, spaced repetition, gamification, and context-aware AI assistance to help developers master programming concepts through deliberate practice and deep understanding.

### 1.2 Design Philosophy

**Core Principles:**
- **Learn by Thinking**: Guide users to discover answers through questions rather than direct instruction
- **Context-Aware Intelligence**: Understand entire codebase structure to provide relevant, accurate assistance
- **Deliberate Practice**: Provide varied challenge types that target specific skills
- **Long-term Retention**: Use spaced repetition to ensure knowledge sticks
- **Engaging Experience**: Gamify learning to maintain motivation and track progress

### 1.3 Technology Stack

**Frontend:**
- React 18.3.1 with TypeScript 5.3.3 for type-safe UI development
- Vite 5.1.0 for fast development and optimized production builds
- Tailwind CSS 3.4.1 for utility-first styling
- GSAP 3.14.2 and Framer Motion 12.26.2 for premium animations
- Zustand 4.5.0 for lightweight state management
- Monaco Editor 4.6.0 for code editing
- ReactFlow 11.11.4 for graph visualization
- @dnd-kit 6.3.1 for drag-and-drop interactions

**Backend:**
- FastAPI 0.104.1 with Python 3.11+ for high-performance API
- Neo4j 5.14.1 for graph database (code structure)
- Chroma 0.4.15 for vector database (semantic search)
- Redis 5.0.1 for caching and session management
- Celery 5.3.4 + RabbitMQ for async task processing
- Tree-sitter 0.21.3 for multi-language code parsing
- Google Gemini API for AI chat and embeddings

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Landing Page │  │ Learning Hub │  │  App Pages   │          │
│  │  (Marketing) │  │   (Tools)    │  │ (Chat/Build) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  The Dojo    │  │     SRS      │  │  Visualizer  │          │
│  │ (Challenges) │  │ (Flashcards) │  │ (Code Exec)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  Analytics   │  │ Gamification │                             │
│  │  (Progress)  │  │ (Leagues/XP) │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                            │ REST API / Gemini API
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Upload     │  │    Query     │  │   Context    │          │
│  │   Service    │  │   Service    │  │  Retriever   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Code Parser  │  │    Graph     │  │    Vector    │          │
│  │(Tree-sitter) │  │   Service    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │  Embedding   │  │    Cache     │                             │
│  │  Generator   │  │   Service    │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────────┐
│                      Data & External Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Neo4j     │  │    Chroma    │  │  RabbitMQ    │          │
│  │  (Graph DB)  │  │ (Vector DB)  │  │  + Celery    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐                             │
│  │    Redis     │  │  Gemini API  │                             │
│  │   (Cache)    │  │ (AI/Embed)   │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Architecture

```
User Action → Frontend Component → State Management (Zustand)
                                          ↓
                                    API Request
                                          ↓
                              Backend Service Layer
                                    ↙    ↓    ↘
                            Graph DB  Vector DB  Cache
                                    ↘    ↓    ↙
                              Response Assembly
                                          ↓
                                  Frontend Update
                                          ↓
                                    UI Render
```


## 3. Frontend Architecture

### 3.1 Component Hierarchy

**Pages (Top-Level Routes):**
- `/` - LandingPage: Marketing page with animations
- `/learn` - LearningHub: Central navigation to all tools
- `/app` - AppPage: Socratic AI chat (Learning Mode)
- `/build` - BuildModePage: Direct AI assistant (Building Mode)
- `/dojo` - DojoPage: Challenge selection and execution
- `/visualizer` - CodeVisualizer: Code execution visualization
- `/srs` - SRSDashboard: Flashcard management
- `/srs/review` - ReviewSession: Active flashcard review
- `/analytics` - AnalyticsDashboard: Learning progress
- `/achievements` - GamificationHub: Leagues and achievements

**Feature Modules:**
- `features/chat/` - AI chat interface with message history
- `features/dojo/` - 10 challenge types with AI integration
- `features/srs/` - Spaced repetition system with SM-2 algorithm
- `features/visualizer/` - Code execution animation
- `features/analytics/` - Skill radar and progress tracking
- `features/gamification/` - XP, leagues, quests, achievements
- `features/upload/` - Project file upload
- `features/graph/` - Dependency graph visualization
- `features/search/` - Semantic code search
- `features/context/` - Context management panel

### 3.2 State Management Design

**Zustand Store Structure:**
```typescript
interface AppState {
  // UI State
  theme: 'light' | 'dark';
  isLoading: boolean;
  isSidebarOpen: boolean;
  
  // Mode State
  mode: 'learning' | 'building';
  setMode: (mode: 'learning' | 'building') => void;
  
  // Chat State
  conversations: Conversation[];
  currentConversationId: string | null;
  addMessage: (message: ChatMessage) => void;
  
  // Project State
  projectContext: ProjectContext | null;
  projectFiles: ProjectFile[];
  selectedFile: ProjectFile | null;
  dependencyGraph: DependencyGraph | null;
  
  // Metrics
  metrics: LearningMetrics;
  updateMetrics: (update: Partial<LearningMetrics>) => void;
}
```

**Persistence Strategy:**
- Theme, mode → localStorage (persist across sessions)
- Conversations → Memory only (cleared on refresh)
- SRS flashcards → localStorage with separate key
- Analytics data → localStorage with separate key
- Gamification stats → localStorage with separate key
- Dojo progress → localStorage with separate key

### 3.3 Routing Architecture

**React Router Configuration:**
```typescript
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/learn" element={<LearningHub />} />
  <Route path="/app" element={<AppPage />} />
  <Route path="/build" element={<BuildModePage />} />
  <Route path="/dojo" element={<DojoPage />}>
    <Route index element={<DojoHub />} />
    <Route path="parsons" element={<ParsonsChallenge />} />
    <Route path="surgery" element={<CodeSurgery />} />
    <Route path="eli5" element={<ELI5Challenge />} />
    <Route path="faded" element={<FadedExamples />} />
    <Route path="mental" element={<MentalCompiler />} />
    <Route path="rubber-duck" element={<RubberDuckDebugger />} />
    <Route path="translation" element={<CodeTranslation />} />
    <Route path="tdd" element={<TDDChallenge />} />
    <Route path="pattern" element={<PatternDetective />} />
    <Route path="bigo" element={<BigOBattle />} />
  </Route>
  <Route path="/visualizer" element={<CodeVisualizer />} />
  <Route path="/srs" element={<SRSDashboard />} />
  <Route path="/srs/review" element={<ReviewSession />} />
  <Route path="/analytics" element={<AnalyticsDashboard />} />
  <Route path="/achievements" element={<GamificationHub />} />
</Routes>
```


## 4. Backend Architecture

### 4.1 Service Layer Design

**Upload Service:**
- Handles project uploads (drag-drop, GitHub URL, zip)
- Creates upload sessions for async processing
- Validates file count (max 10,000 files)
- Triggers Celery tasks for background processing
- Provides status polling endpoint

**Code Parser Service:**
- Uses Tree-sitter for multi-language AST parsing
- Supports Python, JavaScript, TypeScript, Java, C++, C#
- Extracts entities: files, functions, classes, variables, imports
- Extracts relationships: CALLS, IMPORTS, DEFINES, EXTENDS, IMPLEMENTS, USES
- Handles syntax errors gracefully (continue processing)
- Disambiguates overloaded functions

**Graph Service:**
- Manages Neo4j database operations
- Creates projects, entities, relationships
- Executes graph traversal queries (callers, dependencies)
- Performs impact analysis with cycle detection
- Retrieves class hierarchies
- Provides graph visualization data
- Creates database indexes for performance

**Vector Service:**
- Manages Chroma vector database operations
- Stores 768-dimensional embeddings with metadata
- Performs semantic similarity search
- Finds similar entities
- Supports multi-project search
- Batch operations for efficiency

**Embedding Generator:**
- Generates embeddings using Gemini Embedding API
- Combines entity name, signature, docstring, body
- Handles rate limiting and retries
- Batch processing for efficiency

**Context Retriever:**
- Hybrid search: semantic (vector) + structural (graph)
- Ranks entities by relevance score
- Assembles context within token budget (8000 tokens)
- Includes source citations
- Prioritizes higher-ranked entities

**Query Service:**
- Coordinates operations across graph and vector services
- Provides unified API for frontend
- Handles caching via Cache Service
- Formats responses for visualization

**Cache Service:**
- Redis-based caching layer
- 5-minute TTL for query results
- Cache keys: callers, dependencies, impact, search, graph
- Invalidation on project updates

### 4.2 Async Task Processing

**Celery Tasks:**
```python
@celery.task
def process_project_upload(session_id, project_id, files):
    """
    1. Parse all files with Tree-sitter
    2. Extract entities and relationships
    3. Store in Neo4j atomically
    4. Generate embeddings with Gemini
    5. Store in Chroma
    6. Update session status
    """

@celery.task
def generate_embeddings_batch(entity_ids):
    """Generate embeddings for batch of entities"""

@celery.task
def update_project(project_id, changed_files):
    """Update project with changed files"""
```

### 4.3 API Endpoints

**Upload Endpoints:**
- `POST /api/upload/project` - Upload project files
- `POST /api/upload/github` - Upload from GitHub URL
- `GET /api/upload/status/{session_id}` - Get upload status

**Query Endpoints:**
- `POST /api/query/search` - Semantic code search
- `POST /api/query/context` - Retrieve context for AI
- `POST /api/query/callers` - Find function callers
- `POST /api/query/dependencies` - Find function dependencies
- `POST /api/query/impact` - Impact analysis
- `POST /api/query/hierarchy` - Class hierarchy

**Visualization Endpoints:**
- `POST /api/visualization/graph` - Get graph data for ReactFlow
- `GET /api/visualization/stats/{project_id}` - Project statistics

**Health Endpoints:**
- `GET /api/health` - Health check
- `GET /api/health/neo4j` - Neo4j connection status
- `GET /api/health/chroma` - Chroma connection status
- `GET /api/health/redis` - Redis connection status


## 5. Data Models

### 5.1 Core Data Models

**CodeEntity:**
```typescript
interface CodeEntity {
  id: string;
  project_id: string;
  entity_type: 'file' | 'function' | 'class' | 'variable' | 'import';
  name: string;
  file_path: string;
  start_line: number;
  end_line: number;
  signature?: string;
  docstring?: string;
  body?: string;
  language: 'python' | 'javascript' | 'typescript' | 'java' | 'cpp' | 'csharp';
  metadata: Record<string, any>;
}
```

**CodeRelationship:**
```typescript
interface CodeRelationship {
  source_id: string;
  target_id: string;
  relationship_type: 'CALLS' | 'IMPORTS' | 'DEFINES' | 'EXTENDS' | 'IMPLEMENTS' | 'USES';
  metadata: Record<string, any>;
}
```

**Flashcard (SRS):**
```typescript
interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: 'basic' | 'cloze' | 'code';
  language?: string;
  tags: string[];
  sourceType: 'manual' | 'chat' | 'dojo';
  createdAt: number;
  // SM-2 Algorithm fields
  interval: number;        // Days until next review
  repetitions: number;     // Successful reviews count
  easeFactor: number;      // Starts at 2.5
  nextReview: number;      // Timestamp
  lastReview?: number;
}
```

**Challenge (Dojo):**
```typescript
interface Challenge {
  id: string;
  type: 'parsons' | 'surgery' | 'eli5' | 'faded' | 'mental' | 
        'rubber-duck' | 'translation' | 'tdd' | 'pattern' | 'bigo';
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topic: string;
  language: string;
  points: number;
  timeLimit?: number;
}
```

**GamificationStats:**
```typescript
interface GamificationStats {
  totalXP: number;
  currentLeague: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  weeklyXP: number;
  dailyQuests: DailyQuest[];
  unlockedAchievements: string[];
  questsResetAt: number;
}
```

### 5.2 Neo4j Graph Schema

**Nodes:**
- Project: {id, name, user_id, created_at, file_count, entity_count, status}
- File: {id, project_id, path, language, lines_of_code}
- Function: {id, project_id, file_id, name, signature, start_line, end_line, docstring}
- Class: {id, project_id, file_id, name, start_line, end_line, docstring}
- Variable: {id, project_id, file_id, name, type, scope}
- Import: {id, project_id, file_id, module_name, imported_names}

**Relationships:**
- (File)-[:DEFINES]->(Function|Class|Variable)
- (Function)-[:CALLS]->(Function)
- (File)-[:IMPORTS]->(File|Import)
- (Class)-[:EXTENDS]->(Class)
- (Class)-[:IMPLEMENTS]->(Class)
- (Function)-[:USES]->(Variable)

**Indexes:**
```cypher
CREATE INDEX entity_function_name FOR (n:Function) ON (n.name)
CREATE INDEX entity_class_name FOR (n:Class) ON (n.name)
CREATE INDEX file_path FOR (n:File) ON (n.path)
CREATE INDEX project_id_function FOR (n:Function) ON (n.project_id)
CREATE INDEX project_id_class FOR (n:Class) ON (n.project_id)
CREATE INDEX project_id_file FOR (n:File) ON (n.project_id)
```

### 5.3 Chroma Vector Schema

**Collections:**
- One collection per project: `project_{project_id}_embeddings`

**Metadata:**
```typescript
{
  entity_id: string;
  entity_type: string;
  file_path: string;
  name: string;
  project_id: string;
}
```

**Embeddings:**
- 768 dimensions (Gemini text-embedding-004)
- Cosine similarity for search


## 6. Feature Designs

### 6.1 AI Chat System

**Learning Mode Design:**
- System prompt emphasizes Socratic questioning
- Temperature: 0.8 (more creative, exploratory)
- Response pattern: Ask 1-3 guiding questions before answers
- Question types: Conceptual, Comparative, Prediction, Reflection
- Context injection: Include relevant code from project

**Building Mode Design:**
- System prompt emphasizes direct solutions
- Temperature: 0.7 (balanced, focused)
- Response pattern: Production-ready code with brief explanations
- Standards: Type safety, error handling, edge cases
- Context injection: Include relevant code from project

**Chat Interface:**
- Message history with role indicators (user/assistant)
- Markdown rendering with syntax highlighting
- Code block copy buttons
- Streaming responses (progressive rendering)
- Context panel showing used entities

### 6.2 The Dojo - Challenge System

**Challenge Types:**

1. **Parsons Problems**: Drag-drop code blocks into correct order
   - Uses @dnd-kit for drag-and-drop
   - Includes distractor lines
   - Validates order against solution

2. **Code Surgery**: Find and fix bugs
   - AI generates buggy code
   - Bug types: logic, syntax, security, performance, edge-case
   - Hints available on request
   - Validates fixes

3. **ELI5 Mode**: Explain code simply
   - AI evaluates explanation quality
   - Checks for forbidden technical jargon
   - Grades on clarity and accuracy

4. **Fill the Blanks**: Complete code with missing parts
   - Progressive difficulty (more blanks)
   - Hints for each blank
   - Validates answers

5. **Mental Compiler**: Predict output
   - Show code, predict execution result
   - Multiple choice options
   - Step-by-step trace explanation

6. **Rubber Duck Debugger**: Explain to AI duck
   - Conversational debugging
   - AI asks clarifying questions
   - Guides to solution discovery

7. **Code Translation**: Translate between languages
   - Python ↔ JavaScript ↔ TypeScript ↔ Java
   - Validates functional equivalence
   - AI evaluates translation quality

8. **Test-Driven Development**: Write code for tests
   - Given test cases, write implementation
   - Validates all tests pass
   - Checks edge cases

9. **Pattern Detective**: Identify design patterns
   - Show code, identify pattern
   - Multiple choice or free response
   - Explains pattern benefits

10. **Big O Battle**: Identify algorithm complexity
    - Timed challenge
    - Multiple algorithms
    - Validates Big O notation

**AI Integration:**
- AI mode toggle for dynamic content generation
- Static mode uses pre-defined examples
- AI generates: code, bugs, tests, patterns
- AI evaluates: explanations, translations, solutions

### 6.3 Spaced Repetition System (SRS)

**SM-2 Algorithm Implementation:**
```typescript
function calculateNextReview(quality: Quality, card: Flashcard): Flashcard {
  let { interval, repetitions, easeFactor } = card;
  
  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    // Incorrect response - reset
    repetitions = 0;
    interval = 1;
  }
  
  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);
  
  const nextReview = Date.now() + interval * 24 * 60 * 60 * 1000;
  
  return { ...card, interval, repetitions, easeFactor, nextReview };
}
```

**Card Types:**
- Basic: Question → Answer
- Cloze: Text with [...] blanks
- Code: Code snippet → Explanation

**Card Sources:**
- Manual creation by user
- Auto-generated from chat conversations
- Auto-generated from completed Dojo challenges

**Review Session:**
- Show cards due today
- 4-button rating: Again, Hard, Good, Easy
- Track daily review count and streak
- Display progress: new, learning, review, mastered

### 6.4 Code Visualizer

**Features:**
- Step-by-step execution animation
- Call graph visualization (ReactFlow)
- Variable state tracking
- Execution trace display

**Supported Languages:**
- Python, JavaScript, TypeScript

**AI Integration:**
- AI analyzes code structure
- Generates execution trace
- Identifies function calls
- Tracks variable mutations

**Visualization:**
- Monaco Editor for code input
- ReactFlow for call graph
- Animated variable state panel
- Step controls: play, pause, step forward/back

### 6.5 Analytics Dashboard

**Metrics Tracked:**
- Total XP earned
- Skill radar (6 dimensions):
  - Algorithms
  - Data Structures
  - Debugging
  - Design Patterns
  - Testing
  - Architecture
- Learning streak (consecutive days)
- Time in Learning Mode vs Building Mode
- Questions asked
- Code explanations received
- Bugs caught
- Challenges completed

**Visualizations:**
- Skill radar chart (SVG)
- XP progression line chart
- Streak calendar heatmap
- Activity breakdown pie chart

### 6.6 Gamification System

**League System:**
- 5 tiers: Bronze (0 XP), Silver (500 XP), Gold (2000 XP), Platinum (5000 XP), Diamond (10000 XP)
- Automatic promotion based on XP
- Visual indicators: icons, colors, gradients

**Daily Quests:**
- 4 quest types: challenges, flashcards, streak, time
- Reset at midnight
- XP rewards on completion
- Progress tracking

**Achievements:**
- 16 achievements across 4 rarity tiers
- Common: First challenge, 5 challenges, first flashcard, 3-day streak
- Rare: 20 challenges, 50 flashcards, 7-day streak, Silver league
- Epic: 100 challenges, 30-day streak, Gold league, all Dojo types
- Legendary: 100-day streak, Diamond league, 1000 flashcards
- Unlock notifications with animations


## 7. GraphRAG System Design

### 7.1 Upload and Parsing Pipeline

**Upload Flow:**
```
User Upload → Validation → Session Creation → Celery Task
                                                    ↓
                                            Parse Files (Tree-sitter)
                                                    ↓
                                            Extract Entities
                                                    ↓
                                            Extract Relationships
                                                    ↓
                                            Store in Neo4j (Atomic)
                                                    ↓
                                            Generate Embeddings (Gemini)
                                                    ↓
                                            Store in Chroma
                                                    ↓
                                            Update Session Status
```

**Parsing Strategy:**
- Process files in parallel (Celery workers)
- Continue on individual file errors
- Collect all errors for final report
- Update progress incrementally
- Target: 100 files/minute

**Entity Extraction:**
- Functions: name, signature, docstring, body (500 chars)
- Classes: name, methods, inheritance, docstring
- Variables: name, type, scope
- Imports: module name, imported names

**Relationship Extraction:**
- CALLS: Function → Function (from function calls in body)
- IMPORTS: File → File/Module (from import statements)
- DEFINES: File → Function/Class/Variable (containment)
- EXTENDS: Class → Class (inheritance)
- IMPLEMENTS: Class → Interface (implementation)
- USES: Function → Variable (variable references)

### 7.2 Hybrid Search Design

**Semantic Search (Vector):**
1. Generate query embedding with Gemini
2. Search Chroma for similar entities (top 20)
3. Filter by similarity threshold (0.7)
4. Return ranked results

**Graph Search (Structural):**
1. Identify entities matching query keywords
2. Traverse graph neighborhood (depth 2)
3. Collect related entities
4. Return with graph distance

**Hybrid Ranking:**
```typescript
relevance_score = 0.7 * semantic_similarity + 0.3 * (1 / graph_distance)
```

**Context Assembly:**
1. Combine semantic and graph results
2. Rank by relevance score
3. Select entities until token budget (8000 tokens)
4. Format with source citations
5. Inject into AI prompt

### 7.3 Graph Traversal Queries

**Find Callers:**
```cypher
MATCH (caller)-[:CALLS]->(target {id: $function_id, project_id: $project_id})
WHERE caller.project_id = $project_id
RETURN caller
```

**Find Dependencies:**
```cypher
MATCH (source {id: $function_id, project_id: $project_id})-[:CALLS|USES]->(dep)
WHERE dep.project_id = $project_id
RETURN dep
```

**Impact Analysis:**
```cypher
MATCH path = (source {id: $function_id, project_id: $project_id})-[:CALLS*1..]->(dep)
WHERE length(path) <= $max_depth
  AND dep.project_id = $project_id
  AND ALL(node IN nodes(path) WHERE node.project_id = $project_id)
WITH dep, path, 
     length(path) AS depth,
     [node IN nodes(path) | node.id] AS node_ids
RETURN DISTINCT dep, depth, node_ids
ORDER BY depth
```

**Class Hierarchy:**
```cypher
// Parents
MATCH (c {id: $class_id})-[:EXTENDS|IMPLEMENTS]->(parent)
RETURN parent

// Children
MATCH (child)-[:EXTENDS|IMPLEMENTS]->(c {id: $class_id})
RETURN child
```

### 7.4 Caching Strategy

**Cache Keys:**
- `callers:{function_id}` - Function callers
- `deps:{function_id}` - Function dependencies
- `impact:{function_id}` - Impact analysis
- `search:{query_hash}:{project_ids}` - Semantic search
- `graph:{project_id}:{filter_hash}` - Graph visualization

**Cache Policy:**
- TTL: 5 minutes (300 seconds)
- Invalidation: On project update
- Storage: Redis with JSON serialization

**Cache Hit Optimization:**
- Cache expensive queries (impact analysis, graph viz)
- Skip cache for real-time data (upload status)
- Use cache for read-heavy operations


## 8. UI/UX Design

### 8.1 Design System

**Color Palette:**
- Primary (Terracotta): #E07A5F - CTAs, highlights
- Secondary (Deep Ocean): #3D5A80 - Headers, accents
- Accent (Sage Green): #81936A - Learning mode
- Neutral (Warm Grays): #FAFAF9 to #0F0E0D - Backgrounds, text

**Typography:**
- Display: Clash Display - Headlines, hero text
- Body: Space Grotesk - Body text, UI
- Mono: JetBrains Mono - Code, technical content

**Spacing Scale:**
- Base: 4px
- Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128

**Border Radius:**
- Small: 8px - Buttons, inputs
- Medium: 12px - Cards
- Large: 16px - Modals, panels
- XLarge: 24px - Hero sections

### 8.2 Component Patterns

**Card Pattern:**
```tsx
<div className="
  bg-[color:var(--color-bg-secondary)]
  border border-[color:var(--color-border)]
  rounded-xl p-6
  hover:shadow-lg hover:-translate-y-1
  transition-all duration-300
">
  {content}
</div>
```

**Button Pattern:**
```tsx
<button className="
  px-6 py-3 rounded-xl
  bg-primary-500 text-white
  hover:bg-primary-600
  active:scale-95
  transition-all duration-200
  font-semibold
">
  {label}
</button>
```

**Input Pattern:**
```tsx
<input className="
  w-full px-4 py-3 rounded-xl
  bg-[color:var(--color-bg-secondary)]
  border border-[color:var(--color-border)]
  focus:outline-none focus:ring-2 focus:ring-primary-500
  transition-all duration-200
" />
```

### 8.3 Animation Principles

**Timing:**
- Fast: 200ms - Micro-interactions (hover, click)
- Medium: 400ms - Transitions (page changes)
- Slow: 800ms - Reveals (scroll animations)

**Easing:**
- Ease-out: UI entering viewport
- Ease-in: UI leaving viewport
- Ease-in-out: Continuous animations
- Spring: Interactive elements (buttons, cards)

**Animation Types:**
- Fade: Opacity 0 → 1
- Slide: Y offset → 0
- Scale: Scale 0.9 → 1
- Rotate: Rotate 0 → 360
- Stagger: Delay between children

**Reduced Motion:**
- Respect `prefers-reduced-motion`
- Reduce animation duration to 200ms
- Reduce movement distance to 10px
- Disable continuous animations

### 8.4 Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile Optimizations:**
- Simplified animations (shorter duration, less distance)
- Touch-friendly targets (min 44x44px)
- Collapsible navigation
- Single-column layouts
- Reduced visual effects

**Desktop Enhancements:**
- Multi-column layouts
- Hover effects
- Parallax effects
- Custom cursor
- Keyboard shortcuts

### 8.5 Accessibility

**WCAG 2.1 Level AA Compliance:**
- Color contrast: 4.5:1 for text, 3:1 for UI
- Keyboard navigation: All interactive elements
- Screen reader support: Semantic HTML, ARIA labels
- Focus indicators: Visible focus rings
- Alt text: All images and icons

**Keyboard Shortcuts:**
- `/` - Focus search
- `Ctrl+K` - Command palette
- `Ctrl+B` - Toggle sidebar
- `Esc` - Close modals
- `Tab` - Navigate elements
- `Enter` - Activate buttons


## 9. Performance Optimization

### 9.1 Frontend Performance

**Code Splitting:**
- Route-based splitting (React.lazy)
- Component-based splitting for heavy features
- Dynamic imports for Monaco Editor, ReactFlow

**Bundle Optimization:**
- Tree shaking (Vite automatic)
- Minification (Terser)
- Compression (Gzip/Brotli)
- Target bundle size: < 500KB initial load

**Asset Optimization:**
- Image lazy loading
- SVG optimization
- Font subsetting
- Icon sprite sheets

**Rendering Optimization:**
- Virtual scrolling for long lists
- Memoization (React.memo, useMemo, useCallback)
- Debouncing for search inputs
- Throttling for scroll events

**Animation Performance:**
- GPU acceleration (transform, opacity only)
- RequestAnimationFrame for custom animations
- Intersection Observer for scroll triggers
- Disable animations on low-end devices

### 9.2 Backend Performance

**Database Optimization:**
- Indexes on frequently queried fields
- Query result caching (Redis, 5min TTL)
- Connection pooling
- Query timeout limits (5s graph, 10s vector)

**API Optimization:**
- Response compression (Gzip)
- Pagination for large result sets
- Field selection (return only requested fields)
- Batch endpoints for multiple operations

**Async Processing:**
- Celery for long-running tasks
- Background job queue (RabbitMQ)
- Progress updates via polling
- Task result caching

**Caching Strategy:**
- L1: In-memory cache (FastAPI)
- L2: Redis cache (5min TTL)
- L3: Database query cache
- Invalidation on updates

### 9.3 Performance Targets

**Frontend:**
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

**Backend:**
- API response time p95: < 500ms (graph queries)
- API response time p95: < 1s (semantic search)
- Upload processing: > 100 files/minute
- Database query p95: < 500ms
- Cache hit rate: > 80%

**System:**
- Concurrent users: 100
- Uptime: > 99.5%
- Error rate: < 1%


## 10. Security Design

### 10.1 Authentication & Authorization

**Current State (Prototype):**
- No authentication implemented
- API keys exposed client-side
- Direct Gemini API calls from frontend

**Production Requirements:**
- JWT-based authentication
- OAuth integration (Google, GitHub)
- Backend proxy for API keys
- Rate limiting per user
- Session management

**Authorization Levels:**
- Anonymous: Landing page only
- Authenticated: All features
- Premium: Advanced features (future)

### 10.2 Input Validation

**Frontend Validation:**
- File upload size limits (10,000 files)
- File type validation (code files only)
- Input sanitization (XSS prevention)
- Form validation (required fields, formats)

**Backend Validation:**
- Request schema validation (Pydantic)
- SQL injection prevention (parameterized queries)
- Path traversal prevention (file uploads)
- Rate limiting (per IP, per user)

### 10.3 Data Security

**In Transit:**
- HTTPS for all API communications
- TLS 1.3 minimum
- Certificate pinning (mobile apps)

**At Rest:**
- Database encryption (Neo4j, Chroma)
- Encrypted backups
- Secure credential storage (environment variables)

**API Keys:**
- Never commit to version control
- Environment variables only
- Rotation policy (90 days)
- Separate keys per environment

### 10.4 Security Headers

**HTTP Headers:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**CORS Configuration:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://socraticdev.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```


## 11. Error Handling & Resilience

### 11.1 Error Categories

**Client Errors (4xx):**
- 400 Bad Request: Invalid input
- 401 Unauthorized: Missing/invalid auth
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource doesn't exist
- 429 Too Many Requests: Rate limit exceeded

**Server Errors (5xx):**
- 500 Internal Server Error: Unexpected error
- 502 Bad Gateway: Upstream service failure
- 503 Service Unavailable: Temporary outage
- 504 Gateway Timeout: Request timeout

### 11.2 Error Response Format

```typescript
interface ErrorResponse {
  error_code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  request_id: string;
}
```

**Example:**
```json
{
  "error_code": "PROJECT_NOT_FOUND",
  "message": "Project with ID 'abc123' not found",
  "details": {"project_id": "abc123"},
  "timestamp": "2026-01-25T10:30:00Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 11.3 Retry Strategy

**Database Operations:**
- Retry count: 3
- Backoff: Exponential (1s, 2s, 4s)
- Retry on: Connection errors, timeouts
- No retry on: Validation errors, not found

**API Calls (Gemini):**
- Retry count: 3
- Backoff: Exponential with jitter
- Retry on: Rate limits, 5xx errors
- No retry on: 4xx errors (except 429)

**Queue Processing:**
- Dead letter queue for failed tasks
- Max retries: 5
- Exponential backoff
- Alert on repeated failures

### 11.4 Graceful Degradation

**Partial Failures:**
- Continue processing on individual file errors
- Return partial results with error list
- Cache successful operations
- Retry failed operations separately

**Service Unavailability:**
- Fallback to cached data
- Display user-friendly error messages
- Provide retry options
- Log errors for monitoring

### 11.5 Monitoring & Alerting

**Metrics to Track:**
- Request rate, error rate, latency
- Database connection pool usage
- Cache hit/miss ratio
- Queue depth, processing time
- Memory usage, CPU usage

**Alerts:**
- Error rate > 5% (5min window)
- API latency p95 > 2s
- Database connection failures
- Queue depth > 1000
- Service health check failures

**Logging:**
- Structured JSON logs
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Include: timestamp, request_id, user_id, operation, duration
- Centralized logging (future: ELK stack)


## 12. Deployment Architecture

### 12.1 Development Environment

**Local Setup:**
```bash
# Frontend
cd frontend
npm install
npm run dev  # http://localhost:5173

# Backend
cd backend
pip install -r requirements.txt
docker-compose up -d  # Start Neo4j, Chroma, Redis, RabbitMQ
python -m src.main  # http://localhost:8000
```

**Docker Compose Services:**
- Neo4j: ports 7474 (HTTP), 7687 (Bolt)
- Chroma: port 8001
- Redis: port 6379
- RabbitMQ: ports 5672 (AMQP), 15672 (Management UI)
- PostgreSQL: port 5432 (Chroma metadata)

### 12.2 Production Deployment

**Frontend (Vercel/Netlify):**
- Build: `npm run build`
- Deploy: `dist/` folder
- Environment variables: `VITE_GEMINI_API_KEY`, `VITE_API_URL`
- CDN: Automatic (Vercel Edge Network)
- SSL: Automatic (Let's Encrypt)

**Backend (Docker + Cloud):**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Infrastructure Options:**

**Option 1: Current Stack (Neo4j, Chroma)**
- Backend: AWS ECS/Fargate or GCP Cloud Run
- Neo4j: Neo4j Aura (managed)
- Chroma: Self-hosted on EC2/Compute Engine
- Redis: AWS ElastiCache or GCP Memorystore
- RabbitMQ: AWS MQ or CloudAMQP

**Option 2: AWS-Native Stack (Future)**
- Backend: AWS Lambda (serverless)
- Graph DB: Amazon Neptune
- Vector DB: Amazon OpenSearch
- Cache: Amazon ElastiCache
- Queue: Amazon SQS
- AI: AWS Bedrock (Claude, Titan)

### 12.3 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - run: cd frontend && npm run test
      - uses: vercel/action@v1  # Deploy to Vercel

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && pytest
      - uses: docker/build-push-action@v4  # Build & push Docker image
```

### 12.4 Environment Configuration

**Development:**
```env
DEBUG=true
LOG_LEVEL=DEBUG
NEO4J_URI=bolt://localhost:7687
CHROMA_HOST=localhost
CHROMA_PORT=8001
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=xxx
```

**Production:**
```env
DEBUG=false
LOG_LEVEL=INFO
NEO4J_URI=bolt://neo4j.aura.com:7687
CHROMA_HOST=chroma.example.com
CHROMA_PORT=443
REDIS_URL=redis://elasticache.amazonaws.com:6379
GEMINI_API_KEY=xxx
SENTRY_DSN=xxx  # Error tracking
```

### 12.5 Scaling Strategy

**Horizontal Scaling:**
- Frontend: CDN edge caching (automatic)
- Backend: Multiple FastAPI instances behind load balancer
- Celery: Multiple worker instances
- Databases: Read replicas (Neo4j, Redis)

**Vertical Scaling:**
- Increase instance sizes for databases
- Optimize queries before scaling
- Monitor resource usage

**Auto-Scaling Triggers:**
- CPU usage > 70%
- Memory usage > 80%
- Request queue depth > 100
- Response time p95 > 2s


## 13. Testing Strategy

### 13.1 Frontend Testing

**Unit Tests (Vitest):**
- Utility functions (SM-2 algorithm, token counting)
- Custom hooks (useReducedMotion, useInViewAnimation)
- State management (Zustand store actions)
- Component logic (challenge validation)

**Component Tests (React Testing Library):**
- Button interactions
- Form submissions
- Modal open/close
- Navigation flows

**Integration Tests:**
- API integration (mock responses)
- LocalStorage persistence
- Route navigation
- State updates

**E2E Tests (Playwright - Future):**
- Complete user flows
- Challenge completion
- Flashcard review
- Project upload

### 13.2 Backend Testing

**Unit Tests (pytest):**
- Code parser entity extraction
- Graph service queries
- Vector service search
- Context retriever ranking
- SM-2 algorithm calculations

**Integration Tests:**
- Neo4j operations (testcontainers)
- Chroma operations (testcontainers)
- Redis caching
- Celery task execution
- API endpoints

**Property-Based Tests (Hypothesis):**
- Parse → serialize → parse (round-trip)
- Graph consistency (no orphaned nodes)
- Embedding dimensions (always 768)
- Token budget enforcement

**Performance Tests:**
- Upload processing rate (> 100 files/min)
- Query response time (p95 < 500ms)
- Concurrent user load (100 users)
- Memory usage under load

### 13.3 Test Coverage Targets

**Backend:**
- Overall: > 80%
- Services: > 90%
- API endpoints: > 85%
- Critical paths: 100%

**Frontend:**
- Overall: > 70%
- Utilities: > 90%
- Components: > 60%
- Critical flows: > 80%

### 13.4 Test Data

**Fixtures:**
- Sample code files (Python, JS, TS, Java)
- Pre-parsed entities and relationships
- Mock API responses
- Sample flashcards, challenges, achievements

**Factories:**
- CodeEntity factory
- Project factory
- User factory
- Challenge factory


## 14. Future Enhancements

### 14.1 AWS Integration Roadmap

**Phase 1: AWS Bedrock Integration**
- Replace Gemini with AWS Bedrock
- Support Claude models (Anthropic)
- Support Titan embeddings (Amazon)
- Allow user to choose AI provider
- Estimated effort: 2 weeks

**Phase 2: AWS Infrastructure Migration**
- Deploy backend to AWS Lambda (serverless)
- Migrate to Amazon Neptune (graph database)
- Migrate to Amazon OpenSearch (vector search)
- Use Amazon ElastiCache (Redis replacement)
- Use Amazon SQS (RabbitMQ replacement)
- Estimated effort: 4 weeks

**Phase 3: AWS AI Services**
- Amazon CodeWhisperer for code suggestions
- Amazon Comprehend for text analysis
- Amazon Translate for multi-language support
- Estimated effort: 3 weeks

### 14.2 Feature Roadmap

**Q1 2026:**
- User authentication (OAuth)
- Project sharing and collaboration
- Code review AI assistant
- Mobile app (React Native)

**Q2 2026:**
- Real-time collaboration (WebSockets)
- Team workspaces
- Advanced analytics (learning paths)
- Custom challenge creation

**Q3 2026:**
- Video tutorials integration
- Mentor matching system
- Certification program
- API for third-party integrations

**Q4 2026:**
- Enterprise features (SSO, SAML)
- White-label solution
- Advanced security (SOC 2 compliance)
- Multi-language support (i18n)

### 14.3 Technical Debt

**High Priority:**
- Implement backend proxy for API keys
- Add comprehensive error boundaries
- Improve test coverage (> 80%)
- Add E2E tests
- Implement proper authentication

**Medium Priority:**
- Optimize bundle size (< 500KB)
- Add service worker for offline support
- Implement proper logging infrastructure
- Add performance monitoring (Sentry)
- Database migration system

**Low Priority:**
- Refactor legacy components
- Improve TypeScript strict mode compliance
- Add Storybook for component documentation
- Implement design system tokens
- Add visual regression testing


## 15. Design Decisions & Rationale

### 15.1 Technology Choices

**Why React over Vue/Angular?**
- Largest ecosystem and community
- Best TypeScript support
- Excellent performance with concurrent rendering
- Rich animation library support (GSAP, Framer Motion)
- Strong hiring pool

**Why Vite over Create React App?**
- 10-100x faster dev server startup
- Hot Module Replacement (HMR) is instant
- Better build optimization
- Native ES modules support
- Smaller bundle sizes

**Why Zustand over Redux?**
- Simpler API (less boilerplate)
- Better TypeScript inference
- Smaller bundle size (1KB vs 10KB)
- No provider wrapper needed
- Easier to learn and maintain

**Why Neo4j over PostgreSQL for code structure?**
- Native graph queries (Cypher)
- Efficient relationship traversal
- Better for impact analysis
- Visualizes naturally
- Optimized for connected data

**Why Chroma over Pinecone/Weaviate?**
- Open source and self-hostable
- Simple Python API
- Good performance for < 1M vectors
- Easy local development
- No vendor lock-in

**Why FastAPI over Flask/Django?**
- Automatic API documentation (OpenAPI)
- Native async support
- Type hints with Pydantic
- Better performance (ASGI)
- Modern Python features

**Why Celery over AWS Lambda for async tasks?**
- Better for long-running tasks (> 15min)
- More control over execution
- Easier local development
- No cold start delays
- Cost-effective for high volume

### 15.2 Architecture Decisions

**Why Hybrid Search (Vector + Graph)?**
- Vector search finds semantically similar code
- Graph search finds structurally related code
- Combining both gives better context
- Relevance score balances both signals
- More accurate than either alone

**Why Client-Side State (localStorage)?**
- Faster load times (no server round-trip)
- Works offline
- Simpler architecture (no user database)
- Privacy-friendly (data stays local)
- Good for prototype/MVP

**Why Separate Frontend/Backend?**
- Independent scaling
- Technology flexibility
- Better separation of concerns
- Easier to maintain
- Can deploy separately

**Why Async Task Processing?**
- Upload processing takes minutes
- Don't block API requests
- Better user experience (polling)
- Can retry failed tasks
- Scales independently

### 15.3 Design Patterns

**Repository Pattern (Backend):**
- Abstracts database operations
- Easier to test (mock repositories)
- Can swap databases
- Consistent interface

**Service Layer Pattern (Backend):**
- Business logic separate from API
- Reusable across endpoints
- Easier to test
- Clear responsibilities

**Custom Hooks Pattern (Frontend):**
- Reusable stateful logic
- Cleaner components
- Easier to test
- Better composition

**Compound Component Pattern (Frontend):**
- Flexible component APIs
- Better encapsulation
- Easier to customize
- Clear relationships


## 16. API Design

### 16.1 RESTful Principles

**Resource Naming:**
- Plural nouns: `/api/projects`, `/api/entities`
- Hierarchical: `/api/projects/{id}/entities`
- Actions as verbs: `/api/query/search`, `/api/upload/project`

**HTTP Methods:**
- GET: Retrieve resources (idempotent)
- POST: Create resources or actions
- PUT: Update entire resource
- PATCH: Partial update
- DELETE: Remove resource

**Status Codes:**
- 200 OK: Successful GET, PUT, PATCH
- 201 Created: Successful POST
- 204 No Content: Successful DELETE
- 400 Bad Request: Invalid input
- 404 Not Found: Resource doesn't exist
- 500 Internal Server Error: Server error

### 16.2 Request/Response Format

**Request:**
```json
POST /api/query/search
Content-Type: application/json

{
  "query": "authentication middleware",
  "project_ids": ["proj_abc123"],
  "top_k": 20,
  "similarity_threshold": 0.7
}
```

**Response:**
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "results": [
    {
      "entity": {
        "id": "func_xyz789",
        "name": "authenticate_user",
        "file_path": "src/auth/middleware.py",
        "entity_type": "function"
      },
      "similarity_score": 0.92,
      "snippet": "def authenticate_user(username, password)..."
    }
  ],
  "total": 15,
  "query_time_ms": 234
}
```

### 16.3 Pagination

**Request:**
```
GET /api/projects?page=2&per_page=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "per_page": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": true
  }
}
```

### 16.4 Rate Limiting

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643723400
```

**Response (429):**
```json
{
  "error_code": "RATE_LIMIT_EXCEEDED",
  "message": "Rate limit exceeded. Try again in 60 seconds.",
  "retry_after": 60
}
```

### 16.5 Versioning

**URL Versioning:**
```
/api/v1/projects
/api/v2/projects
```

**Header Versioning (Future):**
```
Accept: application/vnd.socraticdev.v2+json
```


## 17. Monitoring & Observability

### 17.1 Metrics

**Application Metrics:**
- Request rate (requests/second)
- Error rate (errors/total requests)
- Response time (p50, p95, p99)
- Active users (concurrent)
- API endpoint usage

**Business Metrics:**
- User signups (daily, weekly, monthly)
- Challenges completed
- Flashcards reviewed
- Projects uploaded
- AI queries made

**Infrastructure Metrics:**
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Network I/O (bytes/sec)
- Database connections

### 17.2 Logging

**Log Levels:**
- DEBUG: Detailed diagnostic information
- INFO: General informational messages
- WARNING: Warning messages (non-critical)
- ERROR: Error messages (handled)
- CRITICAL: Critical errors (unhandled)

**Log Format (JSON):**
```json
{
  "timestamp": "2026-01-25T10:30:00.123Z",
  "level": "INFO",
  "logger": "api.upload",
  "message": "Project upload initiated",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "user_123",
  "project_id": "proj_abc",
  "duration_ms": 234,
  "metadata": {
    "file_count": 150,
    "total_size_mb": 12.5
  }
}
```

### 17.3 Tracing

**Distributed Tracing (Future):**
- OpenTelemetry integration
- Trace requests across services
- Identify bottlenecks
- Visualize request flow

**Trace Example:**
```
Request → API Gateway → Upload Service → Code Parser
                                       → Graph Service → Neo4j
                                       → Vector Service → Chroma
                                       → Embedding Generator → Gemini API
```

### 17.4 Alerting

**Alert Conditions:**
- Error rate > 5% (5min window)
- Response time p95 > 2s (5min window)
- Database connection failures (any)
- Queue depth > 1000 (5min window)
- Service health check failures (3 consecutive)
- Disk usage > 90%
- Memory usage > 90%

**Alert Channels:**
- Email (critical alerts)
- Slack (all alerts)
- PagerDuty (critical, on-call)
- SMS (critical, after hours)

### 17.5 Health Checks

**Liveness Probe:**
```
GET /api/health
Response: 200 OK
```

**Readiness Probe:**
```
GET /api/health/ready
Response: 200 OK (all dependencies healthy)
Response: 503 Service Unavailable (any dependency unhealthy)
```

**Dependency Checks:**
- Neo4j connection
- Chroma connection
- Redis connection
- RabbitMQ connection
- Gemini API availability


## 18. Documentation Strategy

### 18.1 Code Documentation

**Frontend:**
- JSDoc comments for complex functions
- Component prop types (TypeScript interfaces)
- README per feature module
- Inline comments for non-obvious logic

**Backend:**
- Docstrings for all public functions/classes (Google style)
- Type hints for all function parameters and returns
- README per service module
- Inline comments for complex algorithms

**Example:**
```python
def calculate_relevance_score(
    semantic_similarity: float,
    graph_distance: int,
    semantic_weight: float = 0.7
) -> float:
    """Calculate relevance score combining semantic and structural signals.
    
    Args:
        semantic_similarity: Cosine similarity score (0.0 to 1.0)
        graph_distance: Number of hops in graph (1 to infinity)
        semantic_weight: Weight for semantic signal (default: 0.7)
        
    Returns:
        Combined relevance score (0.0 to 1.0)
        
    Example:
        >>> calculate_relevance_score(0.9, 2, 0.7)
        0.78
    """
    graph_weight = 1.0 - semantic_weight
    graph_score = 1.0 / graph_distance
    return semantic_weight * semantic_similarity + graph_weight * graph_score
```

### 18.2 API Documentation

**OpenAPI/Swagger:**
- Auto-generated from FastAPI
- Available at `/docs` (Swagger UI)
- Available at `/redoc` (ReDoc)
- Includes request/response schemas
- Includes example requests

**Endpoint Documentation:**
- Description of purpose
- Request parameters
- Request body schema
- Response schema
- Error responses
- Example requests/responses

### 18.3 User Documentation

**Getting Started Guide:**
- Installation instructions
- Quick start tutorial
- Basic concepts
- First project upload
- First AI query

**Feature Guides:**
- The Dojo challenges (each type)
- Spaced repetition system
- Code visualizer
- Analytics dashboard
- Gamification system

**API Integration Guide:**
- Authentication
- Rate limits
- Error handling
- Best practices
- Code examples

### 18.4 Architecture Documentation

**System Overview:**
- High-level architecture diagram
- Component responsibilities
- Data flow diagrams
- Technology stack

**Design Documents:**
- Requirements (REQUIREMENTS_COMPLETE.md)
- Design (DESIGN_COMPLETE.md)
- API specifications
- Database schemas

**Deployment Guide:**
- Local development setup
- Production deployment
- Environment configuration
- Scaling strategies


## 19. Glossary

**Terms:**

- **GraphRAG**: Graph Retrieval-Augmented Generation - hybrid approach combining graph database and vector search for context retrieval
- **Socratic Method**: Teaching approach that uses questions to guide learners to discover answers themselves
- **SM-2 Algorithm**: Spaced repetition algorithm that schedules flashcard reviews based on recall difficulty
- **Tree-sitter**: Incremental parsing library for building syntax trees from source code
- **Embedding**: Vector representation of text/code in high-dimensional space (768 dimensions for Gemini)
- **Semantic Search**: Search based on meaning rather than exact keyword matching
- **Impact Analysis**: Determining what code will be affected by changes to a function
- **The Dojo**: Collection of 10 interactive coding challenges for deliberate practice
- **XP**: Experience Points - gamification currency earned through activities
- **League**: Tier in gamification system (Bronze, Silver, Gold, Platinum, Diamond)
- **AST**: Abstract Syntax Tree - tree representation of source code structure
- **Cypher**: Query language for Neo4j graph database
- **Cosine Similarity**: Measure of similarity between two vectors (0 to 1)
- **Token Budget**: Maximum number of tokens allowed in AI context (8000 tokens)
- **Hybrid Search**: Combining semantic (vector) and structural (graph) search
- **Context Injection**: Adding relevant code context to AI prompts
- **Ease Factor**: SM-2 algorithm parameter controlling review interval growth
- **Parsons Problem**: Coding challenge where blocks must be arranged in correct order
- **Code Surgery**: Challenge type focused on finding and fixing bugs
- **ELI5**: "Explain Like I'm 5" - simplifying complex concepts
- **Faded Examples**: Fill-in-the-blank coding exercises
- **Mental Compiler**: Predicting code output without running it
- **Rubber Duck Debugging**: Explaining code to find bugs
- **TDD**: Test-Driven Development - writing tests before implementation
- **Big O**: Notation for algorithm time/space complexity

## 20. References

**Technologies:**
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com
- GSAP: https://greensock.com/gsap
- Framer Motion: https://www.framer.com/motion
- Zustand: https://github.com/pmndrs/zustand
- FastAPI: https://fastapi.tiangolo.com
- Neo4j: https://neo4j.com
- Chroma: https://www.trychroma.com
- Tree-sitter: https://tree-sitter.github.io
- Google Gemini: https://ai.google.dev

**Algorithms:**
- SM-2 Algorithm: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
- Cosine Similarity: https://en.wikipedia.org/wiki/Cosine_similarity

**Design Patterns:**
- Repository Pattern: https://martinfowler.com/eaaCatalog/repository.html
- Service Layer: https://martinfowler.com/eaaCatalog/serviceLayer.html

**Best Practices:**
- REST API Design: https://restfulapi.net
- React Best Practices: https://react.dev/learn/thinking-in-react
- Python Best Practices: https://peps.python.org/pep-0008

## 21. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-25 | Kiro AI | Initial comprehensive design document |

---

**End of Design Document**
