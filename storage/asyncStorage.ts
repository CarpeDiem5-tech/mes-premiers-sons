import { Platform } from 'react-native';
import RNAsyncStorage from '@react-native-async-storage/async-storage';

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memoryStorage = new Map<string, string>();

function withMemoryFallback(primaryStorage: StorageAdapter): StorageAdapter {
  return {
    getItem: async (key: string): Promise<string | null> => {
      try {
        const value = await primaryStorage.getItem(key);
        if (value !== null) return value;
      } catch {}
      return memoryStorage.get(key) ?? null;
    },
    setItem: async (key: string, value: string): Promise<void> => {
      memoryStorage.set(key, value);
      try {
        await primaryStorage.setItem(key, value);
      } catch {}
    },
    removeItem: async (key: string): Promise<void> => {
      memoryStorage.delete(key);
      try {
        await primaryStorage.removeItem(key);
      } catch {}
    },
  };
}

const webStorage: StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => localStorage.getItem(key),
  setItem: async (key: string, value: string): Promise<void> => {
    localStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    localStorage.removeItem(key);
  },
};

const nativeStorage: StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => RNAsyncStorage.getItem(key),
  setItem: async (key: string, value: string): Promise<void> => {
    await RNAsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    await RNAsyncStorage.removeItem(key);
  },
};

const storage: StorageAdapter = withMemoryFallback(
  Platform.OS === 'web' ? webStorage : nativeStorage
);

export default storage;
