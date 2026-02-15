import { AlertTriangle, Home } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AccountSuspended() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoHome = () => {
    setIsLoading(true)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* En-tête avec gradient */}
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 px-6 py-8 flex flex-col items-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 animate-pulse">
              <AlertTriangle size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-white text-center">
              Compte Suspendu
            </h1>
          </div>

          {/* Contenu */}
          <div className="px-6 py-8 space-y-6">
            <div className="bg-orange-50 dark:bg-slate-700/50 border border-orange-200 dark:border-orange-900/50 rounded-lg px-4 py-4">
              <p className="text-slate-700 dark:text-slate-300 text-center font-medium">
                Votre compte a été suspendu ou désactivé
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    Votre accès à l'application a été restreint pour des raisons de sécurité ou de conformité.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    Veuillez contacter notre équipe d'assistance pour plus d'informations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-600 dark:text-orange-400 font-bold">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    En cliquant sur le bouton ci-dessous, vous serez déconnecté de votre compte.
                  </p>
                </div>
              </div>
            </div>

            {/* Bouton d'action */}
            <button
              onClick={handleGoHome}
              disabled={isLoading}
              className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:scale-100"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirection en cours...
                </>
              ) : (
                <>
                  <Home size={20} />
                  Retourner à l'accueil
                </>
              )}
            </button>

            {/* Lien contact */}
            <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                Des questions ?
              </p>
              <a
                href="mailto:support@gestiloc.com"
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold transition-colors"
              >
                Contactez notre support
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              © 2026 Gestiloc. Tous droits réservés.
            </p>
          </div>
        </div>

        {/* Info supplémentaire */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Si vous pensez qu'il s'agit d'une erreur, veuillez contacter notre équipe d'assistance.
          </p>
        </div>
      </div>
    </div>
  )
}
