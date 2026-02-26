import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

class APIClientError extends Error {
  status?: number;
  isNetworkError: boolean;

  constructor(message: string, status?: number, isNetworkError = false) {
    super(message);
    this.name = 'APIClientError';
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

function buildAnalyzerBaseCandidates(primaryBaseUrl: string): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();
  const push = (value: string) => {
    const normalized = trimTrailingSlash(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    candidates.push(normalized);
  };

  push(primaryBaseUrl);
  const primary = (() => {
    try {
      return new URL(primaryBaseUrl);
    } catch {
      return null;
    }
  })();

  const protocol = primary?.protocol || (typeof window !== 'undefined' ? window.location.protocol : 'http:');
  const trustedHosts = ['localhost', '127.0.0.1'];
  const trustedPorts = ['8002', '8000'];
  for (const host of trustedHosts) {
    for (const port of trustedPorts) {
      push(`${protocol}//${host}:${port}`);
    }
  }

  return candidates;
}

function shouldTryNextAnalyzerCandidate(error: unknown): boolean {
  if (error instanceof APIClientError) {
    if (error.isNetworkError) return true;
    return [404, 502, 503, 504].includes(error.status || 0);
  }
  return false;
}

// Types
export interface UploadProjectRequest {
  files: File[];
  projectName: string;
}

export interface UploadGithubRequest {
  githubUrl: string;
  projectName: string;
}

export interface UploadStatusResponse {
  session_id: string;
  project_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  errors?: string[];
  statistics?: {
    file_count: number;
    entity_count: number;
    relationship_count: number;
  };
  error?: string;
}

export interface FindCallersRequest {
  project_id: string;
  entity_name: string;
}

export interface FindDependenciesRequest {
  project_id: string;
  entity_name: string;
}

export interface ImpactAnalysisRequest {
  project_id: string;
  entity_name: string;
}

export interface SemanticSearchRequest {
  project_id: string;
  query: string;
  limit?: number;
}

export interface ContextRetrievalRequest {
  project_id: string;
  query: string;
  token_budget?: number;
}

export interface GraphVisualizationRequest {
  project_id: string;
  entity_types?: string[];
  languages?: string[];
  file_patterns?: string[];
  view_mode?: 'file' | 'symbol';
  include_external?: boolean;
  include_isolated?: boolean;
  max_nodes?: number;
  max_edges?: number;
}

export interface VisualizerAnalyzeRequest {
  mode: 'graph' | 'execution';
  code: string;
  language: string;
  max_steps?: number;
  timeout_ms?: number;
  allow_execution?: boolean;
}

export interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  statistics: {
    file_count: number;
    entity_count: number;
    relationship_count: number;
  };
}

export interface Entity {
  id: string;
  name: string;
  type: string;
  file_path: string;
  start_line: number;
  end_line: number;
  code?: string;
  similarity_score?: number;
  relevance_score?: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  file_path: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

export interface GraphVisualizationResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats?: {
    total_nodes: number;
    total_edges: number;
    files: number;
    functions: number;
    classes: number;
    imports: number;
    external_nodes: number;
    truncated: boolean;
    edge_types?: Record<string, number>;
    raw_nodes?: number;
    raw_edges?: number;
  };
  coverage?: {
    entities_in_project: number;
    entities_in_graph: number;
    relationships_in_project: number;
    relationships_in_graph: number;
  };
}

export interface ContextResponse {
  context: string;
  entities: Entity[];
  token_usage: {
    used: number;
    budget: number;
    remaining: number;
  };
}

// API Client Class
class GraphRAGAPIClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private analyzerBaseOverride: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as any;
        
        // Retry logic for network errors
        if (!config || !config.retry) {
          config.retry = 0;
        }

