import { Routes, Route, Navigate } from 'react-router-dom';
import { createContext, useContext } from 'react';
import Layout from './components/Layout';
import NewDraw from './pages/NewDraw';
import History from './pages/History';
import Statistics from './pages/Statistics';
import Admin from './pages/Admin';
import { useToast } from './hooks/useToast';
import ToastContainer from './components/ToastContainer';

// Toast context for global access
interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};

function App() {
  const { toasts, success, error, info, removeToast } = useToast();

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/new-draw" replace />} />
          <Route path="/new-draw" element={<NewDraw />} />
          <Route path="/history" element={<History />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export default App;
