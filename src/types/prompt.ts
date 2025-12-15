export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  json: string;
  version: number;
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
}
