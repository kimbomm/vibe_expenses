import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { LedgersPage } from '@/pages/ledgers/LedgersPage'
import { LedgerFormPage } from '@/pages/ledgers/LedgerFormPage'
import { TransactionsPage } from '@/pages/transactions/TransactionsPage'
import { TransactionFormPage } from '@/pages/transactions/TransactionFormPage'
import { AssetsPage } from '@/pages/assets/AssetsPage'
import { AssetFormPage } from '@/pages/assets/AssetFormPage'
import { StatisticsPage } from '@/pages/statistics/StatisticsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { CategoriesPage } from '@/pages/settings/CategoriesPage'
import { MembersPage } from '@/pages/members/MembersPage'
import { InvitationsPage } from '@/pages/invitations/InvitationsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    loader: async () => {
      // 로그인 페이지 로드 시 redirect 결과 확인
      // 이렇게 하면 로그인 페이지에서도 redirect 결과를 처리할 수 있음
      return null
    },
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/ledgers" replace />,
      },
      {
        path: 'ledgers',
        element: <LedgersPage />,
      },
      {
        path: 'ledgers/:ledgerId/dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'ledgers/:ledgerId/transactions',
        element: <TransactionsPage />,
      },
      {
        path: 'ledgers/:ledgerId/assets',
        element: <AssetsPage />,
      },
      {
        path: 'ledgers/:ledgerId/statistics',
        element: <StatisticsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'ledgers/:ledgerId/settings/categories',
        element: <CategoriesPage />,
      },
      {
        path: 'ledgers/:ledgerId/members',
        element: <MembersPage />,
      },
      {
        path: 'invitations',
        element: <InvitationsPage />,
      },
    ],
  },
  // 모바일 전용 페이지 (Layout 없이 전체 화면, ProtectedRoute 적용)
  {
    path: 'ledgers/new',
    element: (
      <ProtectedRoute>
        <LedgerFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'ledgers/:ledgerId/edit',
    element: (
      <ProtectedRoute>
        <LedgerFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'ledgers/:ledgerId/transactions/new',
    element: (
      <ProtectedRoute>
        <TransactionFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'ledgers/:ledgerId/transactions/:transactionId/edit',
    element: (
      <ProtectedRoute>
        <TransactionFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'ledgers/:ledgerId/assets/new',
    element: (
      <ProtectedRoute>
        <AssetFormPage />
      </ProtectedRoute>
    ),
  },
  {
    path: 'ledgers/:ledgerId/assets/:assetId/edit',
    element: (
      <ProtectedRoute>
        <AssetFormPage />
      </ProtectedRoute>
    ),
  },
])
