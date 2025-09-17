const ApiHandleError = (error) => {
    if (!error) {
        return 'Une erreur inattendue s\'est produite.';
    }
    
    if (error.response) {
        
        // Erreurs HTTP
        switch (error.response.status) {
            case 400:
                const errorMessage = error.response.data?.message || '';
                
                if (errorMessage.toLowerCase().includes('phone') || 
                    errorMessage.toLowerCase().includes('téléphone') ||
                    (errorMessage.toLowerCase().includes('10') && errorMessage.toLowerCase().includes('20'))) {
                    return 'Le numéro de téléphone doit contenir entre 10 et 20 chiffres.';
                }
                return errorMessage || 'Données invalides. Vérifiez vos informations.';
            case 401:
                return 'Non autorisé. Veuillez vous reconnecter.';
            case 403:
                return 'Session expirée. Veuillez vous reconnecter.';
            case 404:
                return 'Ressource non trouvée.';
            case 405:
                return 'Email ou mot de passe incorrect.';
            case 409:
                const conflictErrorMessage = error.response.data?.message || '';

                if (conflictErrorMessage === 'Email already exists' || 
                    conflictErrorMessage.toLowerCase().includes('email') && 
                    conflictErrorMessage.toLowerCase().includes('already exists')) {
                    return 'Cette adresse email est déjà utilisée. Veuillez utiliser une autre adresse email.';
                }
                return conflictErrorMessage || 'Cette ressource existe déjà.';
            case 500:
                return 'Une erreur est survenue. Réessayez plus tard.';
            default:
                return error.response.data?.message || 'Une erreur est survenue.';
        }
    } else if (error.request) {
        return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    } else if (error.code === 'ECONNABORTED') {
        return 'La requête a pris trop de temps. Réessayez.';
    } else {
        return 'Une erreur inattendue s\'est produite.';
    }

}

export default ApiHandleError;