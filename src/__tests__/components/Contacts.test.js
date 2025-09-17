import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Contacts from '../../pages/Contacts';
import ContactsService from '../../services/ContactsService';
import AuthService from '../../services/AuthService';
import ApiHandleError from '../../utils/ApiHandleError';
import { mockContacts, mockContact, mockApiResponses } from '../utils/testUtils';

// Mock dependencies
jest.mock('../../services/ContactsService');
jest.mock('../../services/AuthService');
jest.mock('../../utils/ApiHandleError');

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => children,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
  Routes: ({ children }) => children,
  Route: ({ children }) => children
}));

// Mock Font Awesome
jest.mock('@fortawesome/fontawesome-free/css/all.min.css', () => ({}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Contacts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock AuthService.isAuthenticated to return true by default
    AuthService.isAuthenticated.mockReturnValue(true);
  });

  describe('Rendering', () => {
    test('renders contacts page with header and add button', async () => {
      ContactsService.getContacts.mockResolvedValue({ contacts: [] });
      renderWithRouter(<Contacts />);
      
      await waitFor(() => {
        expect(screen.getByText('MyContacts')).toBeInTheDocument();
        expect(screen.getByText('Ajouter mon premier contact')).toBeInTheDocument();
      });
    });

    test('renders Font Awesome icons', async () => {
      ContactsService.getContacts.mockResolvedValue({ contacts: [] });
      renderWithRouter(<Contacts />);
      
      await waitFor(() => {
        const addressBookIcon = document.querySelector('.fa-address-book');
        const plusIcon = document.querySelector('.fa-plus');
        
        expect(addressBookIcon).toBeTruthy();
        expect(plusIcon).toBeTruthy();
      });
    });

    test('shows loading state initially', () => {
      ContactsService.getContacts.mockImplementation(() => new Promise(() => {})); // Never resolves
      renderWithRouter(<Contacts />);
      
      expect(screen.getByText('Chargement des contacts...')).toBeInTheDocument();
    });

    test('shows empty state when no contacts', async () => {
      ContactsService.getContacts.mockResolvedValue({ contacts: [] });
      renderWithRouter(<Contacts />);
      
      await waitFor(() => {
        expect(screen.getByText('Aucun contact')).toBeInTheDocument();
        expect(screen.getByText('Commencez par ajouter votre premier contact')).toBeInTheDocument();
      });
    });

    test('displays contacts when data is loaded', async () => {
      ContactsService.getContacts.mockResolvedValue({ contacts: mockContacts });
      renderWithRouter(<Contacts />);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'John' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Jane' })).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();
        expect(screen.getByText('0987654321')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication', () => {
    test('redirects to login when not authenticated', () => {
      AuthService.isAuthenticated.mockReturnValue(false);
      renderWithRouter(<Contacts />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    test('loads contacts when authenticated', async () => {
      AuthService.isAuthenticated.mockReturnValue(true);
      ContactsService.getContacts.mockResolvedValue({ contacts: mockContacts });
      renderWithRouter(<Contacts />);
      
      await waitFor(() => {
        expect(ContactsService.getContacts).toHaveBeenCalled();
        expect(screen.getByRole('heading', { name: 'John' })).toBeInTheDocument();
      });
    });
  });

  describe('Add Contact Modal', () => {
    beforeEach(async () => {
      ContactsService.getContacts.mockResolvedValue({ contacts: [] });
      renderWithRouter(<Contacts />);
      await waitFor(() => {
        expect(screen.getByText('Ajouter mon premier contact')).toBeInTheDocument();
      });
    });

    test('opens add contact modal when add button is clicked', async () => {
      const addButton = screen.getByText('Ajouter mon premier contact');
      await userEvent.click(addButton);
      
      expect(screen.getByText('Ajouter un contact')).toBeInTheDocument();
      expect(screen.getByLabelText('Prénom')).toBeInTheDocument();
      expect(screen.getByLabelText('Nom')).toBeInTheDocument();
      expect(screen.getByLabelText('Téléphone')).toBeInTheDocument();
    });

    test('closes modal when close button is clicked', async () => {
      const addButton = screen.getByText('Ajouter mon premier contact');
      await userEvent.click(addButton);
      
      const closeButton = screen.getByRole('button', { name: '' });
      await userEvent.click(closeButton);
      
      expect(screen.queryByLabelText(/prénom/i)).not.toBeInTheDocument();
    });

    test('updates form data when inputs change', async () => {
      const addButton = screen.getByText('Ajouter mon premier contact');
      await userEvent.click(addButton);
      
      const firstNameInput = screen.getByLabelText('Prénom');
      const lastNameInput = screen.getByLabelText('Nom');
      const phoneInput = screen.getByLabelText(/téléphone/i);
      
      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(phoneInput, '1234567890');
      
      expect(firstNameInput).toHaveValue('John');
      expect(lastNameInput).toHaveValue('Doe');
      expect(phoneInput).toHaveValue('1234567890');
    });

    test('validates phone number length', async () => {
      ContactsService.create.mockResolvedValue({});
      
      const addButton = screen.getByText('Ajouter mon premier contact');
      await userEvent.click(addButton);
      
      const firstNameInput = screen.getByLabelText('Prénom');
      const lastNameInput = screen.getByLabelText('Nom');
      const phoneInput = screen.getByLabelText(/téléphone/i);
      const submitButton = screen.getByRole('button', { name: 'Ajouter', type: 'submit' });
      
      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(phoneInput, '123'); // Too short
      await userEvent.click(submitButton);
      
      expect(screen.getByText('Le numéro doit contenir entre 10 et 20 chiffres')).toBeInTheDocument();
      expect(ContactsService.create).not.toHaveBeenCalled();
    });

    test('filters non-numeric characters from phone input', async () => {
      const addButton = screen.getByText('Ajouter mon premier contact');
      await userEvent.click(addButton);
      
      const phoneInput = screen.getByLabelText(/téléphone/i);
      await userEvent.type(phoneInput, 'abc123def456');
      
      expect(phoneInput).toHaveValue('123456');
    });

    test('creates contact successfully', async () => {
      ContactsService.create.mockResolvedValue({});
      ContactsService.getContacts.mockResolvedValue({ contacts: [mockContact] });
      
      const addButton = screen.getByText('Ajouter mon premier contact');
      await userEvent.click(addButton);
      
      const firstNameInput = screen.getByLabelText('Prénom');
      const lastNameInput = screen.getByLabelText('Nom');
      const phoneInput = screen.getByLabelText(/téléphone/i);
      const submitButton = screen.getByRole('button', { name: 'Ajouter', type: 'submit' });
      
      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(phoneInput, '1234567890');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(ContactsService.create).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890'
        });
      });
    });

    test('displays error message on creation failure', async () => {
      const mockError = mockApiResponses.error(409, 'Phone number already exists');
      ContactsService.create.mockRejectedValue(mockError);
      ApiHandleError.mockReturnValue('Ce numéro de téléphone existe déjà dans la liste des contacts.');
      
      const addButton = screen.getByText('Ajouter mon premier contact');
      await userEvent.click(addButton);
      
      const firstNameInput = screen.getByLabelText('Prénom');
      const lastNameInput = screen.getByLabelText('Nom');
      const phoneInput = screen.getByLabelText(/téléphone/i);
      const submitButton = screen.getByRole('button', { name: 'Ajouter', type: 'submit' });
      
      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(lastNameInput, 'Doe');
      await userEvent.type(phoneInput, '1234567890');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText('Ce numéro de téléphone existe déjà dans la liste des contacts.')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Contact Modal', () => {
    beforeEach(async () => {
      ContactsService.getContacts.mockResolvedValue({ contacts: mockContacts });
      renderWithRouter(<Contacts />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'John' })).toBeInTheDocument();
      });
    });

    test('opens edit modal when edit button is clicked', async () => {
      const editButtons = screen.getAllByTitle('Modifier');
      await userEvent.click(editButtons[0]);
      
      expect(screen.getByText('Modifier le contact')).toBeInTheDocument();
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
    });

    test('updates contact successfully', async () => {
      ContactsService.update.mockResolvedValue({});
      ContactsService.getContacts.mockResolvedValue({ contacts: [{ ...mockContact, firstName: 'Johnny' }] });
      
      const editButtons = screen.getAllByTitle('Modifier');
      await userEvent.click(editButtons[0]);
      
      const firstNameInput = screen.getByDisplayValue('John');
      const submitButton = document.querySelector('button.submit-btn');
      
      await userEvent.clear(firstNameInput);
      await userEvent.type(firstNameInput, 'Johnny');
      await userEvent.click(submitButton);
      
      await waitFor(() => {
        expect(ContactsService.update).toHaveBeenCalledWith('123', {
          firstName: 'Johnny',
          lastName: 'Doe',
          phone: '1234567890'
        });
      });
    });
  });

  describe('Delete Contact', () => {
    beforeEach(async () => {
      ContactsService.getContacts.mockResolvedValue({ contacts: mockContacts });
      renderWithRouter(<Contacts />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'John' })).toBeInTheDocument();
      });
    });

    test('opens delete confirmation modal when delete button is clicked', async () => {
      const deleteButtons = screen.getAllByTitle('Supprimer');
      await userEvent.click(deleteButtons[0]);
      
      expect(screen.getByText('Confirmer la suppression')).toBeInTheDocument();
      expect(screen.getByText(/Êtes-vous sûr de vouloir supprimer le contact/)).toBeInTheDocument();
    });

    test('deletes contact successfully', async () => {
      ContactsService.delete.mockResolvedValue({});
      ContactsService.getContacts.mockResolvedValue({ contacts: [] });
      
      const deleteButtons = screen.getAllByTitle('Supprimer');
      await userEvent.click(deleteButtons[0]);
      
      const confirmButton = screen.getByText('Supprimer');
      await userEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(ContactsService.delete).toHaveBeenCalledWith('123');
      });
    });

    test('cancels delete when cancel button is clicked', async () => {
      const deleteButtons = screen.getAllByTitle('Supprimer');
      await userEvent.click(deleteButtons[0]);
      
      const cancelButton = screen.getByText('Annuler');
      await userEvent.click(cancelButton);
      
      expect(screen.queryByText('Confirmer la suppression')).not.toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    beforeEach(async () => {
      ContactsService.getContacts.mockResolvedValue({ contacts: [] });
      renderWithRouter(<Contacts />);
      await waitFor(() => {
        expect(screen.getByText('Ajouter mon premier contact')).toBeInTheDocument();
      });
    });

    test('opens logout confirmation modal when logout button is clicked', async () => {
      const logoutButton = screen.getByText('Déconnexion');
      await userEvent.click(logoutButton);
      
      expect(screen.getByText('Confirmer la déconnexion')).toBeInTheDocument();
      expect(screen.getByText('Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à vos contacts.')).toBeInTheDocument();
    });

    test('logs out successfully when confirmed', async () => {
      const logoutButton = screen.getByText('Déconnexion');
      await userEvent.click(logoutButton);
      
      const confirmButton = screen.getByText('Se déconnecter');
      await userEvent.click(confirmButton);
      
      expect(AuthService.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('cancels logout when cancel button is clicked', async () => {
      const logoutButton = screen.getByText('Déconnexion');
      await userEvent.click(logoutButton);
      
      const cancelButton = screen.getByText('Annuler');
      await userEvent.click(cancelButton);
      
      expect(screen.queryByText('Confirmer la déconnexion')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('displays error message when fetch fails', async () => {
      const mockError = mockApiResponses.error(500, 'Internal server error');
      ContactsService.getContacts.mockRejectedValue(mockError);
      ApiHandleError.mockReturnValue('Erreur lors du chargement des contacts');
      
      renderWithRouter(<Contacts />);
      
      await waitFor(() => {
        expect(screen.getByText('Erreur lors du chargement des contacts')).toBeInTheDocument();
      });
    });

    test('handles 401/403 errors by showing error message', async () => {
      const mockError = mockApiResponses.error(401, 'Unauthorized');
      ContactsService.getContacts.mockRejectedValue(mockError);
      
      renderWithRouter(<Contacts />);
      
      await waitFor(() => {
        expect(screen.getByText('Erreur lors du chargement des contacts')).toBeInTheDocument();
      });
    });
  });

  describe('Phone Number Validation', () => {
    test('shows character count for phone input', async () => {
      ContactsService.getContacts.mockResolvedValue({ contacts: [] });
      renderWithRouter(<Contacts />);
      
      await waitFor(() => {
        expect(screen.getByText('Ajouter mon premier contact')).toBeInTheDocument();
      });
      
      const addButton = screen.getByText('Ajouter mon premier contact');
      await userEvent.click(addButton);
      
      const phoneInput = screen.getByLabelText(/téléphone/i);
      await userEvent.type(phoneInput, '1234567890');
      
      expect(screen.getByText('10/20 chiffres')).toBeInTheDocument();
    });

    test('shows validation message for invalid phone length', async () => {
      ContactsService.getContacts.mockResolvedValue({ contacts: [] });
      renderWithRouter(<Contacts />);
      
      await waitFor(() => {
        expect(screen.getByText('Ajouter mon premier contact')).toBeInTheDocument();
      });
      
      const addButton = screen.getByText('Ajouter mon premier contact');
      await userEvent.click(addButton);
      
      const phoneInput = screen.getByLabelText(/téléphone/i);
      await userEvent.type(phoneInput, '123');
      
      expect(screen.getByText('Le numéro doit contenir entre 10 et 20 chiffres')).toBeInTheDocument();
    });
  });
});
