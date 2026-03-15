export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface Review {
  _id: string;
  repoOwner: string;
  repoName: string;
  status: 'pending' | 'scanning' | 'analyzing' | 'completed' | 'failed';
  userId: string;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  issues?: any[];
}

export interface Deployment {
  _id: string;
  name: string;
  repoOwner: string;
  repoName: string;
  branch: string;
  repositoryUrl: string;
  subdomain: string;
  port: number;
  status: 'pending' | 'deploying' | 'deployed' | 'failed';
  deployedUrl?: string;
  owner: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebSocketEvents {
  // Review events
  'review:progress': (data: { message: string }) => void;
  'review:complete': (data: { review: Review; message: string }) => void;
  'review:error': (data: { message: string; error?: string }) => void;

  // Fix events
  'fix:progress': (data: { message: string }) => void;
  'fix:file': (data: { filename: string; content: string }) => void;
  'fix:complete': (data: { message: string }) => void;
  'fix:error': (data: { message: string; error?: string }) => void;

  // Deployment events
  'deployment:progress': (data: { message: string; step?: string }) => void;
  'deployment:log': (data: { message: string }) => void;
  'deployment:complete': (data: { url: string; project: Deployment }) => void;
  'deployment:error': (data: { message: string; error?: string }) => void;

  // Connection events
  connect: () => void;
  disconnect: () => void;
  error: (error: Error) => void;
}
