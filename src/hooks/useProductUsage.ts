import AsyncStorage from "@react-native-async-storage/async-storage";

const USAGE_KEY = "product_usage";
const MAIS_USADOS_LIMIT = 8;

type ProductUsage = Record<string, number>;

async function getUsage(): Promise<ProductUsage> {
  try {
    const raw = await AsyncStorage.getItem(USAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function incrementProductUsage(productId: string) {
  try {
    const usage = await getUsage();
    usage[productId] = (usage[productId] || 0) + 1;
    await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usage));
  } catch (error) {
    console.warn("Erro ao registrar uso do produto:", error);
  }
}

export async function getMostUsedProductIds(): Promise<string[]> {
  try {
    const usage = await getUsage();
    return Object.entries(usage)
      .sort(([, a], [, b]) => b - a)
      .slice(0, MAIS_USADOS_LIMIT)
      .map(([id]) => id);
  } catch {
    return [];
  }
}
