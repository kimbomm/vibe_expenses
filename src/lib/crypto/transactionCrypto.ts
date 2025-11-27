/**
 * 거래 데이터 암호화/복호화 헬퍼
 */

import {
  encrypt,
  decrypt,
  encryptNumber,
  decryptNumber,
  isEncrypted,
  preloadKey,
} from './encryption'
import type { Transaction } from '@/types'

// 암호화할 거래 필드
const ENCRYPTED_FIELDS = ['amount', 'description', 'memo'] as const

/**
 * 거래 데이터 암호화 (저장 전)
 */
export async function encryptTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>,
  encryptionKey: string
): Promise<Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'>> {
  if (!encryptionKey) return transaction

  return {
    ...transaction,
    amount: (await encryptNumber(transaction.amount, encryptionKey)) as any,
    description: await encrypt(transaction.description, encryptionKey),
    memo: transaction.memo ? await encrypt(transaction.memo, encryptionKey) : undefined,
  }
}

/**
 * 거래 데이터 복호화 (조회 후)
 */
export async function decryptTransaction(
  transaction: Transaction,
  encryptionKey: string
): Promise<Transaction> {
  if (!encryptionKey) return transaction

  // amount가 문자열(암호화됨)인지 숫자인지 확인
  const amountIsEncrypted =
    typeof transaction.amount === 'string' && isEncrypted(transaction.amount as any)
  const descriptionIsEncrypted = isEncrypted(transaction.description)
  const memoIsEncrypted = transaction.memo && isEncrypted(transaction.memo)

  return {
    ...transaction,
    amount: amountIsEncrypted
      ? await decryptNumber(transaction.amount as any, encryptionKey)
      : transaction.amount,
    description: descriptionIsEncrypted
      ? await decrypt(transaction.description, encryptionKey)
      : transaction.description,
    memo: memoIsEncrypted ? await decrypt(transaction.memo!, encryptionKey) : transaction.memo,
  }
}

/**
 * 거래 목록 복호화 (배치 최적화)
 */
export async function decryptTransactions(
  transactions: Transaction[],
  encryptionKey: string
): Promise<Transaction[]> {
  if (!encryptionKey || transactions.length === 0) return transactions

  // 키를 미리 로드하여 캐싱 (첫 번째 복호화 딜레이 방지)
  await preloadKey(encryptionKey)

  // 병렬 복호화
  return Promise.all(transactions.map((t) => decryptTransaction(t, encryptionKey)))
}

/**
 * 거래 업데이트 데이터 암호화
 */
export async function encryptTransactionUpdate(
  updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>>,
  encryptionKey: string
): Promise<Partial<Omit<Transaction, 'id' | 'createdAt' | 'createdBy'>>> {
  if (!encryptionKey) return updates

  const encrypted = { ...updates }

  if (updates.amount !== undefined) {
    encrypted.amount = (await encryptNumber(updates.amount, encryptionKey)) as any
  }
  if (updates.description !== undefined) {
    encrypted.description = await encrypt(updates.description, encryptionKey)
  }
  if (updates.memo !== undefined) {
    encrypted.memo = await encrypt(updates.memo, encryptionKey)
  }

  return encrypted
}
