import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import Login from '../../pages/Login';
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

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form with all elements', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByText('Retour à l\'accueil')).toBeInTheDocument();
    expect(screen.getByText('Pas encore de compte ?')).toBeInTheDocument();
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
  });

  test('renders Font Awesome icons', () => {
    renderWithRouter(<Login />);
    
    const envelopeIcon = document.querySelector('.fa-envelope');
    const lockIcon = document.querySelector('.fa-lock');
    const signInIcon = document.querySelector('.fa-sign-in-alt');
    
    expect(envelopeIcon).toBeInTheDocument();
    expect(lockIcon).toBeInTheDocument();
    expect(signInIcon).toBeInTheDocument();
  });

  test('updates form data when input values change', async () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  test('shows loading state when submitting', async () => {
    AuthService.login.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    expect(screen.getByText('Connexion...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('calls AuthService.login with correct data on form submission', async () => {
    AuthService.login.mockResolvedValue({ token: 'mock-token' });
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    expect(AuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  test('navigates to contacts page on successful login', async () => {
    AuthService.login.mockResolvedValue({ token: 'mock-token' });
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/contacts');
    });
  });

  test('displays error message on login failure', async () => {
    const mockError = { response: { status: 401, data: { message: 'Invalid credentials' } } };
    AuthService.login.mockRejectedValue(mockError);
    ApiHandleError.mockReturnValue('Email ou mot de passe incorrect.');
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect.')).toBeInTheDocument();
    });
    
    expect(ApiHandleError).toHaveBeenCalledWith(mockError);
  });

  test('trims email input before submission', async () => {
    AuthService.login.mockResolvedValue({ token: 'mock-token' });
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    
    await userEvent.type(emailInput, '  test@example.com  ');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);
    
    expect(AuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  test('clears error message when form is resubmitted', async () => {
    const mockError = { response: { status: 401, data: { message: 'Invalid credentials' } } };
    AuthService.login
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({ token: 'mock-token' });
    ApiHandleError.mockReturnValue('Email ou mot de passe incorrect.');
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    
    // First submission - fails
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Email ou mot de passe incorrect.')).toBeInTheDocument();
    });
    
    // Second submission - succeeds
    await userEvent.clear(emailInput);
    await userEvent.clear(passwordInput);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'correctpassword');
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Email ou mot de passe incorrect.')).not.toBeInTheDocument();
    });
  });

  test('has correct form validation attributes', () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
  });

  test('has correct placeholder text', () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    
    expect(emailInput).toHaveAttribute('placeholder', 'votre.email@exemple.com');
    expect(passwordInput).toHaveAttribute('placeholder', 'Votre mot de passe');
  });
});
