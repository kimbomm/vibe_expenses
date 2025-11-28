/**
 * 거래내역 일괄 추가 로직
 */

import type { ValidatedTransaction } from './transactionValidator'
import type { Transaction } from '@/types/transaction'
import { useTransactionStore } from '@/stores/transactionStore'
import { useAuthStore } from '@/stores/authStore'

export interface ImportProgress {
  total: number
  processed: number
  success: number
  failed: number
  current?: string // 현재 처리 중인 항목
}

export interface ImportResult {
  success: number
  failed: number
  errors: Array<{ row: number; message: string }>
}

/**
 * 거래내역 일괄 추가
 * 배치 처리 (100건 단위)
 */
export async function importTransactions(
  transactions: ValidatedTransaction[],
  ledgerId: string,
  onProgress?: (progress: ImportProgress) => void
): Promise<ImportResult> {
  const user = useAuthStore.getState().user
  if (!user) {
    throw new Error('로그인이 필요합니다.')
  }

  const addTransaction = useTransactionStore.getState().addTransaction
  const total = transactions.length
  let processed = 0
  let success = 0
  const errors: Array<{ row: number; message: string }> = []

  // 배치 크기: 100건
  const BATCH_SIZE = 100

  for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
    const batch = transactions.slice(i, i + BATCH_SIZE)

    // 배치 내에서 순차 처리 (Firestore batch write 제한 고려)
    for (const transaction of batch) {
      try {
        const transactionData: Omit<Transaction, 'id' | 'createdAt' | 'createdBy' | 'updatedBy'> = {
          ledgerId,
          type: transaction.type,
          amount: transaction.amount,
          date: transaction.date,
          category1: transaction.category1,
          category2: transaction.category2,
          paymentMethod1: transaction.paymentMethod1,
          paymentMethod2: transaction.paymentMethod2,
          description: transaction.description,
          memo: transaction.memo,
        }

        await addTransaction(transactionData, user.uid)
        success++

        processed++
        onProgress?.({
          total,
          processed,
          success,
          failed: errors.length,
          current: `${processed}/${total}`,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
        errors.push({
          row: i + batch.indexOf(transaction) + 2, // Excel 행 번호 (헤더 제외, 1-based)
          message: errorMessage,
        })

        processed++
        onProgress?.({
          total,
          processed,
          success,
          failed: errors.length,
          current: `${processed}/${total}`,
        })
      }
    }
  }

  return {
    success,
    failed: errors.length,
    errors,
  }
}
