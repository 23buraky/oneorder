import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { Category, CategoryTranslation, Locale } from "@one-order/database";
import { PrismaService } from "../../database/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import type { CategoryNode } from "./types/category-node.type";

type CategoryWithTranslations = Category & { translations: CategoryTranslation[] };

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getTree(locale: Locale): Promise<CategoryNode[]> {
    const categories = await this.prisma.client.category.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      include: { translations: { where: { locale } } },
    });

    const nodeById = new Map<string, CategoryNode>();
    for (const category of categories) {
      nodeById.set(category.id, this.toNode(category));
    }

    const roots: CategoryNode[] = [];
    for (const category of categories) {
      const node = nodeById.get(category.id) as CategoryNode;
      const parent = category.parentId ? nodeById.get(category.parentId) : undefined;
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async findBySlug(slug: string, locale: Locale): Promise<CategoryNode> {
    const category = await this.prisma.client.category.findFirst({
      where: { slug, isActive: true, deletedAt: null },
      include: {
        translations: { where: { locale } },
        children: {
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: "asc" },
          include: { translations: { where: { locale } } },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category "${slug}" not found`);
    }

    const node = this.toNode(category);
    node.children = category.children.map((child) => this.toNode(child));
    return node;
  }

  async create(dto: CreateCategoryDto): Promise<CategoryWithTranslations> {
    const existing = await this.prisma.client.category.findUnique({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`A category with slug "${dto.slug}" already exists`);
    }

    return this.prisma.client.category.create({
      data: {
        slug: dto.slug,
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        parentId: dto.parentId,
        translations: { create: dto.translations },
      },
      include: { translations: true },
    });
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryWithTranslations> {
    await this.getActiveOrThrow(id);

    if (dto.slug) {
      const existing = await this.prisma.client.category.findUnique({ where: { slug: dto.slug } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`A category with slug "${dto.slug}" already exists`);
      }
    }

    return this.prisma.client.category.update({
      where: { id },
      data: {
        slug: dto.slug,
        imageUrl: dto.imageUrl,
        sortOrder: dto.sortOrder,
        isActive: dto.isActive,
        parentId: dto.parentId,
        translations: dto.translations && {
          // Replace only the locales provided — leaves other locales untouched.
          upsert: dto.translations.map((translation) => ({
            where: { categoryId_locale: { categoryId: id, locale: translation.locale } },
            create: translation,
            update: translation,
          })),
        },
      },
      include: { translations: true },
    });
  }

  async remove(id: string): Promise<void> {
    await this.getActiveOrThrow(id);
    await this.prisma.client.category.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  private async getActiveOrThrow(id: string): Promise<Category> {
    const category = await this.prisma.client.category.findFirst({ where: { id, deletedAt: null } });
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }
    return category;
  }

  private toNode(category: CategoryWithTranslations): CategoryNode {
    const translation = category.translations[0];
    return {
      id: category.id,
      slug: category.slug,
      imageUrl: category.imageUrl,
      sortOrder: category.sortOrder,
      name: translation?.name ?? category.slug,
      description: translation?.description ?? null,
      seoTitle: translation?.seoTitle ?? null,
      seoDescription: translation?.seoDescription ?? null,
      children: [],
    };
  }
}
