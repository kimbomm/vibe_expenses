import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/widgets/layout/main-layout'
import { ProtectedRoute } from '@/features/auth-protected-route'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { LedgersPage } from '@/pages/ledgers/LedgersPage'
import { LedgerFormPage } from '@/pages/ledgers/LedgerFormPage'
import { TransactionsPage } from '@/pages/transactions/TransactionsPage'
import { TransactionFormPage } from '@/pages/transactions/TransactionFormPage'
import { ImportTransactionPage } from '@/pages/transactions/ImportTransactionPage'
import { ExportTransactionPage } from '@/pages/transactions/ExportTransactionPage'
import { AssetsPage } from '@/pages/assets/AssetsPage'
import { AssetDetailPage } from '@/pages/assets/AssetDetailPage'
import { AssetFormPage } from '@/pages/assets/AssetFormPage'
import { ExportAssetPage } from '@/pages/assets/ExportAssetPage'
import { StatisticsPage } from '@/pages/statistics/StatisticsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { CategoriesPage } from '@/pages/settings/CategoriesPage'
import { ImportCategoryPage } from '@/pages/settings/ImportCategoryPage'
import { MembersPage } from '@/pages/members/MembersPage'
import { InvitationsPage } from '@/pages/invitations/InvitationsPage'
import { TransactionSearchPage } from '@/pages/search/TransactionSearchPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
    loader: async () => {
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
        path: 'ledgers/new',
        element: <LedgerFormPage />,
      },
      {
        path: 'ledgers/:ledgerId/edit',
        element: <LedgerFormPage />,
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
        path: 'ledgers/:ledgerId/transactions/new',
        element: <TransactionFormPage />,
      },
      {
        path: 'ledgers/:ledgerId/transactions/:transactionId/edit',
        element: <TransactionFormPage />,
      },
      {
        path: 'ledgers/:ledgerId/transactions/import',
        element: <ImportTransactionPage />,
      },
      {
        path: 'ledgers/:ledgerId/transactions/export',
        element: <ExportTransactionPage />,
      },
      {
        path: 'ledgers/:ledgerId/assets',
        element: <AssetsPage />,
      },
      {
        path: 'ledgers/:ledgerId/assets/new',
        element: <AssetFormPage />,
      },
      {
        path: 'ledgers/:ledgerId/assets/:assetId/edit',
        element: <AssetFormPage />,
      },
      {
        path: 'ledgers/:ledgerId/assets/:assetId',
        element: <AssetDetailPage />,
      },
      {
        path: 'ledgers/:ledgerId/assets/export',
        element: <ExportAssetPage />,
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
        path: 'ledgers/:ledgerId/settings/categories/import',
        element: <ImportCategoryPage />,
      },
      {
        path: 'ledgers/:ledgerId/members',
        element: <MembersPage />,
      },
      {
        path: 'invitations',
        element: <InvitationsPage />,
      },
      {
        path: 'search',
        element: <TransactionSearchPage />,
      },
    ],
  },
])
