// Features images are now used instead of icon components
import { motion } from 'framer-motion';

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-white">
      {/* Section Header and Steps */}
      <div className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              GestiLoc vous assiste avec votre gestion locative au Bénin
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Le site automatise la création de vos quittances et contrats de location confirmés à la législation béninoise. Pour chaque contrat de location, les loyers et les quittances électroniques sont générés automatiquement chaque mois.
            </p>
          </div>

          {/* Comment ça marche ? Section */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-12 italic">
              Comment ça marche ?
            </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="border-2 border-green-100 rounded-lg p-8 bg-green-50 text-center relative">
              <span className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 rounded-full bg-green-400 text-white font-bold text-lg">1</span>
              <img 
                src="/Ressource_gestiloc/creer_un_bien.png" 
                alt="Créer un bien" 
                className="h-32 mx-auto mb-4 object-contain"
              />
              <h4 className="font-semibold text-gray-800 mb-2">Créer un bien</h4>
              <p className="text-sm text-gray-700">Ajoutez vos propriétés immobilières en quelques clics</p>
            </div>

            {/* Step 2 */}
            <div className="border-2 border-orange-100 rounded-lg p-8 bg-orange-50 text-center relative">
              <span className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 rounded-full bg-orange-400 text-white font-bold text-lg">2</span>
              <img 
                src="/Ressource_gestiloc/creer_une_location.png" 
                alt="Créer une location" 
                className="h-32 mx-auto mb-4 object-contain"
              />
              <h4 className="font-semibold text-gray-800 mb-2">Créer un locataire</h4>
              <p className="text-sm text-gray-700">Enregistrez les informations de vos locataires</p>
            </div>

            {/* Step 3 */}
            <div className="border-2 border-purple-100 rounded-lg p-8 bg-purple-50 text-center relative">
              <span className="absolute top-4 left-4 flex items-center justify-center w-12 h-12 rounded-full bg-purple-400 text-white font-bold text-lg">3</span>
              <img 
                src="/Ressource_gestiloc/creer_un_locataire.png" 
                alt="Créer une location" 
                className="h-32 mx-auto mb-4 object-contain"
              />
              <h4 className="font-semibold text-gray-800 mb-2">Ouvrir une location</h4>
              <p className="text-sm text-gray-700">Créez les contrats et lancez la gestion</p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Gestion locative automatisée et Paiement Section - Full Width Background */}
      <div 
        className="w-full py-16 md:py-24 text-center"
        style={{
          background: "linear-gradient(161.4deg, rgba(206, 255, 174, 0.74) 0.53%, rgba(212, 255, 124, 0.71) 31.93%, rgba(248, 255, 151, 0.87) 73.31%, rgba(255, 213, 124, 0.87) 99.47%)"
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 
            className="mb-2"
            style={{
              fontFamily: "Lora, serif",
              fontWeight: 600,
              fontStyle: "italic",
              fontSize: "16px",
              letterSpacing: "-0.17px",
              lineHeight: "100%"
            }}
          >
            <span className="text-2xl font-bold text-gray-900">Gestion locative </span>
            <span className="text-2xl font-bold" style={{ color: "#83C757" }}>automatisée</span>
          </h3>
          <p className="text-gray-600 mb-12">Conforme à la législation béninoise</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {/* Quittances */}
            <div className="flex flex-col items-center">
              <img 
                src="/Ressource_gestiloc/quittances.png" 
                alt="Quittances" 
                className="h-20 mb-3 object-contain"
              />
              <p className="font-semibold text-gray-800">Quittances</p>
            </div>

            {/* Contrats */}
            <div className="flex flex-col items-center">
              <img 
                src="/Ressource_gestiloc/contrats.png" 
                alt="Contrats" 
                className="h-20 mb-3 object-contain"
              />
              <p className="font-semibold text-gray-800">Contrats</p>
            </div>

            {/* Loyers */}
            <div className="flex flex-col items-center">
              <img 
                src="/Ressource_gestiloc/creer_un_locataire.png" 
                alt="Loyers" 
                className="h-20 mb-3 object-contain"
              />
              <p className="font-semibold text-gray-800">Loyers</p>
            </div>

            {/* Rappels */}
            <div className="flex flex-col items-center">
              <img 
                src="/Ressource_gestiloc/rappels.png" 
                alt="Rappels" 
                className="h-20 mb-3 object-contain"
              />
              <p className="font-semibold text-gray-800">Rappels</p>
            </div>
          </div>

          {/* Payment Section - Inside same container */}
          <div className="border-t border-gray-300 pt-16 pb-4">
            <h3 
              className="text-center mb-8"
              style={{
                fontFamily: "Lora, serif",
                fontWeight: 600,
                fontStyle: "italic",
                fontSize: "13px",
                letterSpacing: "-0.17px",
                lineHeight: "100%"
              }}
            >
              <span className="text-gray-800">Paiement sécurisé </span>
              <span style={{ color: "#9B7FE8" }}>Mobile Money & Carte Bancaire</span>
            </h3>

            <div className="flex flex-wrap justify-center items-center gap-16 md:gap-24">
              {/* MTN */}
              <div className="flex items-center">
                <img 
                  src="/Ressource_gestiloc/MTN 1.png" 
                  alt="MTN" 
                  className="h-12 object-contain"
                />
              </div>

              {/* Moov */}
              <div className="flex items-center">
                <img 
                  src="/Ressource_gestiloc/Moov 1.png" 
                  alt="Moov" 
                  className="h-12 object-contain"
                />
              </div>

              {/* Celtis */}
              <div className="flex items-center">
                <img 
                  src="/Ressource_gestiloc/celtis.png" 
                  alt="Celtis" 
                  className="h-12 object-contain"
                />
              </div>

              {/* Master Card */}
              <div className="flex items-center">
                <img 
                  src="/Ressource_gestiloc/master_card.png" 
                  alt="Master Card" 
                  className="h-12 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rest of Content - Back to max-w-7xl */}
      <div className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Rating Section - 4.8 Stars */}
        <div className="flex flex-col items-center justify-center py-16 md:py-20">
          <h2 
            className="text-6xl md:text-7xl font-bold mb-4"
            style={{ color: '#9B7FE8' }}
          >
            4.8
          </h2>
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-6 h-6 md:w-8 md:h-8"
                style={{ color: '#FCD34D' }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm md:text-base text-gray-700 font-medium">1000+ utilisateurs</p>
        </div>

        {/* Pourquoi choisir GestiLoc Section */}
        <motion.div 
          className="mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir GestiLoc ?
            </h3>
          </div>

          {/* Features Grid - 3x4 layout */}
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {/* Card 1 - Compte sécurisé */}
            <motion.div 
              className="flex flex-col items-center rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow"
              style={{ border: '2px solid #1B8C52' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img 
                src="/Ressource_gestiloc/secure-folder.png" 
                alt="Compte sécurisé" 
                className="h-24 mb-4 object-contain"
              />
              <h4 className="font-semibold text-gray-900 text-center mb-2">Compte sécurisé 24h/24 et 7j/7</h4>
              <p className="text-sm text-gray-600 text-center">Sécurité maximale pour vos données</p>
            </motion.div>

            {/* Card 2 - Baux pré-remplis */}
            <motion.div 
              className="flex flex-col items-center rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow"
              style={{ border: '2px solid #1B8C52' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img 
                src="/Ressource_gestiloc/baux_pré_remplie.png" 
                alt="Baux pré-remplis" 
                className="h-24 mb-4 object-contain"
              />
              <h4 className="font-semibold text-gray-900 text-center mb-2">Modèles de baux pré-remplis</h4>
              <p className="text-sm text-gray-600 text-center">Baux, quittances, remplissage légal normalisé</p>
            </motion.div>

            {/* Card 3 - Quittances automatisées */}
            <motion.div 
              className="flex flex-col items-center rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow"
              style={{ border: '2px solid #1B8C52' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img 
                src="/Ressource_gestiloc/Quittance_automautomatisée.png" 
                alt="Quittances automatisées" 
                className="h-24 mb-4 object-contain"
              />
              <h4 className="font-semibold text-gray-900 text-center mb-2">Quittances automatisées</h4>
              <p className="text-sm text-gray-600 text-center">Génération automatique chaque mois</p>
            </motion.div>

            {/* Card 4 - Régularisation des charges */}
            <motion.div 
              className="flex flex-col items-center rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow"
              style={{ border: '2px solid #1B8C52' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img 
                src="/Ressource_gestiloc/regularisation.png" 
                alt="Régularisation" 
                className="h-24 mb-4 object-contain"
              />
              <h4 className="font-semibold text-gray-900 text-center mb-2">Régularisation des charges</h4>
              <p className="text-sm text-gray-600 text-center">Gestion automatique des charges</p>
            </motion.div>

            {/* Card 5 - Statistiques */}
            <motion.div 
              className="flex flex-col items-center rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow"
              style={{ border: '2px solid #1B8C52' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img 
                src="/Ressource_gestiloc/statistiques.png" 
                alt="Statistiques" 
                className="h-24 mb-4 object-contain"
              />
              <h4 className="font-semibold text-gray-900 text-center mb-2">Statistiques & indicateurs</h4>
              <p className="text-sm text-gray-600 text-center">Suivi en temps réel de vos biens</p>
            </motion.div>

            {/* Card 6 - Révision de loyers */}
            <motion.div 
              className="flex flex-col items-center rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow"
              style={{ border: '2px solid #1B8C52' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img 
                src="/Ressource_gestiloc/Revision loyer.png" 
                alt="Révision de loyers" 
                className="h-24 mb-4 object-contain"
              />
              <h4 className="font-semibold text-gray-900 text-center mb-2">Révision de loyers</h4>
              <p className="text-sm text-gray-600 text-center">Gestion automatique des révisions</p>
            </motion.div>

            {/* Card 7 - Travaux et interventions */}
            <motion.div 
              className="flex flex-col items-center rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow"
              style={{ border: '2px solid #1B8C52' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img 
                src="/Ressource_gestiloc/Taux_Interventions.png" 
                alt="Taux interventions" 
                className="h-24 mb-4 object-contain"
              />
              <h4 className="font-semibold text-gray-900 text-center mb-2">Travaux et interventions</h4>
              <p className="text-sm text-gray-600 text-center">Gestion complète des interventions</p>
            </motion.div>

            {/* Card 8 - Comptabilité */}
            <motion.div 
              className="flex flex-col items-center rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow"
              style={{ border: '2px solid #1B8C52' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img 
                src="/Ressource_gestiloc/comptabilitées.png" 
                alt="Comptabilité" 
                className="h-24 mb-4 object-contain"
                style={{ width: '168px', height: '168px' }}
              />
              <h4 
                className="text-center mb-2"
                style={{
                  fontFamily: 'Manrope',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '100%',
                  letterSpacing: '-0.17px',
                  color: '#111827'
                }}
              >
                Comptabilité et exportations (CSV, PDF, Excel)
              </h4>
              <p className="text-sm text-gray-600 text-center">Export automatisé de vos données</p>
            </motion.div>

            {/* Card 9 - État des lieux */}
            <motion.div 
              className="flex flex-col items-center rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow"
              style={{ border: '2px solid #1B8C52' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img 
                src="/Ressource_gestiloc/etat_lieux_1.png" 
                alt="État des lieux entrée" 
                className="h-24 mb-4 object-contain"
              />
              <h4 className="font-semibold text-gray-900 text-center mb-2">État des lieux & inventaires</h4>
              <p className="text-sm text-gray-600 text-center">Documentation avec rapports automatiques</p>
            </motion.div>

            {/* Card 10 - Messagerie */}
            <motion.div 
              className="flex flex-col items-center rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow"
              style={{ border: '2px solid #1B8C52' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img 
                src="/Ressource_gestiloc/Circled Envelope.png" 
                alt="Messagerie" 
                className="h-24 mb-4 object-contain"
              />
              <h4 
                className="text-center mb-2"
                style={{
                  fontFamily: 'Manrope',
                  fontWeight: 600,
                  fontSize: '20px',
                  lineHeight: '100%',
                  letterSpacing: '-0.17px',
                  color: '#111827'
                }}
              >
                Messagerie et notifications
              </h4>
              <p className="text-sm text-gray-600 text-center">Échanges sécurisés avec notifications</p>
            </motion.div>

            {/* Card 11 - Coffre-fort documents */}
            <motion.div 
              className="flex flex-col items-center rounded-2xl p-6 hover:shadow-lg transition-shadow"
              style={{ backgroundColor: '#9747FFB0', border: '2px solid #1B8C52' }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <img 
                src="/Ressource_gestiloc/secure-folder.png" 
                alt="Dossiers sécurisés" 
                className="h-24 mb-4 object-contain"
              />
              <h4 
                className="text-center mb-2"
                style={{
                  fontFamily: 'Manrope',
                  fontWeight: 600,
                  fontSize: '20px',
                  lineHeight: '100%',
                  letterSpacing: '-0.17px',
                  color: '#1B8C52'
                }}
              >
                Coffre-fort documents
              </h4>
              <p 
                className="text-center"
                style={{
                  fontFamily: 'Manrope',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '100%',
                  letterSpacing: '-0.17px',
                  color: '#1B8C52'
                }}
              >
                Stockage sécurisé et accessible
              </p>
            </motion.div>

            {/* Card 12 - Locations & Saisonnières */}
            <motion.div 
              className="rounded-2xl overflow-hidden hover:shadow-lg transition-shadow relative group flex flex-col items-center justify-center p-6 min-h-[250px]"
              style={{ 
                border: '2px solid #1B8C52',
                backgroundImage: 'url(/Ressource_gestiloc/location_saisonnièere.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors rounded-2xl" />
              <div className="relative z-10 text-center">
                <h4 className="font-bold text-white text-xl">Locations & Saisonnières</h4>
                <p className="text-white/90 text-sm mt-2">Gestion des locations courtes durées</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
        </div>
      </div>
    </section>
  );
}
