import { opendb } from "./db.js"

export async function pobject<T extends Record<string, any>>(name: string) {
  const store = await opendb<{ key: string, val: any }>(name, 'key')

  return {
    async get(): Promise<T> {
      const entries = await store.all()
      return Object.fromEntries(entries.map(kv => [kv.key, kv.val])) as T
    },
    async set(o: T) {
      const newkeys = Object.keys(o)
      const entries = await store.all()
      const oldkeys = entries.map(e => e.key)
      const todelete = new Set(oldkeys).difference(new Set(newkeys))
      await Promise.all([
        ...[...todelete].map(key => store.del(key)),
        ...newkeys.map(key => store.set({ key, val: o[key] }))
      ])
    },
  }
}

export async function kvs<T extends Record<string, any>>(name: string) {
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
