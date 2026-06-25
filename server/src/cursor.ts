type Cursor = {
  createdAt: string
  id: number
}

export function encodeCursor(createdAt: Date, id: number): string {
  const payload: Cursor = { createdAt: createdAt.toISOString(), id }
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

export function decodeCursor(cursor: string): Cursor {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString())
  } catch {
    throw new Error('Invalid cursor')
  }
}