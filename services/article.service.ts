export interface Article {
  id: number;
  title: string;
  content: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  category: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  viewsCount: number;
  likes?: any[];
  bookmarks?: any[];
  comments?: any[];
}

export interface CreateArticleDto {
  title: string;
  content: string;
  categoryId: number;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  categoryId?: number;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

export interface SearchArticlesDto {
  q: string;
  limit?: number;
  minSimilarity?: number;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}

export interface SearchResponse {
  success: boolean;
  query: string;
  params: {
    limit: number;
    minSimilarity: number;
    status: string;
  };
  found: number;
  results: Article[];
}

export interface LikeResponse {
  success: boolean;
  message: string;
  article: {
    id: number;
    title: string;
    likesCount: number;
    isLiked: boolean;
  };
}

export interface BookmarkResponse {
  success: boolean;
  message: string;
  article: {
    id: number;
    title: string;
    bookmarksCount: number;
    isBookmarked: boolean;
  };
}

export interface UserArticlesResponse {
  success: boolean;
  count: number;
  articles: Array<{
    id: number;
    title: string;
    description: string;
    author: {
      id: number;
      name: string;
      avatar?: string;
    } | null;
    category: {
      id: number;
      name: string;
    } | null;
    createdAt: Date;
    likesCount: number;
    bookmarksCount: number;
  }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ArticleService {
  private getAuthHeaders(): HeadersInit {
    if (typeof window === 'undefined') return {};
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      // Gestion des erreurs HTTP
      if (response.status === 401) {
        // Token expiré ou invalide
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
    }
    
    return response.json() as Promise<T>;
  }

  async findAll(): Promise<Article[]> {
    const response = await fetch(`${API_URL}/articles`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    
    return this.handleResponse<Article[]>(response);
  }

  async findByCategory(categoryId: number): Promise<Article[]> {
    const articles = await this.findAll();
    return articles.filter(article => article.category?.id === categoryId);
  }

  async findOne(id: number): Promise<Article> {
    const response = await fetch(`${API_URL}/articles/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    
    return this.handleResponse<Article>(response);
  }

  async create(data: CreateArticleDto): Promise<Article> {
    const response = await fetch(`${API_URL}/articles`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<Article>(response);
  }

  async update(id: number, data: UpdateArticleDto): Promise<Article> {
    const response = await fetch(`${API_URL}/articles/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    return this.handleResponse<Article>(response);
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    
    return this.handleResponse<void>(response);
  }

  async incrementView(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/articles/${id}/view`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({}),
    });
    
    return this.handleResponse<void>(response);
  }

  async toggleLike(id: number): Promise<LikeResponse> {
    const response = await fetch(`${API_URL}/articles/${id}/like`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({}),
    });
    
    return this.handleResponse<LikeResponse>(response);
  }

  async toggleBookmark(id: number): Promise<BookmarkResponse> {
    const response = await fetch(`${API_URL}/articles/${id}/bookmark`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({}),
    });
    
    return this.handleResponse<BookmarkResponse>(response);
  }

  async getUserLikedArticles(): Promise<UserArticlesResponse> {
    const response = await fetch(`${API_URL}/articles/user/liked`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    
    return this.handleResponse<UserArticlesResponse>(response);
  }

  async getUserBookmarkedArticles(): Promise<UserArticlesResponse> {
    const response = await fetch(`${API_URL}/articles/user/bookmarked`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    
    return this.handleResponse<UserArticlesResponse>(response);
  }

  async getArticlesByUserId(userId: number): Promise<any[]> {
    const response = await fetch(`${API_URL}/articles/user/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
      credentials: 'include',
    });
    
    return this.handleResponse<any[]>(response);
  }

  // Recherche sémantique
  async semanticSearch(data: SearchArticlesDto): Promise<SearchResponse> {
    const response = await fetch(`${API_URL}/articles/search`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        q: data.q,
        limit: data.limit || 10,
        minSimilarity: data.minSimilarity || 0.72,
        status: data.status || 'PUBLISHED'
      }),
    });
    
    return this.handleResponse<SearchResponse>(response);
  }
}

export const articleService = new ArticleService();