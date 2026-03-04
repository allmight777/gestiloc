import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Mail,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Users
} from 'lucide-react';
import { Button } from '../../Proprietaire/components/ui/Button';

const PRIMARY_COLOR = "#70AE48";

export const CoOwnerActivation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError("Lien d'activation invalide. Paramètres manquants.");
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token, email]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.password) {
      setError('Le mot de passe est requis');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/co-owner/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      });

      // ✅ Lire la réponse une seule fois en texte brut
      const text = await response.text();
      let data: any = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          // La réponse n'est pas du JSON valide
          console.error('Réponse non-JSON reçue:', text);
        }
      }

      // ✅ Si la réponse HTTP n'est pas OK, afficher l'erreur sans rediriger
      if (!response.ok) {
        // Chercher le message d'erreur dans toutes les structures possibles de Laravel
        const message =
          data?.message ||
          data?.errors?.token?.[0] ||
          data?.errors?.email?.[0] ||
          data?.errors?.phone?.[0] ||
          data?.errors?.general?.[0] ||
          data?.errors?.database?.[0] ||
          `Erreur serveur (${response.status}). Veuillez réessayer.`;

        setError(message);
        return; // ← STOP, on ne redirige pas
      }

      // ✅ La réponse est OK mais on vérifie qu'un token est bien présent
      // ce qui confirme que le compte a vraiment été créé en base
      if (!data || !data.token) {
        setError(
          data?.message ||
          'Erreur lors de la création du compte. Veuillez réessayer ou contacter le support.'
        );
        return; // ← STOP, on ne redirige pas
      }

      // ✅ Succès confirmé par le serveur : on stocke les infos et on redirige
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      setSuccess(true);

      setTimeout(() => {
        navigate('/coproprietaire/dashboard');
      }, 2500);

    } catch (err) {
      // Erreur réseau (pas de connexion, CORS, etc.)
      console.error('Erreur réseau:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Erreur réseau. Vérifiez votre connexion et réessayez.'
      );
    } finally {
      setLoading(false);
    }
  };

  const buttonStyle = { backgroundColor: PRIMARY_COLOR, color: 'white' };
  const linkStyle = { color: PRIMARY_COLOR };

  // ─── États de chargement initial ───────────────────────────────────────────
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto"
            style={{ borderColor: PRIMARY_COLOR }}
          />
          <p className="mt-4 text-slate-600">Vérification du lien...</p>
        </motion.div>
      </div>
    );
  }

  // ─── Lien invalide ──────────────────────────────────────────────────────────
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mx-auto mb-6"
            >
              <AlertCircle className="w-10 h-10 text-red-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">Lien invalide</h1>
            <p className="text-slate-600 mb-8">
              {error || "Ce lien d'activation n'est pas valide ou a expiré."}
            </p>
            <Button
              onClick={() => navigate('/login')}
              style={buttonStyle}
              className="w-full h-12 text-base font-medium border-0"
            >
              Retour à la connexion
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Succès ─────────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">Compte activé !</h1>
            <p className="text-slate-600 mb-6">
              Votre compte co-propriétaire a été créé avec succès.
              Vous allez être redirigé vers votre tableau de bord...
            </p>
            <div className="flex justify-center">
              <div
                className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2"
                style={{ borderColor: PRIMARY_COLOR }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Formulaire principal ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <motion.div
          className="text-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: PRIMARY_COLOR }}>
            Gestiloc
          </h1>
          <p className="text-sm text-slate-600 max-w-xs mx-auto">
            Créer de meilleures relations entre les propriétaires et les locataires !
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
        >
          {/* En-tête */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-center mb-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4"
              style={{ backgroundColor: `${PRIMARY_COLOR}20` }}
            >
              <Users className="w-8 h-8" style={{ color: PRIMARY_COLOR }} />
            </motion.div>

            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Activation du compte
            </h1>
            <p className="text-slate-600">
              Créez votre mot de passe pour activer votre compte co-propriétaire
            </p>

            {email && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <p className="text-sm text-slate-600 flex items-center justify-center">
                  <Mail className="w-4 h-4 mr-2" style={{ color: PRIMARY_COLOR }} />
                  <span className="font-medium">{email}</span>
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Message d'erreur */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3"
              >
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Mot de passe */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: formData.password ? PRIMARY_COLOR : undefined,
                    ['--tw-ring-color' as any]: `${PRIMARY_COLOR}20`,
                  }}
                  placeholder="•••••••••"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Minimum 8 caractères</p>
            </motion.div>

            {/* Confirmation mot de passe */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.password_confirmation}
                  onChange={e => handleInputChange('password_confirmation', e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{
                    borderColor: formData.password_confirmation ? PRIMARY_COLOR : undefined,
                    ['--tw-ring-color' as any]: `${PRIMARY_COLOR}20`,
                  }}
                  placeholder="•••••••••"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </motion.div>

            {/* Bouton submit */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-medium relative overflow-hidden border-0"
                style={buttonStyle}
              >
                <motion.div
                  className="flex items-center justify-center gap-2"
                  animate={loading ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 1.5, repeat: loading ? Infinity : 0 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      <span>Activation en cours...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Activer mon compte</span>
                    </>
                  )}
                </motion.div>
              </Button>
            </motion.div>
          </form>

          {/* Lien connexion */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <p className="text-sm text-slate-600">
              Vous avez déjà un compte ?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-medium hover:underline"
                style={linkStyle}
                type="button"
              >
                Se connecter
              </button>
            </p>
          </motion.div>
        </motion.div>

        {/* Retour accueil */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm hover:text-[#70AE48] font-medium transition-colors text-slate-500"
            type="button"
          >
            ← Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};