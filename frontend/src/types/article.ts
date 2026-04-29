export interface ArticleResponse {
  id: number;
  title: string;
  content: string;
  author_id?: number;
  author_name?: string;
  published: boolean;
  created_at?: string;
  updated_at?: string;
  image_url?: string;
}

export interface ArticleCreateRequest {
  title: string;
  content?: string;
  author_name?: string;
}

export interface ArticlePendingResponse extends ArticleResponse {}

export interface ArticleListResponse extends Array<ArticleResponse> {}
