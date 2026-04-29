import { apiClient } from "../configs/axiosClient";
import type { ArticleResponse, ArticleCreateRequest } from "../types/article";

export const articleService = {
  getArticles: async (): Promise<ArticleResponse[]> => {
    const res = await apiClient.get("/articles");
    return res.data || [];
  },
  createArticle: async (payload: ArticleCreateRequest): Promise<ArticleResponse> => {
    const res = await apiClient.post("/articles", payload);
    return res.data;
  },
  publishArticle: async (article_id: number): Promise<ArticleResponse> => {
    const res = await apiClient.patch(`/articles/${article_id}/publish`);
    return res.data;
  },
  getPendingArticles: async (): Promise<ArticleResponse[]> => {
    const res = await apiClient.get(`/articles/pending`);
    return res.data || [];
  },
  deleteArticle: async (article_id: number): Promise<void> => {
    const res = await apiClient.delete(`/articles/${article_id}`);
    return res.data;
  },
};

export default articleService;
