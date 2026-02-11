export interface Tag {
  id: number;
  name: string;
}

export interface Content {
  id: number;
  title: string;
  description: string;
  type: 'image' | 'video';
  filePath: string;
  thumbnailPath: string | null;
  isPublic: boolean;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
}

export interface PaginatedResponse {
  data: Content[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateContentData {
  title: string;
  description: string;
  type: 'image' | 'video';
  file: File;
  tags?: string[];
  isPublic?: boolean;
}

export interface UpdateContentData {
  title?: string;
  description?: string;
  file?: File;
  tags?: string[];
  isPublic?: boolean;
}
