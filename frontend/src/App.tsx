import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute, RedirectByRole } from './routes/ProtectedRoute'

const Login = lazy(() =>
  import('./pages/auth/Login').then((m) => ({ default: m.Login })),
)
const Register = lazy(() =>
  import('./pages/auth/Register').then((m) => ({ default: m.Register })),
)
const ForgotPassword = lazy(() =>
  import('./pages/auth/ForgotPassword').then((m) => ({
    default: m.ForgotPassword,
  })),
)
const UserDashboard = lazy(() =>
  import('./pages/user/Dashboard').then((m) => ({ default: m.UserDashboard })),
)
const UserTickets = lazy(() =>
  import('./pages/user/MyTickets').then((m) => ({ default: m.UserTickets })),
)
const CreateTicket = lazy(() =>
  import('./pages/user/CreateTicket').then((m) => ({ default: m.CreateTicket })),
)
const UserTicketDetail = lazy(() =>
  import('./pages/user/TicketDetail').then((m) => ({
    default: m.UserTicketDetail,
  })),
)
const TechnicianDashboard = lazy(() =>
  import('./pages/technician/Dashboard').then((m) => ({
    default: m.TechnicianDashboard,
  })),
)
const TechnicianTickets = lazy(() =>
  import('./pages/technician/Tickets').then((m) => ({
    default: m.TechnicianTickets,
  })),
)
const TechnicianTicketDetail = lazy(() =>
  import('./pages/technician/TicketDetail').then((m) => ({
    default: m.TechnicianTicketDetail,
  })),
)
const AdminDashboard = lazy(() =>
  import('./pages/admin/Dashboard').then((m) => ({ default: m.AdminDashboard })),
)
const AdminTickets = lazy(() =>
  import('./pages/admin/Tickets').then((m) => ({ default: m.AdminTickets })),
)
const AdminTicketDetail = lazy(() =>
  import('./pages/admin/TicketDetail').then((m) => ({
    default: m.AdminTicketDetail,
  })),
)
const AdminUsers = lazy(() =>
  import('./pages/admin/Users').then((m) => ({ default: m.AdminUsers })),
)

function LoadingScreen() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-950">
      <div className="text-slate-400">Cargando…</div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<RedirectByRole />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/user"
            element={
              <ProtectedRoute roles={['user']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/tickets"
            element={
              <ProtectedRoute roles={['user']}>
                <UserTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/tickets/new"
            element={
              <ProtectedRoute roles={['user']}>
                <CreateTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/tickets/:ticketId"
            element={
              <ProtectedRoute roles={['user']}>
                <UserTicketDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/technician"
            element={
              <ProtectedRoute roles={['technician']}>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician/tickets"
            element={
              <ProtectedRoute roles={['technician']}>
                <TechnicianTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician/tickets/:ticketId"
            element={
              <ProtectedRoute roles={['technician']}>
                <TechnicianTicketDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets/:ticketId"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminTicketDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<RedirectByRole />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
