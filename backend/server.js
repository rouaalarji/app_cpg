require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth_routes');
const employeRoutes = require('./routes/employe_routes');
const serviceRoutes = require ('./routes/service_routes');
const typeCongeRoutes = require('./routes/type_conge_routes');
const demandeCongeRoutes = require('./routes/demande_conge_routes');
const presenceRoutes = require('./routes/presence_routes');
const absenceRoutes = require('./routes/absence_routes');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employes',employeRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/type-conges', typeCongeRoutes);
app.use('/api/demandes-conge', demandeCongeRoutes);
app.use('/api/presences', presenceRoutes);
app.use('/api/absences', absenceRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});