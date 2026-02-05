// // services/article.service.ts

// import { 
//   Article, 
//   CreateArticleDto, 
//   UpdateArticleDto, 
//   ArticleFilters, 
//   PaginatedResponse,
//   Category,
//   Tag,
//   MediaDto
// } from '@/types/article.types';

// const API_BASE_URL = 'http://localhost:3000';

// class ArticleService {
//   private getAuthHeaders(): HeadersInit {
//     const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//     return {
//       'Content-Type': 'application/json',
//       ...(token && { Authorization: `Bearer ${token}` }),
//     };
//   }

//   async createArticle(data: CreateArticleDto): Promise<Article> {
//     const response = await fetch(`${API_BASE_URL}/api/articles`, {
//       method: 'POST',
//       headers: this.getAuthHeaders(),
//       body: JSON.stringify(data),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Erreur lors de la création de l\'article');
//     }

//     return response.json();
//   }

//   async updateArticle(id: number, data: UpdateArticleDto): Promise<Article> {
//     const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
//       method: 'PATCH',
//       headers: this.getAuthHeaders(),
//       body: JSON.stringify(data),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Erreur lors de la mise à jour de l\'article');
//     }

//     return response.json();
//   }

//   async deleteArticle(id: number): Promise<void> {
//     const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
//       method: 'DELETE',
//       headers: this.getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Erreur lors de la suppression de l\'article');
//     }
//   }

//   async getArticle(id: number): Promise<Article> {
//     const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
//       headers: this.getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Erreur lors de la récupération de l\'article');
//     }

//     return response.json();
//   }

//   async getArticles(filters?: ArticleFilters): Promise<PaginatedResponse<Article>> {
//     const queryParams = new URLSearchParams();
    
//     if (filters) {
//       Object.entries(filters).forEach(([key, value]) => {
//         if (value !== undefined && value !== null) {
//           if (Array.isArray(value)) {
//             value.forEach(v => queryParams.append(key, v.toString()));
//           } else {
//             queryParams.append(key, value.toString());
//           }
//         }
//       });
//     }

//     const response = await fetch(
//       `${API_BASE_URL}/api/articles?${queryParams.toString()}`,
//       {
//         headers: this.getAuthHeaders(),
//       }
//     );

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Erreur lors de la récupération des articles');
//     }

//     return response.json();
//   }

//   async getCategories(): Promise<Category[]> {
//     const response = await fetch(`${API_BASE_URL}/api/categories`, {
//       headers: this.getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Erreur lors de la récupération des catégories');
//     }

//     return response.json();
//   }

//   async getTags(): Promise<Tag[]> {
//     const response = await fetch(`${API_BASE_URL}/api/tags`, {
//       headers: this.getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Erreur lors de la récupération des tags');
//     }

//     return response.json();
//   }

//   async uploadFile(file: File): Promise<MediaDto> {
//     const formData = new FormData();
//     formData.append('file', file);

//     const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//     const response = await fetch(`${API_BASE_URL}/api/upload`, {
//       method: 'POST',
//       headers: {
//         ...(token && { Authorization: `Bearer ${token}` }),
//       },
//       body: formData,
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Erreur lors de l\'upload du fichier');
//     }

//     const data = await response.json();
    
//     return {
//       url: data.url,
//       filename: file.name,
//       mimetype: file.type,
//       size: file.size,
//     };
//   }

//   async likeArticle(id: number): Promise<Article> {
//     const response = await fetch(`${API_BASE_URL}/api/articles/${id}/like`, {
//       method: 'POST',
//       headers: this.getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Erreur lors du like de l\'article');
//     }

//     return response.json();
//   }

//   async incrementViews(id: number): Promise<void> {
//     const response = await fetch(`${API_BASE_URL}/api/articles/${id}/view`, {
//       method: 'POST',
//       headers: this.getAuthHeaders(),
//     });

//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message || 'Erreur lors de l\'incrémentation des vues');
//     }
//   }
// }

// export const articleService = new ArticleService();
// export default articleService;