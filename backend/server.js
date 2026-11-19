//Charger les variables d'environnement
require('dotenv').config();
const express = require('express');
// cors car le front et le back sont sur des ports différents 
const cors = require('cors');
// Importer les routes son role est definir les endpoints 
const authRoutes = require('./routes/auth_routes');
const employeRoutes = require('./routes/employe_routes');
const serviceRoutes = require ('./routes/service_routes');
const typeCongeRoutes = require('./routes/type_conge_routes');
const demandeCongeRoutes = require('./routes/demande_conge_routes');
const presenceRoutes = require('./routes/presence_routes');
const absenceRoutes = require('./routes/absence_routes');
const departementRoutes = require('./routes/departement_routes');
const dashboardRoutes = require('./routes/dashboard_routes');
const utilisateurRoutes = require('./routes/utilisateur_routes');
const notificationRoutes = require('./routes/notification_routes');
const jourFerieRoutes = require('./routes/jour_ferie_routes');

const app = express();

app.use(cors());
app.use(express.json());
//app.use() permet d'enregistrer un middleware ou un ensemble de routes dans l'application Express.
app.use('/api/auth', authRoutes);
app.use('/api/employes',employeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/types-conge', typeCongeRoutes);
app.use('/api/jours-feries', jourFerieRoutes);
app.use('/api/demandes-conge', demandeCongeRoutes);
app.use('/api/presences', presenceRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/departements', departementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/rapports', require('./routes/rapport_routes'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});