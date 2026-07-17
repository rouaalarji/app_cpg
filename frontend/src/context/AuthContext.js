import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    const stored = localStorage.getItem('utilisateur');
    return stored ? JSON.parse(stored) : null;
  });

  function connecter(token, utilisateurData) {
    localStorage.setItem('token', token);
    localStorage.setItem('utilisateur', JSON.stringify(utilisateurData));
    setUtilisateur(utilisateurData);
  }

  function deconnecter() {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    setUtilisateur(null);
  }

  return (
    <AuthContext.Provider value={{ utilisateur, connecter, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider, useAuth };