import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import ShopPage from './pages/ShopPage';
import OrdersPage from './pages/OrdersPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import { useAuthStore } from './store/authStore';
import { connectSocket } from './utils/socket';
import { useSocket } from './hooks/useSocket.jsx';

function AppShell() {
  const { user, accessToken } = useAuthStore();
  useSocket(); // binds socket events globally

  // Reconnect socket on reload if token exists
  useEffect(() => {
    if (accessToken) connectSocket(accessToken);
  }, [accessToken]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login"    element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />

        <Route path="/" element={
          <ProtectedRoute><ShopPage /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><OrdersPage /></ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute adminOnly><AdminProductsPage /></ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute adminOnly><AdminOrdersPage /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0D1117',
            color: '#E8EDF3',
            border: '1px solid #1E2A38',
            borderRadius: '10px',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#00FF87', secondary: '#080B10' } },
          error:   { iconTheme: { primary: '#FF3B5C', secondary: '#fff'   } },
        }}
      />
    </BrowserRouter>
  );
}
