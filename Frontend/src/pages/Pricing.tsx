import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const plans = [
  {
    name: "Starter",
    price: "0 FCFA",
    period: "/mois",
    description: "Parfait pour débuter",
    features: [
      "Jusqu'à 3 biens",
      "Gestion des baux et locataires",
      "Quittances automatiques",
      "États des lieux numériques",
      "Support par email",
    ],
    cta: "Commencer gratuitement",
    popular: false,
  },
  {
    name: "Pro",
    price: "15 000 FCFA",
    period: "/mois",
    description: "Pour les bailleurs actifs",
    features: [
      "Biens illimités",
      "Toutes les fonctionnalités Starter",
      "Synchronisation bancaire",
      "Révision de loyer automatique",
      "Régularisation des charges",
      "Comptabilité complète",
      "Support prioritaire",
    ],
    cta: "Essayer 30 jours gratuits",
    popular: true,
  },
  {
    name: "Business",
    price: "50 000 FCFA",
    period: "/mois",
    description: "Pour les professionnels",
    features: [
      "Tout du plan Pro",
      "Multi-utilisateurs (jusqu'à 10)",
      "API & intégrations avancées",
      "Rapports personnalisés",
      "Formation dédiée",
      "Account manager dédié",
    ],
    cta: "Contacter l'équipe",
    popular: false,
  },
];

const faqs = [
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer: "Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. Les changements prennent effet immédiatement.",
  },
  {
    question: "Y a-t-il un engagement de durée ?",
    answer: "Non, tous nos plans sont sans engagement. Vous pouvez annuler votre abonnement à tout moment.",
  },
  {
    question: "Proposez-vous une période d'essai ?",
    answer: "Oui, le plan Starter est gratuit sans limite de durée. Les plans Pro et Business bénéficient d'un essai gratuit de 30 jours.",
  },
  {
    question: "Quels sont les moyens de paiement acceptés ?",
    answer: "Nous acceptons le Mobile Money (MTN, Moov, Celtiis, Wave) ainsi que les cartes bancaires Visa et Mastercard.",
  },
  {
    question: "Comment fonctionne le paiement par Mobile Money ?",
    answer: "Sélectionnez votre opérateur (MTN, Moov, Celtiis ou Wave), composez le code sur votre téléphone, validez avec votre PIN et recevez une confirmation par SMS. C'est simple et 100% sécurisé.",
  },
];

export default function Pricing() {
  return (
    <div className="pb-16">
      <section className="container py-16 md:py-24 text-center">
        <h1 className="text-4xl font-bold mb-4 md:text-5xl">
          Tarifs simples et transparents
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choisissez le plan qui correspond à vos besoins. Sans engagement, changez quand vous voulez.
        </p>
      </section>

      <div className="container pb-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.popular ? "border-2 border-primary shadow-lg scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit">
                  <div className="rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                    Le plus populaire
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link to="/register">{plan.cta}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <section className="container py-16">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                Paiement Mobile Money au Bénin
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Payez facilement et en toute sécurité avec votre téléphone mobile
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-background p-6 rounded-xl border text-center hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-primary mb-2">MTN</div>
                <p className="text-xs text-muted-foreground">MTN Mobile Money</p>
              </div>
              <div className="bg-background p-6 rounded-xl border text-center hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-primary mb-2">Moov</div>
                <p className="text-xs text-muted-foreground">Moov Money</p>
              </div>
              <div className="bg-background p-6 rounded-xl border text-center hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-primary mb-2">Celtiis</div>
                <p className="text-xs text-muted-foreground">Celtiis Cash</p>
              </div>
              <div className="bg-background p-6 rounded-xl border text-center hover:shadow-md transition-shadow">
                <div className="text-3xl font-bold text-primary mb-2">Wave</div>
                <p className="text-xs text-muted-foreground">Wave Mobile</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-background p-6 rounded-xl border">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  Comment payer ?
                </h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">1.</span>
                    <span>Choisissez votre forfait (Pro ou Business)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">2.</span>
                    <span>Sélectionnez votre opérateur Mobile Money</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">3.</span>
                    <span>Composez le code USSD sur votre téléphone</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">4.</span>
                    <span>Validez avec votre code PIN</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-semibold text-primary">5.</span>
                    <span>Recevez la confirmation par SMS</span>
                  </li>
                </ol>
              </div>

              <div className="bg-background p-6 rounded-xl border">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  100% Sécurisé
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Transactions cryptées et sécurisées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Aucune donnée bancaire stockée</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Confirmation instantanée par SMS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Support client disponible 7j/7</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="container py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Questions fréquentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="container">
        <Card className="bg-gradient-subtle text-center p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-4">
            Besoin d'une offre sur-mesure ?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Pour les agences immobilières et grands portefeuilles, nous proposons des solutions personnalisées.
          </p>
          <Button asChild size="lg">
            <Link to="/contact">Nous contacter</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
