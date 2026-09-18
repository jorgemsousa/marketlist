import { EanProduct } from "@/src/hooks/useEanLookup";
import { inferCategory } from "./categoryHelper";

export interface BluesoftProductResponse {
  description: string;
  gtin: number;
  thumbnail?: string;
  brand?: {
    name?: string;
    picture?: string;
  };
  gpc?: {
    code?: string;
    description?: string;
  };
}

/**
 * Busca um produto na Bluesoft Cosmos API pelo código EAN.
 */
export async function searchBluesoft(ean: string): Promise<EanProduct | null> {
  const token = process.env.EXPO_PUBLIC_BLUESOFT_TOKEN;
  const userAgent = process.env.EXPO_PUBLIC_BLUESOFT_USER_AGENT || "Cosmos-API-Request";

  if (!token) {
    console.warn("Bluesoft API token não configurado (EXPO_PUBLIC_BLUESOFT_TOKEN).");
    return null;
  }

  try {
    const res = await fetch(`https://api.cosmos.bluesoft.com.br/gtins/${ean}.json`, {
      headers: {
        "X-Cosmos-Token": token,
        "User-Agent": userAgent,
        "Accept": "application/json",
      },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      console.error(`Erro na requisição Bluesoft: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: BluesoftProductResponse = await res.json();
    if (!data || !data.description) return null;

    // Se houver uma categoria/gpc.description, podemos usá-la. Caso contrário, usa a própria descrição.
    const categoryInfo = data.gpc?.description || data.description;

    return {
      name: data.description,
      imageUrl: data.thumbnail || "",
      type: inferCategory(categoryInfo),
      ean: String(data.gtin || ean),
      brand: data.brand?.name || "",
    };
  } catch (err) {
    console.error("Erro ao buscar na Bluesoft API:", err);
    return null;
  }
}
