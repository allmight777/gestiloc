import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/api';

/**
 * Hook pour vérifier périodiquement le statut de l'utilisateur
 * Si le compte est suspendu/désactivé, l'utilisateur est déconnecté
 */
export const useCheckUserStatus = () => {
  const navigate = useNavigate();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        // Récupérer le profil utilisateur à jour
        const userProfile = await authService.getProfile();
        
        // Si le statut n'est pas actif, rediriger
        if (userProfile?.status && userProfile.status !== 'active') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/account-suspended', { replace: true });
          
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } catch (error) {
        // Silencieusement continuer en cas d'erreur
        console.debug('Vérification du statut de l\'utilisateur échouée', error);
      }
    };

    // Vérifier immédiatement
    checkStatus();

    // Vérifier toutes les 30 secondes (changement immédiat quand désactivé par un admin)
    intervalRef.current = setInterval(checkStatus, 30 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [navigate]);
};

