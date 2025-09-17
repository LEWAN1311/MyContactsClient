import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
import AuthService from '../services/AuthService';
import ApiHandleError from '../utils/ApiHandleError';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 3) {
      setError('Le mot de passe doit contenir au moins 3 caractères.');
      setLoading(false);
      return;
    }

    try {
      await AuthService.register(formData);
      setLoading(false);
      setShowSuccessModal(true);
    } catch (error) {
      setError(ApiHandleError(error));
      setLoading(false);
    }
  };

  const handleSuccessOk = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Créer un compte</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="votre.email@exemple.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Au moins 3 caractères"
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Inscription...' : 'Créer le compte'}
          </button>
        </form>

        <div className="auth-link">
          <p>
            <Link to="/">Retour à l'accueil</Link>
          </p>
          <p>
            Déjà un compte ?
            <Link to="/login"> Se connecter</Link>
          </p>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content success-modal">
            <div className="success-content">
              <div className="success-icon">✅</div>
              <h3>Compte créé avec succès !</h3>
              <p>
                Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter avec vos identifiants.
              </p>
              <button onClick={handleSuccessOk} className="success-ok-btn">
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;