/**
 * AES-GCM 암호화/복호화 유틸리티
 * 가계부별 고유 키를 사용하여 민감 정보 암호화
 */

// Base64 인코딩/디코딩
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

/**
 * 새로운 AES-GCM 암호화 키 생성
 * @returns Base64로 인코딩된 키
 */
export async function generateEncryptionKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  )

  const exportedKey = await crypto.subtle.exportKey('raw', key)
  return arrayBufferToBase64(exportedKey)
}

/**
 * 키 캐시 (키 import 비용 절감)
 */
const keyCache = new Map<string, CryptoKey>()

/**
 * Base64 키 문자열을 CryptoKey 객체로 변환 (캐싱)
 */
async function importKey(keyBase64: string): Promise<CryptoKey> {
  // 캐시에서 먼저 확인
  const cached = keyCache.get(keyBase64)
  if (cached) return cached

  const keyBuffer = base64ToArrayBuffer(keyBase64)
  const key = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )

  // 캐시에 저장
  keyCache.set(keyBase64, key)
  return key
}

/**
 * 문자열 암호화
 * @param plainText 암호화할 평문
 * @param keyBase64 Base64로 인코딩된 암호화 키
 * @returns Base64로 인코딩된 암호문 (IV 포함)
 */
export async function encrypt(plainText: string, keyBase64: string): Promise<string> {
  if (!plainText) return ''

  const key = await importKey(keyBase64)
  const encoder = new TextEncoder()
  const data = encoder.encode(plainText)

  // 랜덤 IV 생성 (12 bytes for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  )

  // IV + 암호문을 합쳐서 저장
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)

  return arrayBufferToBase64(combined.buffer)
}

/**
 * 암호문 복호화
 * @param cipherText Base64로 인코딩된 암호문 (IV 포함)
 * @param keyBase64 Base64로 인코딩된 암호화 키
 * @returns 복호화된 평문
 */
export async function decrypt(cipherText: string, keyBase64: string): Promise<string> {
  if (!cipherText) return ''

  try {
    const key = await importKey(keyBase64)
    const combined = new Uint8Array(base64ToArrayBuffer(cipherText))

    // IV와 암호문 분리
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('복호화 실패:', error)
    // 복호화 실패 시 원본 반환 (마이그레이션 중 암호화되지 않은 데이터 처리)
    return cipherText
  }
}

/**
 * 숫자 암호화 (금액 등)
 */
export async function encryptNumber(value: number, keyBase64: string): Promise<string> {
  return encrypt(String(value), keyBase64)
}

/**
 * 암호화된 숫자 복호화
 */
export async function decryptNumber(cipherText: string, keyBase64: string): Promise<number> {
  const decrypted = await decrypt(cipherText, keyBase64)
  const num = Number(decrypted)
  return isNaN(num) ? 0 : num
}

/**
 * 암호화된 데이터인지 확인 (Base64 패턴 + 최소 길이)
 * 성능을 위해 정규식으로 빠르게 체크
 */
const BASE64_PATTERN = /^[A-Za-z0-9+/]+=*$/

export function isEncrypted(value: string): boolean {
  // 최소 길이: IV(12 bytes) + 최소 데이터 → Base64 인코딩 시 약 20자 이상
  if (!value || value.length < 20) return false
  // Base64 패턴 매칭 (atob보다 빠름)
  return BASE64_PATTERN.test(value)
}

/**
 * 키를 미리 로드하여 캐시에 저장 (배치 작업 전 호출)
 */
export async function preloadKey(keyBase64: string): Promise<void> {
  await importKey(keyBase64)
}
