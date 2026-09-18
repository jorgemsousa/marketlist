export const CATEGORY_MAP: Record<string, string> = {
  bebida: "Adega e Bebidas",
  refrigerante: "Adega e Bebidas",
  suco: "Adega e Bebidas",
  água: "Adega e Bebidas",
  leite: "Frios e Laticínios",
  laticínio: "Frios e Laticínios",
  queijo: "Frios e Laticínios",
  iogurte: "Frios e Laticínios",
  manteiga: "Frios e Laticínios",
  carne: "Açougue",
  frango: "Açougue",
  boi: "Açougue",
  porco: "Açougue",
  hort: "Hortifrúti",
  fruta: "Hortifrúti",
  legumes: "Hortifrúti",
  verdura: "Hortifrúti",
  padaria: "Padaria",
  pão: "Padaria",
  bolo: "Padaria",
  arroz: "Mercearia",
  feijão: "Mercearia",
  macarrão: "Mercearia",
  farinha: "Mercearia",
  açúcar: "Mercearia",
  sal: "Mercearia",
  óleo: "Mercearia",
  molho: "Mercearia",
  enlatado: "Mercearia",
  limpeza: "Limpeza Doméstica",
  detergente: "Limpeza Doméstica",
  sabão: "Limpeza Doméstica",
  higiene: "Higiene Pessoal e Beleza",
  shampoo: "Higiene Pessoal e Beleza",
  sabonete: "Higiene Pessoal e Beleza",
  pasta: "Higiene Pessoal e Beleza",
  pescado: "Pescados/Peixaria",
  peixe: "Pescados/Peixaria",
};

/**
 * Infere a categoria de um produto a partir de uma string de categorias ou descrição.
 */
export function inferCategory(categories?: string): string {
  if (!categories) return "Mercearia";
  const lower = categories.toLowerCase();
  for (const [keyword, cat] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return cat;
  }
  // Pega a primeira categoria da string separada por vírgulas
  const first = categories.split(",")[0]?.trim();
  return first || "Mercearia";
}
