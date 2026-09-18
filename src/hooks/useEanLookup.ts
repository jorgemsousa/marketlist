import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "@/src/database/firebaseConfig";
import { inferCategory } from "@/src/utils/categoryHelper";
import { searchBluesoft } from "@/src/utils/bluesoftApi";

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

  // 2. Busca imagem na API customizada primeiro
  let customImageUrl: string | null = null;
  try {
    customImageUrl = await fetchImageFromCustomApi(ean);
  } catch {
    // silencioso
  }

  // 3. Busca na OpenFoodFacts para obter nome/categoria
  const off = await searchOpenFoodFacts(ean);
  if (off && off.name) {
    const imageUrl = customImageUrl || off.imageUrl;

    // 4. Salva no Firestore
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

  // 4b. Se não encontrou na OpenFoodFacts, busca na Bluesoft Cosmos API
  const bluesoft = await searchBluesoft(ean);
  if (bluesoft && bluesoft.name) {
    const imageUrl = customImageUrl || bluesoft.imageUrl;

    // Salva no Firestore
    const docRef = await addDoc(collection(db, "products"), {
      name: bluesoft.name,
      imageUrl: imageUrl,
      type: bluesoft.type,
      ean: ean,
      brand: bluesoft.brand || "",
    });

    return {
      product: { ...bluesoft, id: docRef.id, imageUrl },
      isNew: true,
    };
  }

  // 5. Não encontrou — retorna null
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
