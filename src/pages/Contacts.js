import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactsService from '../services/ContactsService';
import AuthService from '../services/AuthService';
import '../styles/Contacts.css';
import ApiHandleError from '../utils/ApiHandleError';

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedContact, setSelectedContact] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
            console.log('Utilisateur non authentifié, redirection vers la page de connexion');
            navigate('/login');
            return;
        }
        fetchContacts();
    }, [navigate]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await ContactsService.getContacts();
            setContacts(data.contacts || data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des contacts:', error);
            setError('Erreur lors du chargement des contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        AuthService.logout();
        setShowLogoutConfirm(false);
        navigate('/');
    };

    const filteredContacts = contacts.filter(contact =>
        contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.includes(searchTerm)
    );

    const openAddModal = () => {
        setModalMode('add');
        setSelectedContact(null);
        setFormData({
            firstName: '',
            lastName: '',
            phone: '',
        });
        setShowModal(true);
    };

    const openEditModal = (contact) => {
        setModalMode('edit');
        setSelectedContact(contact);
        setFormData({
            firstName: contact.firstName || '',
            lastName: contact.lastName || '',
            phone: contact.phone || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedContact(null);
        setFormData({
            firstName: '',
            lastName: '',
            phone: '',
        });
    };

    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;

        // Only allow numbers
        const numericValue = value.replace(/[^0-9]/g, '');

        setFormData({
            ...formData,
            phone: numericValue
        });
    };

    const validatePhone = (phone) => {
        if (!phone) return true;

        // Check if phone contains only numbers
        const isNumeric = /^\d+$/.test(phone);
        const isValidLength = phone.length >= 10 && phone.length <= 20;

        return isNumeric && isValidLength;
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setError('');

        if (!validatePhone(formData.phone)) {
            setError('Le numéro de téléphone doit contenir entre 10 et 20 chiffres.');
            setFormLoading(false);
            return;
        }

        try {
            if (modalMode === 'add') {
                await ContactsService.create(formData);
            } else {
                await ContactsService.update(selectedContact._id, formData);
            }

            await fetchContacts(); // Recharger la liste
            closeModal();
        } catch (error) {
            setError(ApiHandleError(error));
        } finally {
            setFormLoading(false);
        }
    };

    const confirmDelete = (contact) => {
        setDeleteConfirm(contact);
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await ContactsService.delete(deleteConfirm._id);
            await fetchContacts();
            setDeleteConfirm(null);
        } catch (error) {
            setError('Erreur lors de la suppression du contact');
        }
    };

    if (loading) {
        return (
            <div className="contacts-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Chargement des contacts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="contacts-container">
            {/* Header */}
            <header className="contacts-header">
                <div className="header-content">
                    <div className="header-left">
                        <i className="fas fa-address-book header-icon"></i>
                        <h1>MyContacts</h1>
                    </div>
                    <div className="header-right">
                        <button onClick={handleLogout} className="logout-btn">
                            Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            {/* Barre d'actions */}
            {filteredContacts.length > 0 &&
                <div className="actions-bar">
                    <button onClick={openAddModal} className="add-btn">
                        <i className="fas fa-plus"></i>
                        Ajouter un contact
                    </button>
                </div>
            }

            {/* Messages d'erreur */}
            {error && (
                <div className="error-banner">
                    {error}
                    <button onClick={() => setError('')}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )}

            {/* Liste des contacts */}
            <div className="contacts-content">
                {filteredContacts.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-address-book empty-icon"></i>
                        <h3>{searchTerm ? 'Aucun contact trouvé' : 'Aucun contact'}</h3>
                        <p>
                            {searchTerm
                                ? 'Essayez avec d\'autres mots-clés'
                                : 'Commencez par ajouter votre premier contact'
                            }
                        </p>
                        {!searchTerm && (
                            <button onClick={openAddModal} className="add-first-btn">
                                <i className="fas fa-plus"></i>
                                Ajouter mon premier contact
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="contacts-grid">
                        {filteredContacts.map((contact) => (
                            <div key={contact._id} className="contact-card">
                                <div className="contact-avatar">
                                    {contact.firstName ? contact.firstName.charAt(0).toUpperCase() : <i className="fas fa-user"></i>}
                                </div>
                                <div className="contact-info">
                                    <h3>{contact.firstName}</h3>
                                    {contact.firstName && <p className="contact-firstName">{contact.firstName}</p>}
                                    {contact.lastName && <p className="contact-lastName">{contact.lastName}</p>}
                                    {contact.phone && <p className="contact-phone"><i className="fas fa-phone"></i> {contact.phone}</p>}
                                </div>
                                <div className="contact-actions">
                                    <button
                                        onClick={() => openEditModal(contact)}
                                        className="edit-btn"
                                        title="Modifier"
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(contact)}
                                        className="delete-btn"
                                        title="Supprimer"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de formulaire */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Ajouter un contact' : 'Modifier le contact'}</h2>
                            <button onClick={closeModal} className="close-btn">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="contact-form">
                            <div className="form-group">
                                <label htmlFor="firstName">Prénom</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="Jean"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Nom</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleFormChange}
                                    required
                                    placeholder="Dupont"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Téléphone</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    required
                                    placeholder="0123456789"
                                    className={formData.phone && !validatePhone(formData.phone) ? 'invalid-phone' : ''}
                                />
                                {formData.phone && (
                                    <div className="phone-validation">
                                        <span className={`char-count ${!validatePhone(formData.phone) ? 'invalid' : ''}`}>
                                            {formData.phone.length}/20 chiffres
                                        </span>
                                        {!validatePhone(formData.phone) && (
                                            <span className="validation-message">
                                                Le numéro doit contenir entre 10 et 20 chiffres
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={closeModal} className="cancel-btn">
                                    Annuler
                                </button>
                                <button type="submit" disabled={formLoading} className="submit-btn">
                                    {formLoading ? 'Enregistrement...' : modalMode === 'add' ? 'Ajouter' : 'Modifier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de suppression */}
            {deleteConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content confirmation-modal">
                        <div className="confirmation-content">
                            <i className="fas fa-exclamation-triangle warning-icon"></i>
                            <h3>Confirmer la suppression</h3>
                            <p>
                                Êtes-vous sûr de vouloir supprimer le contact <strong>{deleteConfirm.firstName} {deleteConfirm.lastName}</strong> ?
                                Cette action est irréversible.
                            </p>
                            <div className="confirmation-actions">
                                <button onClick={() => setDeleteConfirm(null)} className="cancel-btn">
                                    Annuler
                                </button>
                                <button onClick={handleDelete} className="delete-confirm-btn">
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmation de déconnexion */}
            {showLogoutConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content confirmation-modal">
                        <div className="confirmation-content">
                            <h3>Confirmer la déconnexion</h3>
                            <p>
                                Êtes-vous sûr de vouloir vous déconnecter ?
                                Vous devrez vous reconnecter pour accéder à vos contacts.
                            </p>
                            <div className="confirmation-actions">
                                <button onClick={() => setShowLogoutConfirm(false)} className="cancel-btn">
                                    Annuler
                                </button>
                                <button onClick={confirmLogout} className="logout-confirm-btn">
                                    Se déconnecter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contacts;