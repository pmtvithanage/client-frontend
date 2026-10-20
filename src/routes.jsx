import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import LoadingSkeleton from './components/common/LoadingSkeleton.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import AppLayout from './components/layout/AppLayout.jsx'

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Alerts = lazy(() => import('./pages/Alerts.jsx'))
const AlertDetail = lazy(() => import('./pages/AlertDetail.jsx'))
const Network = lazy(() => import('./pages/Network.jsx'))
const Sensor = lazy(() => import('./pages/Sensor.jsx'))
const Reports = lazy(() => import('./pages/Reports.jsx'))
const Notifications = lazy(() => import('./pages/Notifications.jsx'))
const Support = lazy(() => import('./pages/Support.jsx'))
const Account = lazy(() => import('./pages/Account.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

const fallback = <LoadingSkeleton className="mt-4" />

/**
 * Application route table. Only `/login` is public: every other destination
 * sits under `ProtectedRoute`, which redirects to `/login` when there is no
 * session.
 */
const routes = [
  {
    path: '/login',
    element: (
      <Suspense fallback={fallback}>
        <Login />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'alerts', element: <Alerts /> },
          { path: 'alerts/:id', element: <AlertDetail /> },
          { path: 'network', element: <Network /> },
          { path: 'sensor', element: <Sensor /> },
          { path: 'reports', element: <Reports /> },
          { path: 'notifications', element: <Notifications /> },
          { path: 'support', element: <Support /> },
          { path: 'account', element: <Account /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]

const router = createBrowserRouter(routes)

export default router
