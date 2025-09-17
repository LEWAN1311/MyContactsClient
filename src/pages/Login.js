import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../styles/Auth.css'
import AuthService from "../services/AuthService";
import ApiHandleError from "../utils/ApiHandleError";

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

        try {
            await AuthService.login({
                'email': formData.email.trim(),
                'password': formData.password
            })
            setLoading(false);
            navigate('/contacts');
        } catch (error) {
            setError(ApiHandleError(error));
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Connexion</h2>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">
                            <i className="fas fa-envelope"></i>
                            Email
                        </label>
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
                        <label htmlFor="password">
                            <i className="fas fa-lock"></i>
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Votre mot de passe"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >
                        <i className="fas fa-sign-in-alt"></i>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div className="auth-link">
                    <p>
                        <Link to="/">Retour à l'accueil</Link>
                    </p>
                    <p>
                        Pas encore de compte ?
                        <Link to="/register"> Créer un compte</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;