import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, ArrowUpRight } from "lucide-react";

/* ------------------------------------------------------------
   Illustration SVG bleue - Formulaire "Nouveau bien"
------------------------------------------------------------ */
function HeroIllustrationBlue() {
  return (
    <svg
      viewBox="0 0 480 360"
      className="w-full h-auto"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cardGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset="100%" stopColor="#dbeafe" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="ctaGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
      </defs>

      {/* Fond global */}
      <rect x="0" y="0" width="480" height="360" rx="32" fill="#f8fafc" />

      {/* Halo de fond derrière la carte */}
      <ellipse
        cx="290"
        cy="210"
        rx="170"
        ry="120"
        fill="#dbeafe"
        opacity="0.3"
      />

      {/* Maison / immeuble à gauche de la carte */}
      <g
        transform="translate(40, 130)"
        fill="none"
        stroke="#1e40af"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* sol */}
        <line x1="0" y1="90" x2="120" y2="90" />
        {/* corps maison */}
        <rect
          x="18"
          y="40"
          width="60"
          height="48"
          rx="6"
          fill="#e0edff"
          stroke="#1e40af"
        />
        {/* toit */}
        <path d="M14 42 L48 18 L82 42" fill="#dbeafe" />
        {/* porte */}
        <rect
          x="44"
          y="58"
          width="16"
          height="30"
          rx="4"
          fill="#f9fafb"
          stroke="#1e40af"
        />
        {/* poignée */}
        <circle cx="56" cy="73" r="1.5" fill="#1e40af" />
        {/* fenêtre gauche */}
        <rect
          x="24"
          y="52"
          width="12"
          height="10"
          rx="2"
          fill="#f9fafb"
          stroke="#1e40af"
        />
        {/* fenêtre droite */}
        <rect
          x="74"
          y="52"
          width="12"
          height="10"
          rx="2"
          fill="#f9fafb"
          stroke="#1e40af"
        />
        {/* petite plante */}
        <path
          d="M6 88 C6 80 4 72 0 66"
          fill="none"
          stroke="#1e40af"
        />
        <path
          d="M0 66 C6 64 10 60 12 54 C6 54 2 58 0 62"
          fill="#bfdbfe"
        />
      </g>

      {/* Carte formulaire "Nouveau bien" */}
      <g transform="translate(150, 50)">
        {/* ombre */}
        <rect
          x="16"
          y="20"
          width="280"
          height="220"
          rx="22"
          fill="#c7d2fe"
          opacity="0.35"
        />
        {/* carte */}
        <rect
          x="0"
          y="0"
          width="280"
          height="220"
          rx="22"
          fill="url(#cardGradient)"
          stroke="#cbd5f5"
          strokeWidth="2"
        />

        {/* barre titre */}
        <rect
          x="18"
          y="18"
          width="120"
          height="20"
          rx="10"
          fill="#1f2937"
          opacity="0.9"
        />
        {/* petit pictogramme maison dans le titre */}
        <path
          d="M26 28 L32 24 L38 28 V34 H30 V30"
          fill="none"
          stroke="#e5f0ff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* barre titre - texte simulé */}
        <rect
          x="42"
          y="24"
          width="80"
          height="6"
          rx="3"
          fill="#e5f0ff"
        />

        {/* onglets en haut à droite */}
        <rect x="160" y="18" width="32" height="18" rx="9" fill="url(#accentGradient)" />
        <rect x="198" y="18" width="24" height="18" rx="9" fill="#e5e7eb" />
        <rect x="228" y="18" width="24" height="18" rx="9" fill="#e5e7eb" opacity="0.8" />

        {/* section type de bien */}
        <rect x="18" y="56" width="80" height="8" rx="4" fill="#9ca3af" />
        {/* boutons radio "Appartement / Maison" */}
        <rect x="18" y="72" width="96" height="18" rx="9" fill="#f9fafb" />
        <rect x="120" y="72" width="96" height="18" rx="9" fill="#eef2ff" />
        <circle cx="30" cy="81" r="6" fill="none" stroke="#2563eb" strokeWidth="2" />
        <circle cx="30" cy="81" r="3" fill="#2563eb" />
        <circle cx="132" cy="81" r="6" fill="none" stroke="#9ca3af" strokeWidth="1.5" />

        {/* champs : Titre du bien / Référence */}
        <rect x="18" y="100" width="156" height="16" rx="8" fill="#ffffff" />
        <rect x="188" y="100" width="74" height="16" rx="8" fill="#ffffff" />

        {/* champ : Adresse */}
        <rect x="18" y="128" width="244" height="16" rx="8" fill="#ffffff" />

        {/* champs : Loyer / Charges */}
        <rect x="18" y="156" width="110" height="16" rx="8" fill="#ffffff" />
        <rect x="152" y="156" width="110" height="16" rx="8" fill="#ffffff" />

        {/* bas de carte : boutons */}
        <rect
          x="18"
          y="186"
          width="80"
          height="22"
          rx="11"
          fill="#e5e7eb"
        />
        <rect
          x="134"
          y="186"
          width="128"
          height="22"
          rx="11"
          fill="url(#ctaGradient)"
        />
        {/* texte simulé sur bouton principal */}
        <rect
          x="150"
          y="194"
          width="70"
          height="6"
          rx="3"
          fill="#f0fdf4"
          opacity="0.95"
        />
      </g>

      {/* Badge rond "proprio" en bas à droite de la carte */}
      <g transform="translate(380, 260)">
        <circle cx="0" cy="0" r="30" fill="#e0f2fe" />
        <circle
          cx="0"
          cy="0"
          r="28"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="2"
        />
        {/* visage simple */}
        <circle cx="0" cy="-7" r="8" fill="#ffffff" stroke="#1d4ed8" strokeWidth="2" />
        <path
          d="M -4 -9 q4 -4 8 0"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M -3 -5 q3 3 6 0"
          fill="none"
          stroke="#1d4ed8"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* buste */}
        <path
          d="M -11 5 a11 9 0 0 1 22 0 v4 a4 4 0 0 1 -4 4 h-14 a4 4 0 0 1 -4 -4 z"
          fill="#bfdbfe"
          stroke="#1d4ed8"
          strokeWidth="2"
        />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------
                     COMPOSANT HERO
