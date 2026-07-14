require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth_routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});