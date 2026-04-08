import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TYPES, THEMES_FEM, THEMES_MAS } from "@/data/admin-options"

export function getFinalPrice(product: { priceFull: number, discountPct: number } | any): number {
  if (!product || typeof product.priceFull !== 'number') return 0;
  return product.priceFull * (1 - ((product.discountPct || 0) / 100));
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCategoryName(category: string): string {
  if (!category) return 'Desconhecido';
  if (category === 'FEM') return 'Feminino';
  if (category === 'MAS') return 'Masculino';
  return category;
}

export function getCategoryDetails(type: string): string {
  if (!type) return 'Acessório / Geral';
  const foundType = TYPES.find(t => t.value === type);
  return foundType ? foundType.label : 'Kit Exclusivo Customizado';
}

