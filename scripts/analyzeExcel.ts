/**
 * Excel 파일 분석 스크립트
 */

import XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const filePath = path.join(__dirname, '..', 'public', '🍪💛🐻 가계부-2025.xlsx')

console.log('Excel 파일 분석 시작...')
console.log('파일 경로:', filePath)

try {
  // 파일 읽기
  const workbook = XLSX.readFile(filePath)

  console.log('\n=== 시트 정보 ===')
  console.log('시트 개수:', workbook.SheetNames.length)
  workbook.SheetNames.forEach((name, index) => {
    console.log(`  ${index + 1}. ${name}`)
  })

  // 각 시트 분석
  workbook.SheetNames.forEach((sheetName, sheetIndex) => {
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, {
      raw: false,
      defval: '',
      header: 1, // 배열 형태로 가져오기 (헤더 확인용)
    }) as unknown[][]

    console.log(`\n=== 시트 "${sheetName}" 분석 ===`)
    console.log(`총 행 수: ${rows.length}`)

    if (rows.length > 0) {
      // 헤더 행 확인
      const headerRow = rows[0] as unknown[]
      console.log('\n헤더 행:')
      headerRow.forEach((cell, index) => {
        console.log(`  컬럼 ${index + 1}: "${cell}"`)
      })

      // 데이터 샘플 (최대 5행)
      console.log('\n데이터 샘플 (최대 5행):')
      const sampleRows = rows.slice(1, Math.min(6, rows.length))
      sampleRows.forEach((row, index) => {
        const rowData: Record<string, unknown> = {}
        headerRow.forEach((header, colIndex) => {
          rowData[String(header)] = row[colIndex] || ''
        })
        console.log(`  행 ${index + 2}:`, rowData)
      })

      // JSON 형태로도 변환 (컬럼명 매핑 확인용)
      const jsonRows = XLSX.utils.sheet_to_json(sheet, {
        raw: false,
        defval: '',
      })

      if (jsonRows.length > 0) {
        console.log('\nJSON 형태 샘플 (첫 번째 행):')
        console.log(JSON.stringify(jsonRows[0], null, 2))
      }

      // 월별 시트인 경우 실제 데이터 행 찾기
      if (sheetName.match(/^\d+월$/)) {
        console.log('\n--- 월별 시트 상세 분석 ---')
        // 실제 데이터가 있는 행 찾기 (빈 행이 아닌 행)
        const dataRows = rows.filter((row, idx) => {
          if (idx < 5) return false // 처음 5행은 헤더/설정
          const hasData = row.some((cell) => {
            const val = String(cell || '').trim()
            return (
              val !== '' && !['S', 'M', 'T', 'W', 'F', 'S', '누적', '합계', '대분류'].includes(val)
            )
          })
          return hasData
        })

        console.log(`실제 데이터가 있는 행: ${dataRows.length}개`)
        if (dataRows.length > 0) {
          console.log('\n데이터 샘플 (최대 3행):')
          dataRows.slice(0, 3).forEach((row, idx) => {
            const rowData: Record<string, unknown> = {}
            headerRow.forEach((header, colIndex) => {
              const val = row[colIndex]
              if (val !== undefined && String(val).trim() !== '') {
                rowData[String(header)] = val
              }
            })
            if (Object.keys(rowData).length > 0) {
              console.log(`  데이터 행 ${idx + 1}:`, rowData)
            }
          })
        }
      }
    }
  })

  console.log('\n=== 분석 완료 ===')
} catch (error) {
  console.error('파일 분석 실패:', error)
  process.exit(1)
}
