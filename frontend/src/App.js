import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employes from './pages/Employes';
import AjouterEmploye from './pages/AjouterEmploye';
import ModifierEmploye from './pages/ModifierEmploye';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employes" element={<Employes />} />
          <Route path="/employes/ajouter" element={<AjouterEmploye />} />
          <Route path="/employes/modifier/:id" element={<ModifierEmploye />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;