import { Platform } from 'react-native';
import RNAsyncStorage from '@react-native-async-storage/async-storage';

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const webStorage: StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },
};

const nativeStorage: StorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await RNAsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await RNAsyncStorage.setItem(key, value);
    } catch {}
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await RNAsyncStorage.removeItem(key);
    } catch {}
  },
};

const storage: StorageAdapter = Platform.OS === 'web' ? webStorage : nativeStorage;

export default storage;
