import { useNavigate } from "react-router-dom";
import { Users, Apple, Play } from "lucide-react";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/Ressource_gestiloc/bg.png')`,
        }}
      />

      {/* Blur and Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 lg:px-8 py-20">
        <div className="space-y-8 text-center">
          {/* Stats Counter */}
          <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-full shadow-md w-fit mx-auto" style={{ backgroundColor: "#83C75730", color: "#83C757" }}>
            <Users size={20} />
            <p className="font-medium text-base" style={{ fontFamily: "Manrope, sans-serif" }}>
              1 250 propriétaires béninois inscrits ce mois-ci !
            </p>
          </div>

          {/* Main Title */}
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl text-white leading-tight"
            style={{ 
              fontFamily: "Merriweather, serif",
              fontWeight: 700,
              fontStyle: "italic",
              fontSize: "36px",
              letterSpacing: "-0.17px",
              lineHeight: "100%"
            }}
          >
            Gérez vos biens immobiliers
          </h1>

          {/* Subtitle */}
          <p 
            className="text-base md:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            GestiLoc est le meilleur logiciel de gestion locative immobilière en ligne. Suivi des loyers et charges, comptabilité, aide à la déclaration des revenus fonciers… Toutes les étapes de la vie du contrat de location sont couvertes par notre plateforme.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-4 w-fit mx-auto">
            <button
              onClick={() => navigate("/register")}
              className="text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ 
                backgroundColor: "#83C757",
                fontFamily: "Manrope, sans-serif" 
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#75b045";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#83C757";
              }}
            >
              Inscription
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-white hover:bg-gray-50 text-gray-800 px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg border border-gray-300 transition-all"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Connexion
            </button>
          </div>

          {/* Disponible sur Badge */}
          <div 
            className="absolute bottom-6 flex items-center gap-4"
            style={{
              right: "-11.5rem"
            }}
          >
            <p 
              className="text-white"
              style={{
                fontFamily: "Lora, serif",
                fontWeight: 700,
                fontStyle: "italic",
                fontSize: "16px",
                letterSpacing: "-0.17px",
                lineHeight: "100%"
              }}
            >
              Disponible sur
            </p>
            
            <div className="flex gap-3 items-center">
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors text-sm font-medium"
                style={{ fontFamily: "Lora, serif", color: "white" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#83C757"}
                onMouseLeave={(e) => e.currentTarget.style.color = "white"}
              >
                <Apple size={18} />
                <span>App Store</span>
              </a>
              <span className="text-white/50">|</span>
              <a
                href="https://play.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors text-sm font-medium"
                style={{ fontFamily: "Lora, serif", color: "white" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#83C757"}
                onMouseLeave={(e) => e.currentTarget.style.color = "white"}
              >
                <Play size={18} />
                <span>Google Play</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
