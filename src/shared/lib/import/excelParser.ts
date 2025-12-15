/**
 * Excel 파일 파서
 */

import * as XLSX from 'xlsx'
import { mapRowColumns } from './columnMapper'

export interface ParsedRow {
  [key: string]: unknown
}

/**
 * Excel 파일을 파싱하여 행 배열로 변환
 */
export function parseExcelFile(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          reject(new Error('파일을 읽을 수 없습니다.'))
          return
        }

        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          reject(new Error('시트를 찾을 수 없습니다.'))
          return
        }

        const sheet = workbook.Sheets[firstSheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, {
          raw: false, // 날짜는 문자열로 파싱
          defval: '', // 빈 셀은 빈 문자열로
        })

        // 컬럼명을 영문으로 매핑
        const mappedRows = rows.map((row) => mapRowColumns(row as Record<string, unknown>))

        resolve(mappedRows)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('파일 읽기 실패'))
    }

    reader.readAsArrayBuffer(file)
  })
}
