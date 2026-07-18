import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employes from './pages/Employes';
import AjouterEmploye from './pages/AjouterEmploye';
import ModifierEmploye from './pages/ModifierEmploye';
import Services from './pages/Services';
import AjouterService from './pages/AjouterService';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/employes" element={<PrivateRoute><Employes /></PrivateRoute>} />
          <Route path="/employes/ajouter" element={<PrivateRoute><AjouterEmploye /></PrivateRoute>} />
          <Route path="/employes/modifier/:id" element={<PrivateRoute><ModifierEmploye /></PrivateRoute>} />
          <Route path="/services" element={<PrivateRoute><Services /></PrivateRoute>} />
          <Route path="/services/ajouter" element={<PrivateRoute><AjouterService /></PrivateRoute>} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;