import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
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

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Layout />,
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
    ],
  },
  // 모바일 전용 페이지 (Layout 없이 전체 화면)
  {
    path: 'ledgers/new',
    element: <LedgerFormPage />,
  },
  {
    path: 'ledgers/:ledgerId/edit',
    element: <LedgerFormPage />,
  },
  {
    path: 'ledgers/:ledgerId/transactions/new',
    element: <TransactionFormPage />,
  },
  {
    path: 'ledgers/:ledgerId/transactions/:transactionId/edit',
    element: <TransactionFormPage />,
  },
  {
    path: 'ledgers/:ledgerId/assets/new',
    element: <AssetFormPage />,
  },
  {
    path: 'ledgers/:ledgerId/assets/:assetId/edit',
    element: <AssetFormPage />,
  },
])
