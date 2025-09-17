import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Register from '../../pages/Register';
import AuthService from '../../services/AuthService';
import ApiHandleError from '../../utils/ApiHandleError';

// Mock dependencies
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

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders register form with all elements', () => {
    renderWithRouter(<Register />);
    
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /créer le compte/i })).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithRouter(<Register />);
    
    expect(screen.getByText('Retour à l\'accueil')).toBeInTheDocument();
    expect(screen.getByText('Déjà un compte ?')).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });

  test('renders Font Awesome icons', () => {
    renderWithRouter(<Register />);
    
    const envelopeIcon = document.querySelector('.fa-envelope');
    const lockIcon = document.querySelector('.fa-lock');
    const userPlusIcon = document.querySelector('.fa-user-plus');
    
    expect(envelopeIcon).toBeInTheDocument();
    expect(lockIcon).toBeInTheDocument();
    expect(userPlusIcon).toBeInTheDocument();
  });

  test('updates form data when input values change', async () => {
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('shows loading state when submitting', async () => {
    AuthService.register.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /créer le compte/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    expect(screen.getByText('Inscription...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('calls AuthService.register with correct data on form submission', async () => {
    AuthService.register.mockResolvedValue({ message: 'User registered successfully' });
    
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /créer le compte/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    expect(AuthService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  test('shows success modal on successful registration', async () => {
    AuthService.register.mockResolvedValue({ message: 'User registered successfully' });
    
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /créer le compte/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Compte créé avec succès !')).toBeInTheDocument();
      expect(screen.getByText(/Votre compte a été créé avec succès/)).toBeInTheDocument();
    });
  });

  test('navigates to login page when success modal OK is clicked', async () => {
    AuthService.register.mockResolvedValue({ message: 'User registered successfully' });
    
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /créer le compte/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Compte créé avec succès !')).toBeInTheDocument();
    });
    
    const okButton = screen.getByRole('button', { name: /ok/i });
    await userEvent.click(okButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('displays error message on registration failure', async () => {
    const mockError = { response: { status: 409, data: { message: 'Email already exists' } } };
    AuthService.register.mockRejectedValue(mockError);
    ApiHandleError.mockReturnValue('Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse email.');
    
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /créer le compte/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse email.')).toBeInTheDocument();
    });
    
    expect(ApiHandleError).toHaveBeenCalledWith(mockError);
  });

  test('validates password length and shows error for short password', async () => {
    
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /créer le compte/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, '12'); // Too short
    await userEvent.click(submitButton);
    
    expect(screen.getByText('Le mot de passe doit contenir au moins 3 caractères.')).toBeInTheDocument();
    expect(AuthService.register).not.toHaveBeenCalled();
  });

  test('allows password with 3 or more characters', async () => {
    AuthService.register.mockResolvedValue({ message: 'User registered successfully' });
    
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /créer le compte/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, '123'); // Exactly 3 characters
    await userEvent.click(submitButton);
    
    expect(AuthService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: '123'
    });
  });

  test('has correct form validation attributes', () => {
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });

  test('has correct placeholder text', () => {
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    
    expect(emailInput).toHaveAttribute('placeholder', 'votre.email@exemple.com');
    expect(passwordInput).toHaveAttribute('placeholder', 'Au moins 3 caractères');
  });

  test('success modal has correct structure and icons', async () => {
    AuthService.register.mockResolvedValue({ message: 'User registered successfully' });
    
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /créer le compte/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Compte créé avec succès !')).toBeInTheDocument();
    });
    
    // Check for success modal elements
    expect(document.querySelector('.modal-overlay')).toBeInTheDocument();
    expect(document.querySelector('.success-modal')).toBeInTheDocument();
    expect(document.querySelector('.success-content')).toBeInTheDocument();
    expect(document.querySelector('.fa-check-circle')).toBeInTheDocument();
    expect(document.querySelector('.fa-check')).toBeInTheDocument();
  });

  test('clears error message when form is resubmitted', async () => {
    const mockError = { response: { status: 409, data: { message: 'Email already exists' } } };
    AuthService.register
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({ message: 'User registered successfully' });
    ApiHandleError.mockReturnValue('Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse email.');
    
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /créer le compte/i });
    
    // First submission - fails
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse email.')).toBeInTheDocument();
    });
    
    // Second submission - succeeds
    await userEvent.clear(emailInput);
    await userEvent.clear(passwordInput);
    await userEvent.type(emailInput, 'new@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse email.')).not.toBeInTheDocument();
    });
  });
});
