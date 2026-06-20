import AsyncStorage from "@react-native-async-storage/async-storage";
import { incrementProductUsage, getMostUsedProductIds } from "../hooks/useProductUsage";

// Store inside the factory closure — doesn't leak between test files
const mockStore: Record<string, string> = {};

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
    },
  };
});

// Helper to reset the mock store
beforeEach(async () => {
  const keys = (await AsyncStorage.getAllKeys?.()) || [];
  for (const k of keys) {
    await AsyncStorage.removeItem(k);
  }
});

describe("useProductUsage", () => {
  it("should handle empty usage", async () => {
    const mostUsed = await getMostUsedProductIds();
    expect(mostUsed).toEqual([]);
  });

  it("should track product usage incrementally", async () => {
    await incrementProductUsage("prod-1");
    await incrementProductUsage("prod-1");
    await incrementProductUsage("prod-2");

    const mostUsed = await getMostUsedProductIds();
    expect(mostUsed[0]).toBe("prod-1");
    expect(mostUsed[1]).toBe("prod-2");
  });

  it("should return at most 8 items", async () => {
    for (let i = 0; i < 15; i++) {
      await incrementProductUsage(`prod-${i}`);
    }
    const mostUsed = await getMostUsedProductIds();
    expect(mostUsed.length).toBeLessThanOrEqual(8);
  });
});
