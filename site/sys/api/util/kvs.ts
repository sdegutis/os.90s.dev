import { opendb } from "./db.js"

export async function kvs<T extends Record<string, any>>(name: string) {
  const store = await opendb<{ key: string, val: any }>(name, 'key')

  return {
    async get<K extends keyof T>(key: K) {
      const entry = await store.get(key as string)
      return entry?.val as T[K] | undefined
    },
    async set<K extends keyof T>(key: K, val: T[K]) {
      await store.set({ key: key as string, val })
    },
  }
}

export async function kvsMap<T extends Record<string, any>>(name: string) {
  const store = await opendb<{ key: string, val: any }>(name, 'key')

  return {
    async get(key: string) {
      const entry = await store.get(key)
      return entry?.val as T | undefined
    },
    async set(key: string, val: T) {
      await store.set({ key: key as string, val })
    },
  }
}
