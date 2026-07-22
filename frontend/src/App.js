import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleRoute from './components/RoleRoute';

import Login from './pages/Login';
import Register from './pages/Register';

// Espace Employé
import DashboardEmploye from './pages/employe/DashboardEmploye';
import MesConges from './pages/employe/MesConges';
import DemanderConge from './pages/employe/DemanderConge';
import MesAbsences from './pages/employe/MesAbsences';
import DeclarerAbsence from './pages/employe/DeclarerAbsence';

// Espace Chef
import DashboardChef from './pages/chef/DashboardChef';
import MonEquipe from './pages/chef/MonEquipe';
import PresenceEquipe from './pages/chef/PresenceEquipe';
import ValidationCongesChef from './pages/chef/ValidationCongesChef';

// Espace RH/Admin
import DashboardAdmin from './pages/admin/DashboardAdmin';
import Employes from './pages/admin/Employes';
import AjouterEmploye from './pages/admin/AjouterEmploye';
import ModifierEmploye from './pages/admin/ModifierEmploye';
import Services from './pages/admin/Services';
import AjouterService from './pages/admin/AjouterService';
import DemandesConge from './pages/admin/DemandesConge';
import GestionComptes from './pages/admin/GestionComptes';

const TOUS_ROLES = ['EMPLOYE', 'CHEF', 'RH', 'ADMIN'];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Espace Employé : accessible à TOUS les rôles connectés */}
          <Route path="/employe/dashboard" element={<RoleRoute rolesAutorises={TOUS_ROLES}><DashboardEmploye /></RoleRoute>} />
          <Route path="/employe/mes-conges" element={<RoleRoute rolesAutorises={TOUS_ROLES}><MesConges /></RoleRoute>} />
          <Route path="/employe/mes-conges/demander" element={<RoleRoute rolesAutorises={TOUS_ROLES}><DemanderConge /></RoleRoute>} />
          <Route path="/employe/mes-absences" element={<RoleRoute rolesAutorises={TOUS_ROLES}><MesAbsences /></RoleRoute>} />
          <Route path="/employe/mes-absences/declarer" element={<RoleRoute rolesAutorises={TOUS_ROLES}><DeclarerAbsence /></RoleRoute>} />

          {/* Espace Chef : réservé CHEF */}
          <Route path="/chef/dashboard" element={<RoleRoute rolesAutorises={['CHEF']}><DashboardChef /></RoleRoute>} />
          <Route path="/chef/mon-equipe" element={<RoleRoute rolesAutorises={['CHEF']}><MonEquipe /></RoleRoute>} />
          <Route path="/chef/presences-equipe" element={<RoleRoute rolesAutorises={['CHEF']}><PresenceEquipe /></RoleRoute>} />
          <Route path="/chef/validation-conges" element={<RoleRoute rolesAutorises={['CHEF']}><ValidationCongesChef /></RoleRoute>} />

          {/* Espace RH/Admin : réservé RH et ADMIN */}
          <Route path="/admin/dashboard" element={<RoleRoute rolesAutorises={['RH', 'ADMIN']}><DashboardAdmin /></RoleRoute>} />
          <Route path="/admin/validation-conges" element={<RoleRoute rolesAutorises={['RH', 'ADMIN']}><DemandesConge /></RoleRoute>} />
          <Route path="/admin/employes" element={<RoleRoute rolesAutorises={['RH', 'ADMIN']}><Employes /></RoleRoute>} />
          <Route path="/admin/employes/ajouter" element={<RoleRoute rolesAutorises={['RH', 'ADMIN']}><AjouterEmploye /></RoleRoute>} />
          <Route path="/admin/employes/modifier/:id" element={<RoleRoute rolesAutorises={['RH', 'ADMIN']}><ModifierEmploye /></RoleRoute>} />
          <Route path="/admin/services" element={<RoleRoute rolesAutorises={['RH', 'ADMIN']}><Services /></RoleRoute>} />
          <Route path="/admin/services/ajouter" element={<RoleRoute rolesAutorises={['RH', 'ADMIN']}><AjouterService /></RoleRoute>} />
          <Route path="/admin/comptes" element={<RoleRoute rolesAutorises={['ADMIN']}><GestionComptes /></RoleRoute>} />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;