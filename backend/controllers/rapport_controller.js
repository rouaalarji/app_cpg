const absenceModel = require('../models/absence_model');
const presenceModel = require('../models/presence_model');
const demandeCongeModel = require('../models/demande_conge_model');
//Vérifier le format du mois 
async function getRapportMensuel(req, res) {
  try {
    const mois = req.query.mois || new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(mois)) {
      return res.status(400).json({ message: 'Format de mois invalide (attendu AAAA-MM)' });
    }
// Récupérer les statistiques pour le mois donné
    const [statsAbsences, statsPresence, statsConges] = await Promise.all([
      absenceModel.getStatsMois(mois),
      presenceModel.getStatsMois(mois),
      demandeCongeModel.getStatsMois(mois),
    ]);

    const donnees = {
      mois,
      absences: statsAbsences,
      presence: statsPresence,
      conges: statsConges,
    };
// genererSynthese est une fonction qui utilise l'API Groq pour générer une synthèse 
    const synthese = await genererSynthese(donnees);
    res.json({ donnees, synthese });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la génération du rapport' });
  }
}

async function genererSynthese(donnees) {
  // le prompt est une instruction pour l'IA afin de générer une synthèse professionnelle
  const prompt = `Tu es un assistant RH. Voici les statistiques du mois ${donnees.mois} d'une entreprise :

${JSON.stringify(donnees, null, 2)}

Rédige une synthèse professionnelle en français, de 4 à 6 phrases, pour la direction.
Mentionne les tendances importantes (service le plus concerné, employés à surveiller), sans inventer de chiffres absents des données.
Si une section (congés, présence) est absente des données, ne la mentionne pas.
N'ajoute ni titre, ni liste à puces : un texte en paragraphes suffit.`;
// appele de api Groq pour générer la synthèse
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    console.error('Erreur Groq :', await response.text());
    return 'Synthèse indisponible pour le moment.';
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Synthèse indisponible pour le moment.';
}

module.exports = { getRapportMensuel };