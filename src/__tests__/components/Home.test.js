import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../../pages/Home';

// Mock Font Awesome
jest.mock('@fortawesome/fontawesome-free/css/all.min.css', () => ({}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
}));

describe('Home Component', () => {
  test('renders home page with title and tagline', () => {
    render(<Home />);
    
    expect(screen.getByText('MyContacts')).toBeInTheDocument();
    expect(screen.getByText('Gérez vos contacts en toute simplicité')).toBeInTheDocument();
  });

  test('renders welcome section', () => {
    render(<Home />);
    
    expect(screen.getByText('Bienvenue dans votre carnet de contacts personnel')).toBeInTheDocument();
    expect(screen.getByText(/Organisez, gérez et retrouvez facilement tous vos contacts/)).toBeInTheDocument();
  });

  test('renders login and register buttons', () => {
    render(<Home />);
    
    const loginButton = screen.getByText('Se connecter');
    const registerButton = screen.getByText('Créer un compte');
    
    expect(loginButton).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();
  });

  test('login button has correct link and content', () => {
    render(<Home />);
    
    const loginButton = screen.getByText('Se connecter').closest('a');
    expect(loginButton).toHaveAttribute('href', '/login');
    expect(screen.getByText('J\'ai déjà un compte')).toBeInTheDocument();
  });

  test('register button has correct link and content', () => {
    render(<Home />);
    
    const registerButton = screen.getByText('Créer un compte').closest('a');
    expect(registerButton).toHaveAttribute('href', '/register');
    expect(screen.getByText('Je suis nouveau utilisateur')).toBeInTheDocument();
  });

  test('renders features section', () => {
    render(<Home />);
    
    expect(screen.getByText('Fonctionnalités principales')).toBeInTheDocument();
    expect(screen.getByText('Gestion complète')).toBeInTheDocument();
    expect(screen.getByText('Sécurisé')).toBeInTheDocument();
  });

  test('renders feature descriptions', () => {
    render(<Home />);
    
    expect(screen.getByText('Ajoutez, modifiez et organisez vos contacts')).toBeInTheDocument();
    expect(screen.getByText('Vos données sont protégées et privées')).toBeInTheDocument();
  });

  test('renders Font Awesome icons', () => {
    render(<Home />);
    
    // Check for Font Awesome icon classes
    const addressBookIcon = document.querySelector('.fa-address-book');
    const signInIcon = document.querySelector('.fa-sign-in-alt');
    const userPlusIcon = document.querySelector('.fa-user-plus');
    const clipboardIcon = document.querySelector('.fa-clipboard-list');
    const shieldIcon = document.querySelector('.fa-shield-alt');
    
    expect(addressBookIcon).toBeInTheDocument();
    expect(signInIcon).toBeInTheDocument();
    expect(userPlusIcon).toBeInTheDocument();
    expect(clipboardIcon).toBeInTheDocument();
    expect(shieldIcon).toBeInTheDocument();
  });

  test('has correct CSS classes', () => {
    render(<Home />);
    
    const homeContainer = document.querySelector('.home-container');
    const homeContent = document.querySelector('.home-content');
    const homeHeader = document.querySelector('.home-header');
    const logo = document.querySelector('.logo');
    const homeMain = document.querySelector('.home-main');
    const featuresSection = document.querySelector('.features-section');
    
    expect(homeContainer).toBeInTheDocument();
    expect(homeContent).toBeInTheDocument();
    expect(homeHeader).toBeInTheDocument();
    expect(logo).toBeInTheDocument();
    expect(homeMain).toBeInTheDocument();
    expect(featuresSection).toBeInTheDocument();
  });

  test('renders all action buttons with correct structure', () => {
    render(<Home />);
    
    const actionButtons = document.querySelectorAll('.action-button');
    expect(actionButtons).toHaveLength(2);
    
    const loginButton = document.querySelector('.login-button');
    const registerButton = document.querySelector('.register-button');
    
    expect(loginButton).toBeInTheDocument();
    expect(registerButton).toBeInTheDocument();
  });

  test('renders features grid with correct structure', () => {
    render(<Home />);
    
    const featuresGrid = document.querySelector('.features-grid');
    const featureItems = document.querySelectorAll('.feature-item');
    
    expect(featuresGrid).toBeInTheDocument();
    expect(featureItems).toHaveLength(2);
  });
});
