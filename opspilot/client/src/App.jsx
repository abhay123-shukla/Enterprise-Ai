import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { NewRequest } from './pages/NewRequest';
import { MyRequests } from './pages/MyRequests';
import { RequestDetail } from './pages/RequestDetail';
import { AgentQueue } from './pages/AgentQueue';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Analytics } from './pages/Analytics';
import { AdminUsers } from './pages/AdminUsers';
import { NotFound } from './pages/NotFound';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#94a3b8' }}>
        Loading OpsPilot Workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const App = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, paddingBottom: '40px' }}>
        <Routes>
          {/* Public / Landing */}
          <Route
            path="/"
            element={
              loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#94a3b8' }}>
                  Loading OpsPilot Workspace...
                </div>
              ) : isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/login"
            element={
              loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#94a3b8' }}>
                  Loading OpsPilot Workspace...
                </div>
              ) : isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={
              loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#94a3b8' }}>
                  Loading OpsPilot Workspace...
                </div>
              ) : isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register />
              )
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new-request"
            element={
              <ProtectedRoute>
                <NewRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/:id"
            element={
              <ProtectedRoute>
                <RequestDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent-queue"
            element={
              <ProtectedRoute allowedRoles={['agent', 'admin']}>
                <AgentQueue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge"
            element={
              <ProtectedRoute>
                <KnowledgeBase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['agent', 'admin']}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
