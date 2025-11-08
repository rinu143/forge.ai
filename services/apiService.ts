const API_BASE_URL = '/api';

let authToken: string | null = localStorage.getItem('auth_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken() {
  return authToken;
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export const authAPI = {
  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const result = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(result.token);
    return result;
  },

  async login(data: LoginData): Promise<{ user: User; token: string }> {
    const result = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(result.token);
    return result;
  },

  async logout(): Promise<void> {
    await fetchAPI('/auth/logout', { method: 'POST' });
    setAuthToken(null);
  },
};

export const conversationAPI = {
  async getConversations(): Promise<Conversation[]> {
    return fetchAPI('/conversations');
  },

  async createConversation(title?: string): Promise<Conversation> {
    return fetchAPI('/conversations', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
    return fetchAPI(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ role, content }),
    });
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await fetchAPI(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  },
};
