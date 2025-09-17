import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        {/* Header avec logo/titre */}
        <div className="home-header">
          <div className="logo">
            <div className="logo-icon">📱</div>
            <h1>ContactBook</h1>
          </div>
          <p className="tagline">Gérez vos contacts en toute simplicité</p>
        </div>

        {/* Section principale */}
        <div className="home-main">
          <div className="welcome-section">
            <h2>Bienvenue dans votre carnet de contacts personnel</h2>
            <p>
              Organisez, gérez et retrouvez facilement tous vos contacts 
              importants en un seul endroit. Une interface simple et intuitive 
              pour une gestion efficace.
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="home-actions">
            <Link to="/login" className="action-button login-button">
              <div className="button-icon">🔑</div>
              <div className="button-content">
                <h3>Se connecter</h3>
                <p>J'ai déjà un compte</p>
              </div>
            </Link>

            <Link to="/register" className="action-button register-button">
              <div className="button-icon">✨</div>
              <div className="button-content">
                <h3>Créer un compte</h3>
                <p>Je suis nouveau utilisateur</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="features-section">
          <h3>Fonctionnalités principales</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">📋</div>
              <div className="feature-text">
                <h4>Gestion complète</h4>
                <p>Ajoutez, modifiez et organisez vos contacts</p>
              </div>
            </div>
            {/* <div className="feature-item">
              <div className="feature-icon">🔍</div>
              <div className="feature-text">
                <h4>Recherche rapide</h4>
                <p>Trouvez vos contacts instantanément</p>
              </div>
            </div> */}
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div className="feature-text">
                <h4>Sécurisé</h4>
                <p>Vos données sont protégées et privées</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;