import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { useAuthStore } from '@/entities/user/model/store'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, user, loading: authLoading } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Popup 방식이므로 redirect 결과 확인 불필요

  // 로그인 성공 시 리다이렉트
  useEffect(() => {
    console.log('LoginPage - user:', user, 'authLoading:', authLoading)
    if (!authLoading && user) {
      console.log('LoginPage - 로그인 성공, /ledgers로 이동')
      navigate('/ledgers', { replace: true })
    }
  }, [user, authLoading, navigate])

  const handleLogin = async () => {
    try {
      console.log('handleLogin - 시작')
      setLoading(true)
      setError(null)
      // popup 방식이므로 페이지가 리다이렉트되지 않음
      console.log('handleLogin - signIn 호출 전')
      await signIn()
      console.log('handleLogin - signIn 호출 완료')
      // popup 방식이므로 여기 도달함
      // onAuthStateChanged가 자동으로 user를 설정하므로 별도 처리 불필요
    } catch (err) {
      console.error('로그인 실패:', err)
      setError('로그인에 실패했습니다. 다시 시도해주세요.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-primary">Vibe</CardTitle>
          <CardDescription className="text-base">나만의 스마트한 가계부</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="h-12 w-full text-base"
            size="lg"
          >
            {loading ? (
              '로그인 중...'
            ) : (
              <>
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 시작하기
              </>
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
