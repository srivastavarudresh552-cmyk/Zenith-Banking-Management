import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AccountsPage } from '../pages/AccountsPage';
import { TransferPage } from '../pages/TransferPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Layout } from './Layout';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/accounts',
        element: (
          <ProtectedRoute>
            <AccountsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/transfer',
        element: (
          <ProtectedRoute>
            <TransferPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
