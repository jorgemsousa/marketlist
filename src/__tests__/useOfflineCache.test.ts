import AsyncStorage from "@react-native-async-storage/async-storage";
import { cacheData, getCachedData, clearCache } from "../hooks/useOfflineCache";

jest.mock("@react-native-async-storage/async-storage", () => {
  const store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async (key: string) => store[key] ?? null),
      setItem: jest.fn(async (key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: jest.fn(async (key: string) => {
        delete store[key];
      }),
      getAllKeys: jest.fn(async () => Object.keys(store)),
      multiRemove: jest.fn(async (keys: string[]) => {
        keys.forEach((k) => delete store[k]);
      }),
    },
  };
});

describe("useOfflineCache", () => {
  beforeEach(async () => {
    await clearCache();
  });

  it("should cache and retrieve data", async () => {
    const data = { items: [1, 2, 3], name: "test" };
    await cacheData("test-key", data);
    const result = await getCachedData<typeof data>("test-key");
    expect(result).toEqual(data);
  });

  it("should return null for expired cache", async () => {
    const data = { x: 1 };
    await cacheData("expired-key", data, -1);
    const result = await getCachedData("expired-key");
    expect(result).toBeNull();
  });

  it("should return null for missing key", async () => {
    const result = await getCachedData("non-existent");
    expect(result).toBeNull();
  });

  it("should clear all cache entries", async () => {
    await cacheData("a", 1);
    await cacheData("b", 2);
    await clearCache();
    expect(await getCachedData("a")).toBeNull();
    expect(await getCachedData("b")).toBeNull();
  });
});
