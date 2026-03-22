/**
 * Demo-safe DB stub — never imports @prisma/client.
 * All production code paths are guarded by isDemoMode() and use dynamic imports.
 * In a real deployment, replace this file with the real Prisma client.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noop = async (): Promise<any> => null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noopArray = async (): Promise<any[]> => []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const noopCount = async (): Promise<number> => 0

function model() {
  return {
    findUnique: noop,
    findMany: noopArray,
    findFirst: noop,
    create: noop,
    update: noop,
    upsert: noop,
    delete: noop,
    count: noopCount,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = new Proxy({} as Record<string, unknown>, {
  get(_t, table: string) {
    if (table === '$transaction') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return async (ops: any[]) =>
        Promise.all(ops.map((op) => (typeof op === 'function' ? op(db) : op)))
    }
    return model()
  },
})
