import axios from 'axios';
import { Content, PaginatedResponse, CreateContentData, UpdateContentData, Tag } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// コンテンツAPI
export const contentsApi = {
  // 一覧取得
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    keyword?: string;
    tag?: string;
  }): Promise<PaginatedResponse> => {
    const response = await api.get('/contents', { params });
    return response.data;
  },

  // 詳細取得
  getById: async (id: number): Promise<Content> => {
    const response = await api.get(`/contents/${id}`);
    return response.data;
  },

  // 作成
  create: async (data: CreateContentData): Promise<Content> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('type', data.type);
    formData.append('file', data.file);
    
    if (data.tags) {
      data.tags.forEach(tag => formData.append('tags[]', tag));
    }
    
    if (data.isPublic !== undefined) {
      formData.append('isPublic', String(data.isPublic));
    }

    const response = await api.post('/contents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 更新
  update: async (id: number, data: UpdateContentData): Promise<Content> => {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.file) formData.append('file', data.file);
    if (data.tags) {
      data.tags.forEach(tag => formData.append('tags[]', tag));
    }
    if (data.isPublic !== undefined) {
      formData.append('isPublic', String(data.isPublic));
    }

    const response = await api.put(`/contents/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 削除
  delete: async (id: number): Promise<void> => {
    await api.delete(`/contents/${id}`);
  },
};

// タグAPI
export const tagsApi = {
  // 一覧取得
  getAll: async (): Promise<Tag[]> => {
    const response = await api.get('/tags');
    return response.data;
  },
};

// メディアファイルのURLを取得
export const getMediaUrl = (filePath: string): string => {
  return `${API_BASE_URL}/${filePath}`;
};

export default api;