------------------------------------------------------------ */

export function Hero() {
  return (
    <section className="relative py-10 md:py-12 lg:py-16 overflow-hidden">
      {/* Fond bleu doux sur toute la largeur */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-50 via-sky-50/70 to-white" />

      {/* Contenu centré dans la grille */}
      <div className="container">
        {/* Ligne d'avis tout en haut, centrée comme Rentila */}
        <div className="mb-6 flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
            {[
              "Tellement utile et pratique !",
              "Incontournable pour le bailleur",
              "Logiciel merveilleux !",
            ].map((txt, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, k) => (
                    <Star key={k} className="h-4 w-4 fill-yellow-400" />
                  ))}
                </div>
                <span className="font-medium">{txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contenu principal : texte + illustration */}
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] items-center">
          {/* COLONNE GAUCHE */}
          <div className="space-y-8">
            {/* Tag compteur */}
            <div className="inline-flex items-center gap-3 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-900">
              <div className="flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-white">
                <ArrowUpRight className="h-3 w-3" />
                <span>1 250</span>
              </div>
              <span>propriétaires béninois inscrits ce mois-ci !</span>
            </div>

            {/* Titre */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold max-w-xl leading-tight">
              Gérez vos biens immobiliers avec le{" "}
              <span className="relative text-primary home-hero-underline-one">
                meilleur logiciel gratuit
              </span>{" "}
              de gestion locative immobilière
            </h1>

            {/* Description */}
            <p className="text-base text-muted-foreground md:text-lg max-w-xl">
              GestiLoc est le meilleur logiciel de gestion locative immobilière en
              ligne. Suivi des loyers et charges, comptabilité, aide à la
              déclaration des revenus fonciers… Toutes les étapes de la vie du
              contrat de location sont couvertes par notre plateforme.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
              <Button asChild size="lg" className="text-base px-8">
                <Link to="/register">Ouvrir un compte gratuit</Link>
              </Button>

              <p className="text-sm text-muted-foreground">
                Déjà client ?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Cliquez ici
                </Link>
              </p>
            </div>

            {/* App Stores */}
            <div className="flex flex-wrap items-center gap-4 pt-4 text-sm text-muted-foreground">
              <span>Disponible sur</span>

              <a className="h-9 rounded-md border bg-background px-3 flex items-center shadow-sm">
                <span className="text-xs font-medium">App Store</span>
              </a>

              <div className="h-5 w-px bg-border/70" />

              <a className="h-9 rounded-md border bg-background px-3 flex items-center shadow-sm">
                <span className="text-xs font-medium">Google Play</span>
              </a>
            </div>
          </div>

          {/* COLONNE DROITE : ILLUSTRATION AGRANDIE */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute -top-10 -left-8 h-32 w-32 bg-primary/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-16 -right-10 h-44 w-44 bg-blue-100/70 blur-3xl rounded-full" />

            <div className="relative w-full max-w-xl lg:max-w-2xl translate-y-2">
              <HeroIllustrationBlue />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