        if (config.retry < MAX_RETRIES && this.shouldRetry(error)) {
          config.retry += 1;
          await this.delay(RETRY_DELAY * config.retry);
          return this.client(config);
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx server errors
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const detail = (error.response.data as any)?.detail;
      const message = typeof detail === 'string'
        ? detail
        : detail?.message || error.message;
      return new APIClientError(`API Error (${error.response.status}): ${message}`, error.response.status, false);
    } else if (error.request) {
      return new APIClientError('Network Error: No response from server', undefined, true);
    } else {
      return new APIClientError(`Request Error: ${error.message}`, undefined, false);
    }
  }

  // Auth methods
  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  // Upload endpoints
  async uploadProject(request: UploadProjectRequest): Promise<{ session_id: string; project_id: string }> {
    const formData = new FormData();
    request.files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('project_name', request.projectName);

    const response = await this.client.post('/api/upload/project', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadFromGithub(request: UploadGithubRequest): Promise<{ session_id: string; project_id: string }> {
    const formData = new FormData();
    formData.append('github_url', request.githubUrl);
    formData.append('project_name', request.projectName);
    const response = await this.client.post('/api/upload/github', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getUploadStatus(sessionId: string): Promise<UploadStatusResponse> {
    const response = await this.client.get(`/api/upload/status/${sessionId}`);
    return response.data;
  }

  // Query endpoints
  async findCallers(request: FindCallersRequest): Promise<Entity[]> {
    const response = await this.client.post('/api/query/callers', request);
    return response.data;
  }

  async findDependencies(request: FindDependenciesRequest): Promise<Entity[]> {
    const response = await this.client.post('/api/query/dependencies', request);
    return response.data;
  }

  async impactAnalysis(request: ImpactAnalysisRequest): Promise<Entity[]> {
    const response = await this.client.post('/api/query/impact', request);
    return response.data;
  }

  async semanticSearch(request: SemanticSearchRequest): Promise<Entity[]> {
    const response = await this.client.post('/api/query/search', request);
    return response.data;
  }

  async retrieveContext(request: ContextRetrievalRequest): Promise<ContextResponse> {
    const response = await this.client.post('/api/query/context', request);
    return response.data;
  }

  // Project endpoints
  async listProjects(): Promise<Project[]> {
    const response = await this.client.get('/api/projects');
    return response.data;
  }

  async getProject(projectId: string): Promise<Project> {
    const response = await this.client.get(`/api/projects/${projectId}`);
    return response.data;
  }

  async updateProject(projectId: string, data: Partial<Project>): Promise<Project> {
    const response = await this.client.put(`/api/projects/${projectId}`, data);
    return response.data;
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.client.delete(`/api/projects/${projectId}`);
  }

  // Visualization endpoints
  async getGraphVisualization(request: GraphVisualizationRequest): Promise<GraphVisualizationResponse> {
    const response = await this.client.post('/api/visualization/graph', request);
    return response.data;
  }

  async analyzeVisualizer(request: VisualizerAnalyzeRequest): Promise<any> {
    const candidates = buildAnalyzerBaseCandidates(API_BASE_URL);
    const orderedCandidates = this.analyzerBaseOverride
      ? [this.analyzerBaseOverride, ...candidates.filter((base) => base !== this.analyzerBaseOverride)]
      : candidates;

    let lastError: unknown = null;
    for (const base of orderedCandidates) {
      try {
        const response = await this.client.post(`${base}/api/visualization/analyze`, request);
        this.analyzerBaseOverride = base;
        return response.data;
      } catch (error) {
        lastError = error;
        if (shouldTryNextAnalyzerCandidate(error)) {
          continue;
        }
        throw error;
      }
    }

    if (lastError instanceof Error) {
      throw new Error(`${lastError.message}. Tried analyzer endpoints: ${orderedCandidates.join(', ')}`);
    }
    throw new Error(`Analyzer request failed. Tried analyzer endpoints: ${orderedCandidates.join(', ')}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }
}

// Export singleton instance
export const graphragAPI = new GraphRAGAPIClient();

// Export types
export type { AxiosError };
