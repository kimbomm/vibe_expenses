import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { LedgersPage } from '@/pages/ledgers/LedgersPage'
import { TransactionsPage } from '@/pages/transactions/TransactionsPage'
import { AssetsPage } from '@/pages/assets/AssetsPage'
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
])
