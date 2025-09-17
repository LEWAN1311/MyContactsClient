import ContactsService from '../../services/ContactsService';
import AxiosInstance from '../../api/AxiosInstance';
import { mockContacts, mockContact, mockApiResponses } from '../utils/testUtils';

// Mock AxiosInstance
jest.mock('../../api/AxiosInstance');

describe('ContactsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getContacts', () => {
    test('should fetch contacts successfully', async () => {
      const mockResponse = {
        data: { contacts: mockContacts }
      };

      AxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await ContactsService.getContacts();

      expect(AxiosInstance.get).toHaveBeenCalledWith('/contacts');
      expect(result).toEqual({ contacts: mockContacts });
    });

    test('should handle empty contacts response', async () => {
      const mockResponse = {
        data: { contacts: [] }
      };

      AxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await ContactsService.getContacts();

      expect(AxiosInstance.get).toHaveBeenCalledWith('/contacts');
      expect(result).toEqual({ contacts: [] });
    });

    test('should throw error when fetch fails', async () => {
      const mockError = mockApiResponses.error(500, 'Internal server error');

      AxiosInstance.get.mockRejectedValue(mockError);

      await expect(ContactsService.getContacts()).rejects.toEqual(mockError);
    });
  });

  describe('create', () => {
    test('should create contact successfully', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        email: 'john@example.com'
      };
      const mockResponse = {
        data: { ...mockContact, ...contactData }
      };

      AxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await ContactsService.create(contactData);

      expect(AxiosInstance.post).toHaveBeenCalledWith('/contacts', contactData);
      expect(result).toEqual(mockResponse.data);
    });

    test('should throw error when creation fails with 409 (duplicate)', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        email: 'john@example.com'
      };
      const mockError = mockApiResponses.error(409, 'Phone number already exists');

      AxiosInstance.post.mockRejectedValue(mockError);

      await expect(ContactsService.create(contactData)).rejects.toEqual(mockError);
    });

    test('should throw error when creation fails with 400 (validation)', async () => {
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '123', // Invalid phone
        email: 'john@example.com'
      };
      const mockError = mockApiResponses.error(400, 'Phone number must be between 10 and 20 digits');

      AxiosInstance.post.mockRejectedValue(mockError);

      await expect(ContactsService.create(contactData)).rejects.toEqual(mockError);
    });
  });

  describe('update', () => {
    test('should update contact successfully', async () => {
      const contactId = '123';
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        email: 'john@example.com'
      };
      const mockResponse = {
        data: { ...mockContact, ...contactData, _id: contactId }
      };

      AxiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await ContactsService.update(contactId, contactData);

      expect(AxiosInstance.patch).toHaveBeenCalledWith(`/contacts/${contactId}`, contactData);
      expect(result).toEqual(mockResponse.data);
    });

    test('should throw error when update fails with 404 (not found)', async () => {
      const contactId = 'nonexistent';
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        email: 'john@example.com'
      };
      const mockError = mockApiResponses.error(404, 'Contact not found');

      AxiosInstance.patch.mockRejectedValue(mockError);

      await expect(ContactsService.update(contactId, contactData)).rejects.toEqual(mockError);
    });

    test('should throw error when update fails with 409 (duplicate)', async () => {
      const contactId = '123';
      const contactData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        email: 'john@example.com'
      };
      const mockError = mockApiResponses.error(409, 'Phone number already exists');

      AxiosInstance.patch.mockRejectedValue(mockError);

      await expect(ContactsService.update(contactId, contactData)).rejects.toEqual(mockError);
    });
  });

  describe('delete', () => {
    test('should delete contact successfully', async () => {
      const contactId = '123';
      const mockResponse = {
        data: { message: 'Contact deleted successfully' }
      };

      AxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await ContactsService.delete(contactId);

      expect(AxiosInstance.delete).toHaveBeenCalledWith(`/contacts/${contactId}`);
      expect(result).toEqual(mockResponse.data);
    });

    test('should throw error when deletion fails with 404 (not found)', async () => {
      const contactId = 'nonexistent';
      const mockError = mockApiResponses.error(404, 'Contact not found');

      AxiosInstance.delete.mockRejectedValue(mockError);

      await expect(ContactsService.delete(contactId)).rejects.toEqual(mockError);
    });

    test('should throw error when deletion fails with 403 (forbidden)', async () => {
      const contactId = '123';
      const mockError = mockApiResponses.error(403, 'Forbidden');

      AxiosInstance.delete.mockRejectedValue(mockError);

      await expect(ContactsService.delete(contactId)).rejects.toEqual(mockError);
    });
  });

  describe('Network Error Handling', () => {
    test('should handle network error in getContacts', async () => {
      const networkError = mockApiResponses.networkError();

      AxiosInstance.get.mockRejectedValue(networkError);

      await expect(ContactsService.getContacts()).rejects.toEqual(networkError);
    });

    test('should handle network error in create', async () => {
      const contactData = { firstName: 'John', lastName: 'Doe' };
      const networkError = mockApiResponses.networkError();

      AxiosInstance.post.mockRejectedValue(networkError);

      await expect(ContactsService.create(contactData)).rejects.toEqual(networkError);
    });

    test('should handle network error in update', async () => {
      const contactId = '123';
      const contactData = { firstName: 'John', lastName: 'Doe' };
      const networkError = mockApiResponses.networkError();

      AxiosInstance.patch.mockRejectedValue(networkError);

      await expect(ContactsService.update(contactId, contactData)).rejects.toEqual(networkError);
    });

    test('should handle network error in delete', async () => {
      const contactId = '123';
      const networkError = mockApiResponses.networkError();

      AxiosInstance.delete.mockRejectedValue(networkError);

      await expect(ContactsService.delete(contactId)).rejects.toEqual(networkError);
    });
  });
});
