import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { LedgersPage } from '@/pages/ledgers/LedgersPage'
import { TransactionsPage } from '@/pages/transactions/TransactionsPage'
import { AssetsPage } from '@/pages/assets/AssetsPage'
import { StatisticsPage } from '@/pages/statistics/StatisticsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

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
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'ledgers',
        element: <LedgersPage />,
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
    ],
  },
])
