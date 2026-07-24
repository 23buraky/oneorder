export interface CategoryNode {
  id: string;
  slug: string;
  imageUrl: string | null;
  sortOrder: number;
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  children: CategoryNode[];
}
