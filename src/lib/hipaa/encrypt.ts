/**
 * encrypt.ts
 *
 * Application-layer AES-256-GCM encryption for PHI fields.
 * All clinical text (transcripts, SOAP sections, chief complaint)
 * is encrypted before being written to the database.
 *
 * Key is sourced from PHI_ENCRYPTION_KEY env var (32-byte hex string).
 * This is separate from the database connection string.
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // bytes
const TAG_LENGTH = 16 // bytes

function getKey(): Buffer {
  const key = process.env.PHI_ENCRYPTION_KEY
  if (!key) throw new Error('PHI_ENCRYPTION_KEY environment variable is not set')
  const buf = Buffer.from(key, 'hex')
  if (buf.length !== 32) throw new Error('PHI_ENCRYPTION_KEY must be a 32-byte (64 hex char) key')
  return buf
}

/**
 * Encrypts a plaintext string. Returns a base64-encoded string containing
 * the IV, auth tag, and ciphertext packed together.
 *
 * Format: base64(iv[16] + tag[16] + ciphertext)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext
  const key = getKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  const combined = Buffer.concat([iv, tag, encrypted])
  return combined.toString('base64')
}

/**
 * Decrypts a base64-encoded encrypted string produced by encrypt().
 */
export function decrypt(encryptedBase64: string): string {
  if (!encryptedBase64) return encryptedBase64
  const key = getKey()
  const combined = Buffer.from(encryptedBase64, 'base64')
  const iv = combined.subarray(0, IV_LENGTH)
  const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const ciphertext = combined.subarray(IV_LENGTH + TAG_LENGTH)
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return decrypted.toString('utf8')
}

/**
 * Encrypts an object's specified PHI fields in place.
 * Returns a new object — does not mutate the input.
 */
export function encryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj }
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      result[field] = encrypt(result[field] as string) as T[keyof T]
    }
  }
  return result
}

/**
 * Decrypts an object's specified PHI fields in place.
 * Returns a new object — does not mutate the input.
 */
export function decryptFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj }
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      result[field] = decrypt(result[field] as string) as T[keyof T]
    }
  }
  return result
}
