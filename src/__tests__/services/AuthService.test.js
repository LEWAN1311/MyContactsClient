import AuthService from '../../services/AuthService';
import AxiosInstance from '../../api/AxiosInstance';
import { mockLocalStorage, mockApiResponses } from '../utils/testUtils';

// Mock AxiosInstance
jest.mock('../../api/AxiosInstance');

describe('AuthService', () => {
  let mockStorage;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock localStorage
    mockStorage = mockLocalStorage();
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true
    });
  });

  describe('login', () => {
    test('should login successfully and store token and user data', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        data: {
          token: 'mock-jwt-token',
          user: { id: '1', email: 'test@example.com', firstName: 'Test' }
        }
      };

      AxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AuthService.login(credentials);

      expect(AxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(mockStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-jwt-token');
      expect(mockStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(mockResponse.data.user));
      expect(result).toEqual(mockResponse.data);
    });

    test('should login successfully without user data', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        data: {
          token: 'mock-jwt-token'
        }
      };

      AxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AuthService.login(credentials);

      expect(AxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(mockStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-jwt-token');
      expect(mockStorage.setItem).not.toHaveBeenCalledWith('userData', expect.any(String));
      expect(result).toEqual(mockResponse.data);
    });

    test('should login successfully without token', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = {
        data: {
          message: 'Login successful'
        }
      };

      AxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AuthService.login(credentials);

      expect(AxiosInstance.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(mockStorage.setItem).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse.data);
    });

    test('should throw error when login fails', async () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      const mockError = mockApiResponses.error(401, 'Invalid credentials');

      AxiosInstance.post.mockRejectedValue(mockError);

      await expect(AuthService.login(credentials)).rejects.toEqual(mockError);
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    test('should register successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      const mockResponse = {
        data: {
          message: 'User registered successfully',
          user: { id: '1', email: 'john@example.com' }
        }
      };

      AxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await AuthService.register(userData);

      expect(AxiosInstance.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
    });

    test('should throw error when registration fails', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      const mockError = mockApiResponses.error(409, 'Email already exists');

      AxiosInstance.post.mockRejectedValue(mockError);

      await expect(AuthService.register(userData)).rejects.toEqual(mockError);
    });
  });

  describe('isAuthenticated', () => {
    test('should return true when token exists', () => {
      mockStorage.getItem.mockReturnValue('mock-token');

      const result = AuthService.isAuthenticated();

      expect(mockStorage.getItem).toHaveBeenCalledWith('authToken');
      expect(result).toBe(true);
    });

    test('should return false when token does not exist', () => {
      mockStorage.getItem.mockReturnValue(null);

      const result = AuthService.isAuthenticated();

      expect(mockStorage.getItem).toHaveBeenCalledWith('authToken');
      expect(result).toBe(false);
    });

    test('should return false when token is empty string', () => {
      mockStorage.getItem.mockReturnValue('');

      const result = AuthService.isAuthenticated();

      expect(mockStorage.getItem).toHaveBeenCalledWith('authToken');
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    test('should return parsed user data when userData exists', () => {
      const userData = { id: '1', email: 'test@example.com', firstName: 'Test' };
      mockStorage.getItem.mockReturnValue(JSON.stringify(userData));

      const result = AuthService.getCurrentUser();

      expect(mockStorage.getItem).toHaveBeenCalledWith('userData');
      expect(result).toEqual(userData);
    });

    test('should return null when userData does not exist', () => {
      mockStorage.getItem.mockReturnValue(null);

      const result = AuthService.getCurrentUser();

      expect(mockStorage.getItem).toHaveBeenCalledWith('userData');
      expect(result).toBeNull();
    });

    test('should return null when userData is empty string', () => {
      mockStorage.getItem.mockReturnValue('');

      const result = AuthService.getCurrentUser();

      expect(mockStorage.getItem).toHaveBeenCalledWith('userData');
      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    test('should remove authToken and userData from localStorage', () => {
      AuthService.logout();

      expect(mockStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('userData');
    });
  });
});
