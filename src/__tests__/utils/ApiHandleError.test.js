import ApiHandleError from '../../utils/ApiHandleError';

describe('ApiHandleError', () => {
  describe('HTTP Response Errors', () => {
    test('should handle 400 error with phone validation message', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Phone number must be between 10 and 20 digits' }
        }
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Le numéro de téléphone doit contenir entre 10 et 20 chiffres.');
    });

    test('should handle 400 error with generic message', () => {
      const error = {
        response: {
          status: 400,
          data: { message: 'Invalid input data' }
        }
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Invalid input data');
    });

    test('should handle 400 error with no message', () => {
      const error = {
        response: {
          status: 400,
          data: {}
        }
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Données invalides. Vérifiez vos informations.');
    });

    test('should handle 401 error', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' }
        }
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Non autorisé. Veuillez vous reconnecter.');
    });

    test('should handle 403 error', () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' }
        }
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Session expirée. Veuillez vous reconnecter.');
    });

    test('should handle 404 error', () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' }
        }
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Ressource non trouvée.');
    });

    test('should handle 405 error', () => {
      const error = {
        response: {
          status: 405,
          data: { message: 'Method not allowed' }
        }
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Email ou mot de passe incorrect.');
    });

    test('should handle 409 error with email already exists', () => {
      const error = {
        response: {
          status: 409,
          data: { message: 'Email already exists' }
        }
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse email.');
    });

    test('should handle 409 error with generic conflict message', () => {
      const error = {
        response: {
          status: 409,
          data: { message: 'Resource already exists' }
        }
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Resource already exists');
    });

    test('should handle 500 error', () => {
      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Une erreur est survenue. Réessayez plus tard.');
    });

    test('should handle unknown status code with message', () => {
      const error = {
        response: {
          status: 418,
          data: { message: 'I\'m a teapot' }
        }
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('I\'m a teapot');
    });

    test('should handle unknown status code without message', () => {
      const error = {
        response: {
          status: 418,
          data: {}
        }
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Une erreur est survenue.');
    });
  });

  describe('Network Errors', () => {
    test('should handle request error (no response)', () => {
      const error = {
        request: {},
        message: 'Network Error'
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Impossible de contacter le serveur. Vérifiez votre connexion.');
    });

    test('should handle timeout error', () => {
      const error = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('La requête a pris trop de temps. Réessayez.');
    });

    test('should handle unexpected error', () => {
      const error = {
        message: 'Something went wrong'
      };
      
      const result = ApiHandleError(error);
      expect(result).toBe('Une erreur inattendue s\'est produite.');
    });
  });

  describe('Edge Cases', () => {
    test('should handle null error', () => {
      const result = ApiHandleError(null);
      expect(result).toBe('Une erreur inattendue s\'est produite.');
    });

    test('should handle undefined error', () => {
      const result = ApiHandleError(undefined);
      expect(result).toBe('Une erreur inattendue s\'est produite.');
    });

    test('should handle error with no response or request', () => {
      const error = {};
      const result = ApiHandleError(error);
      expect(result).toBe('Une erreur inattendue s\'est produite.');
    });
  });
});
