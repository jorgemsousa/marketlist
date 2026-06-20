import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "cache_";
const DEFAULT_MAX_AGE_MS = 60 * 60 * 1000; // 1 hora

export async function cacheData(key: string, data: any, maxAgeMs = DEFAULT_MAX_AGE_MS) {
  try {
    await AsyncStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({ data, timestamp: Date.now(), maxAgeMs })
    );
  } catch (error) {
    console.warn("Erro ao salvar cache:", error);
  }
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const { data, timestamp, maxAgeMs } = JSON.parse(raw);
    if (Date.now() - timestamp > maxAgeMs) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null; // cache expirado
    }
    return data as T;
  } catch {
    return null;
  }
}

export async function clearCache() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.warn("Erro ao limpar cache:", error);
  }
}
