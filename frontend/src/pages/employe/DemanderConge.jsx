import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { create } from '../../services/demandeCongeService';
import api from '../../services/api';
import LayoutEmploye from '../../components/layout/LayoutEmploye';

function DemanderConge() {
  const navigate = useNavigate();
  const [typesConge, setTypesConge] = useState([]);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const NOUVEAU = '__nouveau__';

  const [formData, setFormData] = useState({
    typeCongeId: '',
    nouveauTypeNom: '',
    nouveauTypeJours: '21',
    dateDebut: '',
    dateFin: '',
    motif: '',
  });

  useEffect(() => {
    api.get('/types-conge').then((res) => setTypesConge(res.data));
  }, []);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    try {
      let typeCongeId = formData.typeCongeId;

      if (typeCongeId === NOUVEAU) {
        if (!formData.nouveauTypeNom.trim()) {
          setErreur('Le nom du type de congé est requis');
          setChargement(false);
          return;
        }
        const resType = await api.post('/types-conge', {
          nom: formData.nouveauTypeNom,
          nbJoursParAn: parseInt(formData.nouveauTypeJours, 10),
        });
        typeCongeId = resType.data.id;
      }

      await create({
        typeCongeId,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        motif: formData.motif,
      });

      navigate('/employe/mes-conges');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de la création de la demande');
    } finally {
      setChargement(false);
    }
  }

  return (
    <LayoutEmploye>
      <h2 className="fw-bold mb-3">Faire une demande de congé</h2>

      <div className="card card-cpg p-4" style={{ maxWidth: '500px' }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Type de congé</label>
            <select
              name="typeCongeId"
              value={formData.typeCongeId}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">-- Sélectionner --</option>
              {typesConge.map((t) => (
                <option key={t.id} value={t.id}>{t.nom} ({t.nb_jours_par_an} j/an)</option>
              ))}
              <option value={NOUVEAU}>+ Nouveau type de congé</option>
            </select>
          </div>

          {formData.typeCongeId === NOUVEAU && (
            <>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nom du type</label>
                <input
                  type="text"
                  name="nouveauTypeNom"
                  value={formData.nouveauTypeNom}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nombre de jours par an</label>
                <input
                  type="number"
                  name="nouveauTypeJours"
                  value={formData.nouveauTypeJours}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </>
          )}

          <div className="mb-3">
            <label className="form-label small fw-semibold">Date de début</label>
            <input
              type="date"
              name="dateDebut"
              value={formData.dateDebut}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Date de fin</label>
            <input
              type="date"
              name="dateFin"
              value={formData.dateFin}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Motif (optionnel)</label>
            <textarea
              name="motif"
              value={formData.motif}
              onChange={handleChange}
              className="form-control"
              rows={3}
            />
          </div>

          {erreur && <div className="alert alert-danger py-2 small">{erreur}</div>}

          <button type="submit" disabled={chargement} className="btn btn-cpg-primary w-100">
            {chargement ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </form>
      </div>
    </LayoutEmploye>
  );
}

export default DemanderConge;