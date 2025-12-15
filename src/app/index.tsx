import { RouterProvider } from 'react-router-dom'
import { router } from './router'

export function App() {
  // Popup 방식이므로 redirect 결과 확인 불필요
  // onAuthStateChanged가 자동으로 인증 상태를 관리함

  return <RouterProvider router={router} />
}
