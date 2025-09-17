import React from 'react';
import { render } from '@testing-library/react';

// Mock localStorage
export const mockLocalStorage = () => {
  const store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};

// Mock axios
export const mockAxios = () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };
  return mockAxiosInstance;
};

// Custom render function with router
export const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui);
};

// Mock contact data
export const mockContact = {
  _id: '123',
  firstName: 'John',
  lastName: 'Doe',
  phone: '1234567890',
  email: 'john.doe@example.com'
};

export const mockContacts = [
  mockContact,
  {
    _id: '456',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '0987654321',
    email: 'jane.smith@example.com'
  }
];

// Mock user data
export const mockUser = {
  _id: 'user123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User'
};

// Mock API responses
export const mockApiResponses = {
  success: (data) => ({ data, status: 200 }),
  error: (status, message) => ({
    response: {
      status,
      data: { message }
    }
  }),
  networkError: () => ({
    request: {},
    message: 'Network Error'
  })
};

// Wait for async operations
export const waitFor = (callback, options = {}) => {
  return new Promise((resolve, reject) => {
    const timeout = options.timeout || 1000;
    const startTime = Date.now();
    
    const check = () => {
      try {
        callback();
        resolve();
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout after ${timeout}ms`));
        } else {
          setTimeout(check, 10);
        }
      }
    };
    
    check();
  });
};

// Add a simple test to make this file a valid test suite
describe('Test Utils', () => {
  test('should export utility functions', () => {
    expect(typeof mockLocalStorage).toBe('function');
    expect(typeof mockAxios).toBe('function');
    expect(typeof renderWithRouter).toBe('function');
    expect(typeof mockContact).toBe('object');
    expect(typeof mockContacts).toBe('object');
    expect(typeof mockApiResponses).toBe('object');
  });
});
