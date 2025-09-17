import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock all page components
jest.mock('../pages/Home', () => {
  return function MockHome() {
    return <div data-testid="home-page">Home Page</div>;
  };
});

jest.mock('../pages/Login', () => {
  return function MockLogin() {
    return <div data-testid="login-page">Login Page</div>;
  };
});

jest.mock('../pages/Register', () => {
  return function MockRegister() {
    return <div data-testid="register-page">Register Page</div>;
  };
});

jest.mock('../pages/Contacts', () => {
  return function MockContacts() {
    return <div data-testid="contacts-page">Contacts Page</div>;
  };
});

// Mock Font Awesome
jest.mock('@fortawesome/fontawesome-free/css/all.min.css', () => ({}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => children,
  MemoryRouter: ({ children }) => children,
  Routes: ({ children }) => children,
  Route: ({ children }) => children
}));

describe('App Component', () => {
  test('renders without crashing', () => {
    const App = require('../App').default;
    render(<App />);
    
    // Just check if the App component renders without crashing
    const appDiv = document.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });

  test('has correct CSS class structure', () => {
    const App = require('../App').default;
    render(<App />);
    
    const appDiv = document.querySelector('.App');
    expect(appDiv).toBeInTheDocument();
  });
});
