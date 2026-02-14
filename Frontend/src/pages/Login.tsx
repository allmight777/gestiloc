import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authService } from '@/services/api';

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const handleLogin = async (data: LoginFormData) => {
    setError('');
    try {
      setIsLoading(true);

      const response = await authService.login(data.email, data.password);
      
      if (response && response.data && response.data.user) {
        const { user } = response.data;
        toast.success('Connexion réussie !');
        
        // Stocker le token et les informations utilisateur
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Vérifier les rôles disponibles
        const roles = user.roles || [];
        
        // Déterminer la route de redirection en fonction du rôle
        let redirectPath = '/';
        let userRole = '';
        
        // Vérifier d'abord si admin
        if (roles.includes('admin')) {
          redirectPath = '/admin';
          userRole = 'admin';
        } 
        // Ensuite vérifier si propriétaire/bailleur
        else if (roles.includes('landlord') || roles.includes('proprietaire')) {
          redirectPath = '/proprietaire';
          userRole = 'proprietaire';
        } 
        // Enfin, par défaut, rediriger vers l'espace locataire
        else if (roles.includes('tenant') || roles.includes('locataire')) {
          redirectPath = '/locataire';
          userRole = 'locataire';
        }
        
        // Mettre à jour le rôle de l'utilisateur dans le stockage local
        const updatedUser = { ...user, role: userRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Rediriger vers la page appropriée
        navigate(redirectPath, { replace: true });
        
      } else {
        throw new Error('Réponse du serveur invalide');
      }
      
    } catch (error: unknown) {
      console.error('Erreur de connexion :', error);
      let errorMessage = 'Email ou mot de passe incorrect';

      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } }; request?: unknown; message?: string };

      if (err.response) {
        if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data?.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join('\n');
        }
      } else if (err.request) {
        errorMessage = 'Le serveur ne répond pas. Vérifiez votre connexion.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 
            className="text-center"
            style={{
              fontFamily: 'Merriweather',
              fontWeight: 700,
              fontStyle: 'Bold',
              fontSize: '36px',
              lineHeight: '100%',
              letterSpacing: '-0.17px',
              verticalAlign: 'middle',
              color: '#529D21'
            }}
          >
            GestiLoc
          </h1>
          <p className="text-gray-600">Gestion Immobilière Intelligente</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Connexion
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </Label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.fr"
                  {...loginForm.register("email")}
                  className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </Label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...loginForm.register("password")}
                  className="pl-10 pr-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        {/* Retour à l'accueil */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-blue-600 text-sm font-medium"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}
