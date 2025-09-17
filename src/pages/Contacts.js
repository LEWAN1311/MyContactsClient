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

    const navigate = useNavigate();

    // Charger les contacts au montage du composant
    useEffect(() => {
        if (!AuthService.isAuthenticated()) {
          navigate('/login');
          return;
        }
        fetchContacts();
    }, [navigate]);

    // Récupérer tous les contacts
    const fetchContacts = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await ContactsService.getContacts();
            console.log("data", data);
            setContacts(data.contacts || data || []);
        } catch (error) {
            setError('Erreur lors du chargement des contacts');
            console.error('Erreur:', error);
        } finally {
            console.log("finally");
            setLoading(false);
        }
    };

    // Déconnexion
    const handleLogout = async () => {
        await AuthService.logout();
        navigate('/');
    };

    // Filtrer les contacts selon le terme de recherche
    const filteredContacts = contacts.filter(contact =>
        contact.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone?.includes(searchTerm)
    );

    // Ouvrir le modal pour ajouter un contact
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

    // Ouvrir le modal pour modifier un contact
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

    // Fermer le modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedContact(null);
        setFormData({
            firstName: '',
            lastName: '',
            phone: '',
        });
    };

    // Gérer les changements dans le formulaire
    const handleFormChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Gérer les changements spécifiques pour le téléphone (nombres uniquement)
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        
        // Only allow numbers
        const numericValue = value.replace(/[^0-9]/g, '');
        
        setFormData({
            ...formData,
            phone: numericValue
        });
    };


    // Valider le numéro de téléphone
    const validatePhone = (phone) => {
        if (!phone) return true; // Required validation is handled by HTML
        
        // Check if phone contains only numbers
        const isNumeric = /^\d+$/.test(phone);
        const isValidLength = phone.length >= 10 && phone.length <= 20;
        
        return isNumeric && isValidLength;
    };


    // Soumettre le formulaire (ajout/modification)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        setError(''); // Clear previous errors

        // Validation côté client pour le téléphone
        if (!validatePhone(formData.phone)) {
            setError('Le numéro de téléphone doit contenir entre 10 et 20 chiffres.');
            setFormLoading(false);
            return;
        }

        try {
            if (modalMode === 'add') {
                await ContactsService.create(formData);
            } else {
                await ContactsService.update(selectedContact._id || selectedContact.id, formData);
            }

            await fetchContacts(); // Recharger la liste
            closeModal();
        } catch (error) {
            console.log("error", error);
            setError(ApiHandleError(error));
            // setError(`Erreur lors de la ${modalMode === 'add' ? 'création' : 'modification'} du contact`);
            console.error('Erreur:', error);
        } finally {
            setFormLoading(false);
        }
    };

    // Confirmer la suppression
    const confirmDelete = (contact) => {
        setDeleteConfirm(contact);
    };

    // Supprimer un contact
    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await ContactsService.delete(deleteConfirm._id || deleteConfirm.id);
            await fetchContacts(); // Recharger la liste
            setDeleteConfirm(null);
        } catch (error) {
            setError('Erreur lors de la suppression du contact');
            console.error('Erreur:', error);
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
                        <h1>Mes Contacts</h1>
                    </div>
                    <div className="header-right">
                        <button onClick={handleLogout} className="logout-btn">
                            Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            {/* Barre d'actions */}
            <div className="actions-bar">
                {/* <div className="search-container">
                    <input
                        type="text"
                        placeholder="🔍 Rechercher un contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div> */}
                <button onClick={openAddModal} className="add-btn">
                    Ajouter un contact
                </button>
            </div>

            {/* Messages d'erreur */}
            {error && (
                <div className="error-banner">
                    {error}
                    <button onClick={() => setError('')}>✕</button>
                </div>
            )}

            {/* Liste des contacts */}
            <div className="contacts-content">
                {filteredContacts.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3>{searchTerm ? 'Aucun contact trouvé' : 'Aucun contact'}</h3>
                        <p>
                            {searchTerm
                                ? 'Essayez avec d\'autres mots-clés'
                                : 'Commencez par ajouter votre premier contact'
                            }
                        </p>
                        {!searchTerm && (
                            <button onClick={openAddModal} className="add-first-btn">
                                Ajouter mon premier contact
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="contacts-grid">
                        {filteredContacts.map((contact) => (
                            <div key={contact._id || contact.id} className="contact-card">
                                <div className="contact-avatar">
                                    {contact.firstName ? contact.firstName.charAt(0).toUpperCase() : '👤'}
                                </div>
                                <div className="contact-info">
                                    <h3>{contact.firstName}</h3>
                                    {contact.firstName && <p className="contact-firstName">{contact.firstName}</p>}
                                    {contact.lastName && <p className="contact-lastName">{contact.lastName}</p>}
                                    {contact.phone && <p className="contact-phone">📞 {contact.phone}</p>}
                                </div>
                                <div className="contact-actions">
                                    <button
                                        onClick={() => openEditModal(contact)}
                                        className="edit-btn"
                                        title="Modifier"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => confirmDelete(contact)}
                                        className="delete-btn"
                                        title="Supprimer"
                                    >
                                        🗑️
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
                            <button onClick={closeModal} className="close-btn">✕</button>
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
                                    placeholder="DUPONT"
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
                            <div className="warning-icon">⚠️</div>
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
        </div>
    );
};

export default Contacts;