import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FeatureMockup } from "@/components/tour/FeatureMockup";
import {
  Building2,
  Users,
  FileText,
  Calculator,
  TrendingUp,
  Landmark,
  BarChart3,
  ClipboardCheck,
  Wrench,
  MessageSquare,
  Calendar,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Gestion des biens",
    description: "Centralisez tous vos biens immobiliers avec leurs caractéristiques détaillées : adresse, type, surface, équipements, charges...",
    benefits: [
      "Fiches biens complètes avec photos",
      "Historique des locations et travaux",
      "Documents associés (diagnostics, assurances)",
      "Suivi des équipements et maintenances",
    ],
    mockupType: 'properties' as const,
  },
  {
    icon: Users,
    title: "Dossiers locataires",
    description: "Gérez vos locataires et leurs dossiers en toute conformité avec la réglementation.",
    benefits: [
      "Coordonnées et pièces d'identité",
      "Informations sur les garants",
      "Historique de paiements",
      "Documents et attestations",
    ],
    mockupType: 'tenants' as const,
  },
  {
    icon: FileText,
    title: "Baux & annexes",
    description: "Créez des baux conformes à la loi avec tous les modèles nécessaires pré-remplis.",
    benefits: [
      "Modèles pour nu, meublé, parking, commercial",
      "Génération automatique depuis vos données",
      "État des lieux et inventaires intégrés",
      "Signature électronique disponible",
    ],
    mockupType: 'lease' as const,
  },
  {
    icon: Calculator,
    title: "Loyers & quittances",
    description: "Automatisez l'émission et le suivi de vos quittances de loyer.",
    benefits: [
      "Génération automatique mensuelle",
      "Envoi par email ou courrier",
      "Suivi des paiements et impayés",
      "Relances automatiques",
    ],
    mockupType: 'rent' as const,
  },
  {
    icon: TrendingUp,
    title: "Révision de loyer",
    description: "Calculez automatiquement les révisions annuelles avec les indices IRL ou ILC.",
    benefits: [
      "Calcul automatique selon l'indice",
      "Rappels avant la date de révision",
      "Historique des révisions",
      "Génération des courriers de notification",
    ],
    mockupType: 'revision' as const,
  },
  {
    icon: Landmark,
    title: "Synchronisation bancaire",
    description: "Connectez vos comptes bancaires et automatisez le rapprochement des loyers.",
    benefits: [
      "Récupération automatique des transactions",
      "Rapprochement intelligent des paiements",
      "Vision consolidée de votre trésorerie",
      "Alertes sur les écarts",
    ],
    mockupType: 'bank' as const,
  },
  {
    icon: BarChart3,
    title: "Comptabilité & fiscalité",
    description: "Suivez vos revenus et charges avec une comptabilité simplifiée.",
    benefits: [
      "Tableau de bord avec KPIs",
      "Rapports personnalisables",
      "Exports comptables (CSV, Excel, PDF)",
      "Préparation déclaration fiscale",
    ],
    mockupType: 'accounting' as const,
  },
  {
    icon: ClipboardCheck,
    title: "États des lieux",
    description: "Réalisez des états des lieux détaillés directement depuis votre smartphone.",
    benefits: [
      "Modèles structurés par pièce",
      "Photos et vidéos illimitées",
      "Relevés de compteurs",
      "Signature électronique",
    ],
    mockupType: 'inspection' as const,
  },
  {
    icon: Wrench,
    title: "Interventions & travaux",
    description: "Gérez les demandes d'intervention et suivez les travaux de A à Z.",
    benefits: [
      "Ticket d'intervention du locataire",
      "Attribution aux prestataires",
      "Suivi en temps réel",
      "Historique et coûts",
    ],
    mockupType: 'maintenance' as const,
  },
  {
    icon: MessageSquare,
    title: "Messagerie intégrée",
    description: "Communiquez facilement avec vos locataires et prestataires.",
    benefits: [
      "Conversations par bien ou locataire",
      "Notifications email et push",
      "Pièces jointes",
      "Historique conservé",
    ],
    mockupType: 'messaging' as const,
  },
  {
    icon: Calendar,
    title: "Location saisonnière",
    description: "Module dédié pour gérer vos locations de courte durée.",
    benefits: [
      "Calendrier de disponibilités",
      "Synchronisation iCal (Airbnb, Booking...)",
      "Tarifs variables selon saison",
      "Gestion des réservations",
    ],
    mockupType: 'seasonal' as const,
  },
];

export default function Tour() {
  return (
    <div className="pb-16">
      <section className="bg-background py-16 md:py-24">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-4 md:text-5xl text-primary">
            Toutes les fonctionnalités en détail
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-foreground">
            Découvrez comment GestiLoc simplifie chaque aspect de votre gestion locative
          </p>
        </div>
      </section>

      <div className="container py-16">
        <div className="space-y-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className={`grid gap-12 lg:grid-cols-2 lg:gap-16 items-center ${
                  isEven ? "" : "lg:flex-row-reverse"
                }`}
              >
                <div className={`space-y-6 ${isEven ? "" : "lg:order-2"}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold">{feature.title}</h2>
                  </div>
                  <p className="text-lg text-muted-foreground">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-1 h-5 w-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        </div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={isEven ? "" : "lg:order-1"}>
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
                    <FeatureMockup type={feature.mockupType} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="sticky bottom-0 border-t bg-background/95 backdrop-blur py-4">
        <div className="container flex justify-center">
          <Button asChild size="lg">
            <Link to="/register">Essayer gratuitement</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
