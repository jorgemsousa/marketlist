import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "@/src/database/firebaseConfig";

export interface EanProduct {
  id?: string;
  name: string;
  imageUrl: string;
  type: string;
  ean: string;
  brand?: string;
}

interface OpenFoodFactsResponse {
  product?: {
    product_name?: string;
    generic_name?: string;
    brands?: string;
    categories?: string;
    image_url?: string;
    code?: string;
  };
  status?: number;
  status_verbose?: string;
}

const CATEGORY_MAP: Record<string, string> = {
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

function inferCategory(categories?: string): string {
  if (!categories) return "Mercearia";
  const lower = categories.toLowerCase();
  for (const [keyword, cat] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return cat;
  }
  // Pega a primeira categoria da string separada por vírgulas
  const first = categories.split(",")[0]?.trim();
  return first || "Mercearia";
}

/**
 * Busca um produto no Firestore local pelo código EAN.
 */
async function searchLocalByEan(ean: string): Promise<EanProduct | null> {
  const q = query(collection(db, "products"), where("ean", "==", ean));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return {
    id: doc.id,
    name: doc.data().name || "",
    imageUrl: doc.data().imageUrl || "",
    type: doc.data().type || "Mercearia",
    ean: doc.data().ean || ean,
    brand: doc.data().brand || "",
  };
}

/**
 * Busca um produto na OpenFoodFacts API pelo código EAN.
 */
async function searchOpenFoodFacts(ean: string): Promise<EanProduct | null> {
  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${ean}.json`,
      { headers: { "User-Agent": "MarketlistApp/1.0" } }
    );
    const data: OpenFoodFactsResponse = await res.json();

    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const name = p.product_name || p.generic_name || "";
    const imageUrl = p.image_url || "";
    const categories = p.categories || "";

    return {
      name,
      imageUrl,
      type: inferCategory(categories),
      ean: p.code || ean,
      brand: p.brands || "",
    };
  } catch (err) {
    console.error("Erro ao buscar OpenFoodFacts:", err);
    return null;
  }
}

/**
 * Busca imagem alternativa na API do usuário (seunegocionanuvem)
 * e retorna como data URI base64.
 */
async function fetchImageFromCustomApi(ean: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api-produtos.seunegocionanuvem.com.br/api/${ean}`
    );
    const data = await res.json();
    if (data.imagem_base64 && data.mime_type) {
      return `data:${data.mime_type};base64,${data.imagem_base64}`;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Hook/utilitário para buscar produto por EAN.
 *
 * Fluxo:
 * 1. Busca no Firestore local (collection "products", campo "ean")
 * 2. Se não encontrar, busca na OpenFoodFacts
 * 3. Se OpenFoodFacts retornar dados, cria o produto no Firestore
 * 4. Retorna o produto (local ou recém-criado)
 */
export async function lookupByEan(
  ean: string
): Promise<{ product: EanProduct; isNew: boolean } | null> {
  // 1. Busca local
  const local = await searchLocalByEan(ean);
  if (local) return { product: local, isNew: false };

  // 2. Busca na OpenFoodFacts
  const off = await searchOpenFoodFacts(ean);
  if (off && off.name) {
    // Tenta buscar imagem da API customizada
    let imageUrl = off.imageUrl;
    if (!imageUrl) {
      const customImg = await fetchImageFromCustomApi(ean);
      if (customImg) imageUrl = customImg;
    }

    // 3. Salva no Firestore
    const docRef = await addDoc(collection(db, "products"), {
      name: off.name,
      imageUrl: imageUrl,
      type: off.type,
      ean: ean,
      brand: off.brand || "",
    });

    return {
      product: { ...off, id: docRef.id, imageUrl },
      isNew: true,
    };
  }

  // 4. Não encontrou — retorna null
  return null;
}

/**
 * Busca um produto manual (sem EAN) — fallback para scan sem resultado.
 */
export async function searchByName(name: string): Promise<EanProduct[]> {
  const q = query(
    collection(db, "products"),
    where("name", ">=", name),
    where("name", "<=", name + "\uf8ff")
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name || "",
    imageUrl: doc.data().imageUrl || "",
    type: doc.data().type || "Mercearia",
    ean: doc.data().ean || "",
    brand: doc.data().brand || "",
  }));
}
